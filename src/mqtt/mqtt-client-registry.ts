import { MqttClient } from './mqtt-client';
import { Constructor } from './mqtt-client-constructor';

export class MqttClientRegistry {

    public static get getImplementations(): Array<Constructor<MqttClient>> {
        return MqttClientRegistry.implementations;
    }

    public static register<T extends Constructor<MqttClient>>(ctor: T): T {
        MqttClientRegistry.implementations.push(ctor);
        return ctor;
    }

    private static implementations: Array<Constructor<MqttClient>> = [];
}
