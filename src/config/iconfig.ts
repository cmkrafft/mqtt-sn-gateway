import { IGeneralConfig, IMqttBrokerConfig, IMqttSnGatewayConfig } from '.';

export interface IConfig {
    general: IGeneralConfig,
    gateway: IMqttSnGatewayConfig;
    broker: IMqttBrokerConfig;
}
