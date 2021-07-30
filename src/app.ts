#!/usr/bin/env node

import * as fs from 'fs';
import _ from 'lodash';
import * as path from 'path';
import winston from 'winston';
import { MqttSnGateway } from '.';
import { IConfig } from './config';
import configuration from './configuration';
import { Logger, Utils } from './mqtt-sn/messages/flags/utils';

const logger: winston.Logger = Logger.getLogger('Main');

function preprareConfiguration(): void {
    const configurationPath: string = [...__dirname.split(path.sep), '..', 'configuration.json'].join(path.sep);

    if (fs.existsSync(configurationPath)) {
        let configurationFromFile: IConfig;

        try {
            configurationFromFile = JSON.parse(fs.readFileSync(configurationPath).toString());
        } catch (e) {
            logger.error(`Error while trying to parse configuration: ${e.message}`);
            process.exit(1);
        }

        const mergedConfiguration = _.merge(configuration, configurationFromFile);

        Object.entries(mergedConfiguration).forEach(([key, value]) => configuration[key] = value);
    }
}

(async () => {
    preprareConfiguration();

    if (configuration.general.printHeader) {
        Utils.getHeader(__dirname)
            .split('\n')
            .forEach((line: string) => logger.info(line));
    }

    if (configuration.general.printConfiguration) {
        logger.info(`Using configuration:`);
        logger.info(``);

        JSON.stringify(configuration, null, 4)
            .split(`\n`)
            .forEach(logger.info);

        logger.info(``);
    }

    const gateway: MqttSnGateway = new MqttSnGateway(configuration);
})();
