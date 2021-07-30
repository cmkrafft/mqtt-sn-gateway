import dgram, { Socket } from 'dgram';
import { AddressInfo } from 'net';
import winston from 'winston';
import { MqttBridge, MqttClient, Utils } from '../..';
import { IConfig } from '../../config';
import { HandlerEvent, MsgType, ReturnCode } from '../../enums';
import { ConnAck, Connect, Disconnect, IMessage, PingResp, PubAck, Publish, RegAck, Register, SubAck, Subscribe, UnsubAck, Unsubscribe, WillMsg, WillMsgReq, WillMsgResp, WillMsgUpd, WillTopic, WillTopicReq, WillTopicResp, WillTopicUpd } from '../messages';
import { Bootstrap, Flags, Logger } from '../messages/flags/utils';

const logger: winston.Logger = Logger.getLogger('MqttSnGateway');

export class MqttSnGateway {

    public static async handler(handlerEvent: HandlerEvent, mqttClient: MqttClient): Promise<void> {
        // logger.info(`MQTT-Client-Event: ${HandlerEvent[handlerEvent]}`);

        switch (handlerEvent) {
            case HandlerEvent.ON_CONNECT:
                await MqttSnGateway.self.sendMessage(ConnAck.create({ returnCode: ReturnCode.ACCEPTED }), mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_CONNECT_LAST_WILL_TOPIC:
                await MqttSnGateway.self.sendMessage(WillTopicReq.create({}), mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_CONNECT_LAST_WILL_MESSAGE:
                await MqttSnGateway.self.sendMessage(WillMsgReq.create({}), mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_CONNECT_ERROR:
                await MqttSnGateway.self.sendMessage(ConnAck.create({ returnCode: ReturnCode.REJECTED_NOT_SUPPORTED }), mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_TIMEOUT:
                mqttClient.initiateDisconnect();

                break;
            case HandlerEvent.ON_SLEEP:
                await MqttSnGateway.self.sendMessage(Disconnect.create({}), mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_DISCONNECT:
                await MqttSnGateway.self.sendMessage(Disconnect.create({}), mqttClient.addressInfo);

                mqttClient.endImpl();
                MqttSnGateway.mqttBridge.removeClient(mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_SERVER_DISCONNECT:
                await MqttSnGateway.self.sendMessage(Disconnect.create({}), mqttClient.addressInfo);

                mqttClient.endImpl();
                MqttSnGateway.mqttBridge.removeClient(mqttClient.addressInfo);

                break;
            case HandlerEvent.ON_PINGREQ:
                await MqttSnGateway.self.sendMessage(PingResp.create({}), mqttClient.addressInfo);

                break;
        }
    }

    public static onMessage(topic: string, data: Buffer, flags: Flags, topicId: number, client: MqttClient, msgId: number = 0): void {
        const message: Publish = Publish.create({
            flags,
            topicId,
            msgId,
            data,
        });

        MqttSnGateway.self.sendMessage(message, client.addressInfo);
    }

    private static server: Socket;
    private static self: MqttSnGateway;
    private static mqttBridge: MqttBridge;

    constructor(private config: IConfig) {
        const mqttBridge: MqttBridge = new MqttBridge(this.config.broker, Bootstrap.getMqttClientImplementation(this.config.gateway.mqttClientImplementation));

        MqttSnGateway.self = this;
        MqttSnGateway.mqttBridge = mqttBridge;

        this.startServer();
    }

    private startServer(): void {
        MqttSnGateway.server = dgram.createSocket('udp4');

        MqttSnGateway.server.on('listening', this.onListening.bind(this));
        MqttSnGateway.server.on('error', this.onError.bind(this));
        MqttSnGateway.server.on('message', this.onMessage.bind(this));

        MqttSnGateway.server.bind(this.config.gateway.port, this.config.gateway.address);
    }

    private async handleMessage(buffer: Buffer, addressInfo: AddressInfo): Promise<void> {
        const msgType: MsgType = buffer[1];

        let client: MqttClient = MqttSnGateway.mqttBridge.getClient(addressInfo);

        let updateState: boolean = true;

        switch (msgType) {
            case (MsgType.CONNECT):
                if (client === undefined) {
                    client = MqttSnGateway.mqttBridge.addClient(addressInfo);
                } else {
                    client.isReconnecting = true;
                }

                client.clientId = new Connect(buffer).clientId;

                if (!new Connect(buffer).flags.will) {
                    client.connect();
                } else {
                    // updateState = false;

                    client.clearLastWill();

                    MqttSnGateway.handler(HandlerEvent.ON_CONNECT_LAST_WILL_TOPIC, client);

                    break;
                }

                break;
            case (MsgType.WILLTOPIC):
                const willTopic: WillTopic = new WillTopic(buffer);

                if (willTopic.isEmpty) {
                    client.lastWillMessage = undefined;
                }

                client.lastWillTopic = willTopic.willTopic;
                client.flags = willTopic.flags;

                MqttSnGateway.handler(HandlerEvent.ON_CONNECT_LAST_WILL_MESSAGE, client);

                break;
            case (MsgType.WILLMSG):
                client.lastWillMessage = new WillMsg(buffer).willMsg;

                client.connect();

                client.isReconnecting = false;

                break;
            case (MsgType.REGISTER):
                const register = new Register(buffer);

                if (client.isRegistering) {
                    this.sendMessage(RegAck.create({
                        msgId: register.msgId,
                        returnCode: ReturnCode.REJECTED_CONGESTION,
                        topicId: 0,
                    }), addressInfo);

                    break;
                }

                client.isRegistering = true;

                const topicId: number = client.getTopicService.addTopic(register.topicName);

                this.sendMessage(RegAck.create({
                    msgId: register.msgId,
                    returnCode: ReturnCode.ACCEPTED,
                    topicId,
                }), addressInfo);

                client.isRegistering = false;

                break;
            case (MsgType.DISCONNECT):
                MqttSnGateway.mqttBridge.getClient(addressInfo).initiateDisconnect(new Disconnect(buffer).duration !== undefined);

                break;
            case (MsgType.PUBLISH):
                const publish = new Publish(buffer);

                {
                    const topic: string = client.getTopicService.getTopicByTopicId(publish.topicId);

                    if (!topic) {
                        // TODO: Disconnect.
                        logger.error('Error. Topic must not be unknown.');
                        return;
                    }

                    let returnCode: ReturnCode = ReturnCode.ACCEPTED;

                    try {
                        await client.publishImpl(topic, publish.data, publish.flags);
                    } catch (e) {
                        returnCode = ReturnCode.REJECTED_CONGESTION;
                        logger.error('Could not publish message to MQTT broker.', e);
                    }

                    if (publish.flags.qos > 0) {
                        const puback: PubAck = new PubAck(publish.toBuffer());

                        MqttSnGateway.self.sendMessage(PubAck.create({
                            topicId: puback.topicId,
                            msgId: puback.msgId,
                            returnCode,
                        }), client.addressInfo);
                    }
                }

                break;
            case (MsgType.SUBSCRIBE):
                const subscribe: Subscribe = new Subscribe(buffer);

                if (client.isSubscribing) {
                    this.sendMessage(SubAck.create({
                        flags: new Flags({}),
                        msgId: subscribe.msgId,
                        topicId: 0,
                        returnCode: ReturnCode.REJECTED_CONGESTION,
                    }), addressInfo);

                    break;
                }

                client.isSubscribing = true;

                {
                    const topic: string = typeof subscribe.topic === 'string'
                        ? subscribe.topic
                        : client.getTopicService.getTopicByTopicId(subscribe.topic);

                    let returnCode: ReturnCode = ReturnCode.ACCEPTED;

                    try {
                        await client.subscribeImpl(topic);
                    } catch (e) {
                        returnCode = ReturnCode.REJECTED_CONGESTION;
                    }

                    MqttSnGateway.self.sendMessage(SubAck.create({
                        flags: new Flags(),
                        // TODO: Improve!
                        topicId: typeof subscribe.topic === 'number' ? subscribe.topic : 0,
                        msgId: subscribe.msgId,
                        returnCode,
                    }), client.addressInfo);
                }

                client.isSubscribing = false;

                break;
            case (MsgType.UNSUBSCRIBE):
                const unsubscribe: Unsubscribe = new Unsubscribe(buffer);

                {
                    const topic: string = typeof unsubscribe.topic === 'string'
                        ? unsubscribe.topic
                        : client.getTopicService.getTopicByTopicId(unsubscribe.topic);

                    try {
                        await client.unsubscribeImpl(topic);
                    } catch (e) {
                        // TODO: Handle error
                        logger.error(`An error occured during unsubscribe. ${e}`);
                    }

                    MqttSnGateway.self.sendMessage(UnsubAck.create({
                        msgId: unsubscribe.msgId,
                    }), client.addressInfo);
                }

                break;
            case (MsgType.WILLTOPICUPD):
                const willTopicUpd: WillTopicUpd = new WillTopicUpd(buffer);

                {
                    if (willTopicUpd.isEmpty) {
                        client.clearLastWill();
                    } else {
                        client.flags = willTopicUpd.flags;
                        client.lastWillTopic = willTopicUpd.willTopic;
                    }

                    this.sendMessage(WillTopicResp.create({ returnCode: ReturnCode.ACCEPTED }), client.addressInfo);
                }

                break;
            case (MsgType.WILLMSGUPD):
                const willMsgUpd: WillMsgUpd = new WillMsgUpd(buffer);

                {
                    client.lastWillMessage = willMsgUpd.willMsg;

                    this.sendMessage(WillMsgResp.create({ returnCode: ReturnCode.ACCEPTED }), client.addressInfo);
                }

                break;
            case (MsgType.PINGREQ):
                // TODO: Send queued messages – if any. Send PingResp only if there are no queued messages left.

                break;
            case (MsgType.PUBACK):
                const pubAck: PubAck = new PubAck(buffer);

                {
                    const resolve: () => void | PromiseLike<void> = client.getResolveForMessage(pubAck.msgId, pubAck.topicId);

                    if (resolve) {
                        resolve();
                    } else {
                        logger.warn(`No message to acknowledge with msgId ${pubAck.msgId} and topicId ${pubAck.topicId}.`);
                    }
                }

                break;
            default:
                logger.info(`Unknown: ${MsgType[msgType]}`);
        }

        // TODO: Don't change state to CONNECTED after reconnect, when will is still incomplete
        if (updateState) {
            MqttSnGateway.mqttBridge.getClient(addressInfo).updateState(buffer);
        }
    }

    private async sendMessage(message: IMessage, addressInfo: AddressInfo): Promise<void> {
        const messageBuffer: Buffer = message.toBuffer();

        logger.info(`--->\t[${addressInfo.address}:${addressInfo.port}] ${MsgType[messageBuffer[1]]}\t<${Utils.toHexString(messageBuffer)}>`);

        return new Promise<void>((resolve, reject) => MqttSnGateway.server.send(messageBuffer, addressInfo.port, addressInfo.address, (error: Error, bytes: number) => {
            if (error) {
                logger.error(`Received error: ${error}, Bytes: ${bytes}`);
                reject();
            }

            resolve();
        }));
    }

    private onMessage(buffer: Buffer, addressInfo: AddressInfo): void {
        logger.info(`<---\t[${addressInfo.address}:${addressInfo.port}] ${MsgType[buffer[1]] !== undefined ? MsgType[buffer[1]] : 'UNKNOWN'}\t<${Utils.toHexString(buffer)}>`);

        if (buffer[0] !== buffer.length) {
            logger.error('Invalid message: Content length mismatch.');
            return;
        }

        if (MsgType[buffer[1]] === undefined) {
            logger.error('Invalid message: Unknown message type.');
            return;
        }

        this.handleMessage(buffer, addressInfo);
    }

    private onListening(): void {
        const address: AddressInfo = MqttSnGateway.server.address() as AddressInfo;
        logger.info(`Server listening at ${address.address}:${address.port}`);
    }

    private onError(error: Error): void {
        logger.error(`Server error: ${error.message}`);
    }

}
