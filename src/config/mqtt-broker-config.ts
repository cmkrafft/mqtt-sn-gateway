export interface IMqttBrokerConfig {
    host: string;
    port: number;
    protocol: 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs';
}
