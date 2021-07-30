import { AddressInfo } from 'net';
import { MqttClient } from '.';
import { IMqttBrokerConfig } from '../config';

export interface Constructor<T extends MqttClient> {
    readonly prototype: T;
    new(addressInfo: AddressInfo, config: IMqttBrokerConfig): T;
}
