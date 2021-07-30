import winston from 'winston';
import { Logger } from '../mqtt-sn/messages/flags/utils';
import { Constructor, MqttClient } from '..';
import { MqttClientRegistry } from '../mqtt/mqtt-client-registry';

const logger: winston.Logger = Logger.getLogger('Bootstrap');

export class Bootstrap {
    public static getMqttClientImplementation(mqttClientImplementation: string): Constructor<MqttClient> {
        const className: string = mqttClientImplementation !== undefined
            ? mqttClientImplementation
            : 'MqttJsClient';

        const ctors: Array<Constructor<MqttClient>> = MqttClientRegistry.getImplementations
            .filter((c: Constructor<MqttClient>) => c.name === className);

        if (ctors.length === 0) {
            logger.error(`No implementation with ${className} for MqttClient could be found. Exiting.`);
            process.exit(1);
        } else if (ctors.length > 1) {
            logger.error(`Multiple implementations of MqttClient with name ${className} have been found. Exiting.`);
            process.exit(1);
        }

        return ctors[0];
    }
}
