import { IConfig } from './config/iconfig';

const configuration: IConfig = {
    general: {
        printHeader: true,
        printConfiguration: false,
    },
    gateway: {
        address: '0.0.0.0',
        port: 1884,
        mqttClientImplementation: 'MqttJsClient',
    },
    broker: {
        host: 'localhost',
        port: 1883,
        protocol: 'tcp',
    },
};

export default configuration;
