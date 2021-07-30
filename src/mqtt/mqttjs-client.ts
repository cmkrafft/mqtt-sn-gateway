import mqtt, { ISubscriptionGrant, Packet } from 'mqtt';
import { AddressInfo } from 'net';
import winston from 'winston';
import { MqttClient } from '.';
import { Flags, Logger } from '../mqtt-sn/messages/flags/utils';
import { IMqttConfig } from './imqtt-config';
import { MqttClientRegistry } from './mqtt-client-registry';

const logger: winston.Logger = Logger.getLogger('MqttJsClient');

@MqttClientRegistry.register
export class MqttJsClient extends MqttClient {

    private client: mqtt.MqttClient;

    constructor(addressInfo: AddressInfo, config: IMqttConfig) {
        super(addressInfo, config);
    }

    public async connectImpl(): Promise<void> {
        this.client = mqtt.connect(null, {
            host: this.config.host,
            port: this.config.port,
            protocol: this.config.protocol,
            clientId: this.configuration.clientId,
        });

        this.client.on('connect', this.onConnect.bind(this));
        this.client.on('error', this.onError.bind(this));
        this.client.on('message', this.onMessage.bind(this));
        this.client.on('close', this.onClose.bind(this));
    }

    public async publishImpl(topic: string, message: string | Buffer, flags: Flags): Promise<void | Error> {
        return new Promise<void | Error>((resolve, reject) =>
            this.client.publish(topic, message, {
                qos: flags.qos,
                retain: flags.retain,
                dup: flags.dup,
            }, (error?: Error, packet?: Packet) => {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            }));
    }

    public async subscribeImpl(topic: string): Promise<void | Error> {
        logger.info(topic);
        return new Promise<void | Error>((resolve, reject) =>
            this.client.subscribe(topic, (error: Error, granted: ISubscriptionGrant[]) => {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            }));
    }

    public async unsubscribeImpl(topic: string): Promise<void | Error> {
        return new Promise<void | Error>((resolve, reject) =>
            this.client.unsubscribe(topic, null, (error?: Error, packet?: Packet) => {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            }));
    }

    public async endImpl(force?: boolean): Promise<void> {
        return new Promise<void>((resolve) =>
            this.client.end(force, null, () => resolve()));
    }

}
