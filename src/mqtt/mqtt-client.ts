import { EventEmitter } from 'events';
import { IPublishPacket } from 'mqtt';
import mqtt from 'mqtt';
import { AddressInfo } from 'net';
import winston from 'winston';
import { Disconnect, Flags, Logger, MqttSnGateway, StateTransitionMachine, TopicService } from '..';
import { IMqttBrokerConfig } from '../config';
import { HandlerEvent, State } from '../enums';
import { Constants } from '../constants';
import { MessageChannel } from 'worker_threads';

const logger: winston.Logger = Logger.getLogger('MqttClient');

export abstract class MqttClient {

    public get getState(): State {
        return this.state;
    }

    public get getTopicService(): TopicService {
        return this.topicService;
    }

    protected messageQueue: { resolve?: () => void | PromiseLike<void>, retry?: boolean, topicId?: number, msgId?: number, payload: IPublishPacket }[];
    protected sentDisconnect: boolean;
    protected stateChanged: EventEmitter;

    protected configuration: {
        clientId: string,
        lastWill: {
            flags: Flags,
            topic: string,
            message: string,
        },
    } = {
            clientId: undefined,
            lastWill: {
                flags: undefined,
                topic: undefined,
                message: undefined,
            },
        };

    private currentActions: {
        reconnect: boolean;
        subscribe: boolean;
        unsubscribe: boolean;
        register: boolean;
    } = {
            reconnect: false,
            subscribe: false,
            unsubscribe: false,
            register: false,
        };

    // TODO: Improve?
    private msgId: number = 0;
    private connAcked: boolean;
    private state: State;
    private topicService: TopicService;
    private processingQueue: boolean;
    private timeoutFunction: NodeJS.Timeout;
    private disconnecting: boolean;

    constructor(public addressInfo: AddressInfo, public config: IMqttBrokerConfig) {
        this.stateChanged = new EventEmitter();
        // this.stateChanged.on('stateChanged', this.onStateChanged.bind(this));

        this.disconnecting = false;
        this.state = State.DISCONNECTED;
        this.messageQueue = [];
        this.topicService = new TopicService();
    }

    public updateState(message: Buffer): State {
        const oldState: State = this.state;
        this.state = StateTransitionMachine.getStateTransition(this.state, message);

        if (oldState !== this.state) {
            const sleepDuration: number = this.state === State.ASLEEP
                ? new Disconnect(message).duration
                : undefined;
            this.stateChanged.emit('stateChanged', oldState, this.state, sleepDuration);
        }

        return this.state;
    }

    public abstract async connectImpl(): Promise<void>;
    public abstract async publishImpl(topic: string, message: string | Buffer, flags: Flags): Promise<void | Error>;
    public abstract async subscribeImpl(topic: string): Promise<void | Error>;
    public abstract async unsubscribeImpl(topic: string): Promise<void | Error>;
    public abstract async endImpl(force?: boolean): Promise<void>;

    public async disconnect?(): Promise<void>;

    public set clientId(clientId: string) {
        this.configuration.clientId = clientId;
    }

    public set flags(flags: Flags) {
        this.configuration.lastWill.flags = flags;
    }

    public set lastWillTopic(topic: string) {
        this.configuration.lastWill.topic = topic;
    }

    public set lastWillMessage(message: string) {
        this.configuration.lastWill.message = message;
    }

    private get hasLastWill(): boolean {
        return this.configuration.lastWill.flags !== undefined
            && this.configuration.lastWill.topic !== undefined
            && this.configuration.lastWill.message !== undefined;
    }

    public connect(): void {
        if (!this.currentActions.reconnect) {
            this.connectImpl();
        } else {
            this.onConnect();
        }
    }

