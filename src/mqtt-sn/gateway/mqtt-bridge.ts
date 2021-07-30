import { AddressInfo } from 'net';
import winston from 'winston';
import { Constructor } from '../..';
import { IMqttBrokerConfig } from '../../config';
import { MqttClient } from '../../mqtt/mqtt-client';
import { Logger } from '../messages/flags/utils';

const logger: winston.Logger = Logger.getLogger('MqttBridge');

export class MqttBridge {

    private clients: Map<string, MqttClient>;

    constructor(private config: IMqttBrokerConfig, private ctor: Constructor<MqttClient>) {
        this.clients = new Map<string, MqttClient>();
    }

    public addClient(addressInfo: AddressInfo): MqttClient {
        const client: MqttClient = new this.ctor(addressInfo, this.config);
        this.clients.set(`${addressInfo.address}:${addressInfo.port}`, client);

        logger.debug(`Clients connected: ${this.clients.size}`);

        return client;
    }

    public removeClient(addressInfo: AddressInfo): MqttClient {
        const client: MqttClient = this.clients[`${addressInfo.address}:${addressInfo.port}`];
        this.clients.delete(`${addressInfo.address}:${addressInfo.port}`);

        logger.debug(`Clients connected: ${this.clients.size}`);

        return client;
    }

    public getClient(addressInfo: AddressInfo): MqttClient {
        return this.clients.get(`${addressInfo.address}:${addressInfo.port}`);
    }

}
