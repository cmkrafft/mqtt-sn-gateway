#!/usr/bin/env node

import winston from 'winston';
import { Connect, MqttSnClient, MqttSnGateway } from '.';
import configuration from './configuration';
import { Flags, Logger, Utils } from './mqtt-sn/messages/flags/utils';
import { WillTopic, WillMsg, Disconnect, Subscribe, PingReq, Publish, Register } from './mqtt-sn/messages';

async function main(): Promise<void> {
    const logger: winston.Logger = Logger.getLogger('Main');

    if (configuration.general.printHeader) {
        Utils.getHeader(__dirname).split('\n').forEach((line: string) => logger.info(line));
    }

    const gateway: MqttSnGateway = new MqttSnGateway(configuration);
}

async function test(): Promise<void> {
    const logger: winston.Logger = Logger.getLogger('Test');

    logger.info('Wait...');

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));

    logger.info('Go!');

    const client: MqttSnClient = new MqttSnClient();

    // await client.send(Connect.create({
    //     flags: new Flags({}),
    //     protocolId: 0,
    //     duration: 10,
    //     clientId: 'foobar:com2mtest',
    // }));

    console.log(Register.create({
        topicId: 1,
        msgId: 1,
        topicName: 'components/foobar/values'
    }).toBuffer());

    logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);

    
/*
    const willtopic = WillTopic.create({ flags: new Flags({}), willTopic: 'foo' });

    await client.send(willtopic);

    logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);

    const willmsg = WillMsg.create({ willMsg: 'content' });

    await client.send(willmsg);

    logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);

    // const subscribe = Subscribe.create({flags: new Flags({}), msgId: 1, topic: 'foo'});

    // await client.send(subscribe);

    const register = Register.create({ topicId: 1, msgId: 0, topicName: 'foo' });

    await client.send(register);

    await sleep(500);

    const publish = Publish.create({ flags: new Flags({}), topicId: 0, msgId: 0, data: Buffer.from('foo') });

    await client.send(publish);

    // const disconnect = Disconnect.create({ duration: 10 });

    // await client.send(disconnect);

    // await sleep(5000);

    // const pingReq = PingReq.create({ clientId: 'foo' });

    // await client.send(pingReq);

    // await client.send(Connect.create({
    //     flags: new Flags({
    //         will: true,
    //     }),
    //     protocolId: 0,
    //     duration: 10,
    //     clientId: 'foo',
    // }));

    // logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);

    // await client.send(willtopic);

    // logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);

    // await client.send(willmsg);

    // logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);*/


    (async () => {
        while (true) {
            logger.info(`REC: ${Utils.toHexString(await client.newMessage())}`);
        }
    })();
}

async function sleep(duration: number): Promise<void> {
    return new Promise<void>((resolve) =>
        setTimeout(() =>
            resolve(), duration));
}

// main();
test();