    public initiateDisconnect(sleep: boolean = false): void {
        // TODO: Execute last will

        new Promise<void>((resolve) =>
            !sleep && this.hasLastWill
                ? this.publishImpl(this.configuration.lastWill.topic, this.configuration.lastWill.message, this.configuration.lastWill.flags)
                    .then(() =>
                        resolve())
                : resolve()
        ).then(() => {
            this.disconnecting = true;

            if (this.disconnect) {
                this.disconnect();
            }

            if (!sleep) {
                MqttSnGateway.handler(HandlerEvent.ON_DISCONNECT, this);
            } else {
                MqttSnGateway.handler(HandlerEvent.ON_SLEEP, this);
            }
        });

        // if (this.hasLastWill) {
        //     this.publish(this.lastWill.topic, this.lastWill.message, this.lastWill.flags);
        // }

        // this.disconnecting = true;

        // if (this.disconnect) {
        //     this.disconnect();
        // }

        // if (!sleep) {
        //     MqttSnGateway.handler(HandlerEvent.ON_DISCONNECT, this);
        // } else {
        //     MqttSnGateway.handler(HandlerEvent.ON_SLEEP, this);
        // }
    }

    public clearLastWill(): void {
        this.configuration.lastWill.flags = undefined;
        this.configuration.lastWill.topic = undefined;
        this.configuration.lastWill.message = undefined;

        // TODO: Refresh LWT (MQTT) ?
    }

    public get isSubscribing(): boolean {
        return this.currentActions.subscribe;
    }

    public set isSubscribing(subscribing: boolean) {
        this.currentActions.subscribe = subscribing;
    }

    public get isUnsubscribing(): boolean {
        return this.currentActions.unsubscribe;
    }

    public set isUnsubscribing(unsubscribing: boolean) {
        this.currentActions.unsubscribe = unsubscribing;
    }

    public get isRegistering(): boolean {
        return this.currentActions.register;
    }

    public set isRegistering(registering: boolean) {
        this.currentActions.register = registering;
    }

    public get isReconnecting(): boolean {
        return this.currentActions.reconnect;
    }

    public set isReconnecting(reconnecting: boolean) {
        this.currentActions.reconnect = reconnecting;
    }

    private get isReady() {
        return !(this.currentActions.reconnect
            || this.currentActions.register
            || this.currentActions.subscribe
            || this.currentActions.unsubscribe);
    }

    protected async onConnect(): Promise<void> {
        if (!this.isReady && !this.hasLastWill) {
            return;
        }

        // TODO: Avoid memory leak!
        this.stateChanged.on('stateChanged', this.onStateChanged.bind(this));

        this.sentDisconnect = false;
        await MqttSnGateway.handler(HandlerEvent.ON_CONNECT, this);
        this.connAcked = true;
        this.processMessageQueue();
    }

    protected onClose(): void {
        if (!this.sentDisconnect) {
            this.sentDisconnect = true;
            this.connAcked = false;
        }

        if (!this.disconnecting) {
            MqttSnGateway.handler(HandlerEvent.ON_SERVER_DISCONNECT, this);
        }
    }

    protected onError(err: Error): void {
        // TODO: Implement connect error

        logger.error('ERROR', err);
        MqttSnGateway.handler(HandlerEvent.ON_CONNECT_ERROR, this);
    }

    protected onMessage(topic: string, payload: Buffer, packet: mqtt.Packet): void {
        const message: IPublishPacket = packet as IPublishPacket;

        console.log(topic, payload.toString('utf-8'));

        const topicId: number = this.getTopicService.getTopicIdByTopic(topic);

        // TODO: IMPROVE!!!
        const newMsgId: number = this.msgId++;
        this.msgId = newMsgId;

        const isNotAvailable: boolean = this.getState !== State.ACTIVE && this.getState !== State.AWAKE;

        const messageObject: { resolve?: () => void | PromiseLike<void>, retry?: boolean, msgId?: number, topicId?: number, payload: IPublishPacket } = { payload: message };

        if (isNotAvailable || message.qos !== 0) {
            this.messageQueue.push(messageObject);
            logger.debug(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Message queue size: ${this.messageQueue.length}`);
        }

        if (!isNotAvailable || message.qos === 0) {
            this.send(messageObject);
            // MqttSnGateway.onMessage(topic, payload, new Flags({
            //     dup: message.dup,
            //     qos: message.qos,
            //     retain: message.retain,
            // }), topicId, this);
        }
    }

    private async onStateChanged(oldState: State, newState: State, sleepDuration: number | undefined): Promise<void> {
        logger.info(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Entered state ${State[newState]}`);

        if (this.state === State.ASLEEP) {
            this.timeoutFunction = setTimeout(this.clientTimeout.bind(this), sleepDuration * 1000);
            logger.info(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Started sleep timer`);
        } else if (oldState === State.ASLEEP && (this.state === State.ACTIVE || this.state === State.AWAKE)) {
            clearTimeout(this.timeoutFunction);
            logger.info(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Cleared sleep timer`);
            // TODO: onConnect only if preceeding CONNECT msg exists

            await this.processMessageQueue();

            if (this.state === State.AWAKE) {
                MqttSnGateway.handler(HandlerEvent.ON_PINGREQ, this);
            }

            // this.onConnect();
        } else {
            this.processMessageQueue();
        }

        // TODO: Improve!
        if (this.state === State.DISCONNECTED || this.state === State.LOST) {
            // if (this.state === State.ASLEEP || this.state === State.DISCONNECTED || this.state === State.LOST) {
            this.connAcked = false;
        }
    }

    private clientTimeout(): void {
        logger.info(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Client timed out.`);

        // TODO: Unnecessary?
        MqttSnGateway.handler(HandlerEvent.ON_TIMEOUT, this);
    }

    public async processMessageQueue(): Promise<void> {
        if (this.processingQueue || !this.isReady) {
            return;
        }

        this.processingQueue = true;

        while (this.isReady && this.connAcked && (this.state === State.ACTIVE || this.state === State.AWAKE) && this.messageQueue.length > 0) {
            const message: { resolve?: () => void | PromiseLike<void>, retry?: boolean, msgId?: number, topicId?: number, payload: IPublishPacket } = this.messageQueue[0];

            await this.send(message);

            logger.debug(`\t[${this.addressInfo.address}:${this.addressInfo.port}] Message queue size: ${this.messageQueue.length}`);
        }

        this.processingQueue = false;
    }

    public getResolveForMessage(msgId: number, topicId: number): () => void | PromiseLike<void> | undefined {
        const message: {
            resolve?: () => void | PromiseLike<void>, retry?: boolean, msgId?: number, topicId?: number, payload: IPublishPacket
        } | undefined = this.messageQueue.find((m: { resolve?: () => void | PromiseLike<void>, retry?: boolean, msgId?: number, topicId?: number, payload: IPublishPacket }) =>
            m.msgId === msgId && m.topicId === topicId);

        return message && message.resolve
            ? message.resolve
            : undefined;
    }

    private async send(message: { resolve?: () => void | PromiseLike<void>, retry?: boolean, msgId?: number, topicId?: number, payload: IPublishPacket }): Promise<void> {
        MqttSnGateway.onMessage(message.payload.topic,
            message.payload instanceof Buffer
                ? message.payload
                : Buffer.from(message.payload),
            new Flags({
                dup: message.payload.dup,
                qos: message.payload.qos,
                retain: message.payload.retain,
            }),
            message.topicId,
            this,
            message.payload.qos === 0
                ? 0
                : message.msgId);

        if (message.payload.qos === 0) {
            return;
        }

        try {
            await new Promise<void>((resolve, reject) => {
                message.resolve = resolve;
                setTimeout(() => reject('Timeout: No PUBACK received.'), Constants.WAIT_INTERVAL);
            });

            // TOOD: Improve?!
            this.messageQueue.shift();
        } catch (e) {
            // TODO: Something non-stupid...
        }
    }

}
