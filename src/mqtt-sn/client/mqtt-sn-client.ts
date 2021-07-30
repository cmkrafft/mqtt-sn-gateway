import dgram from 'dgram';
import { AddressInfo } from 'net';
import winston from 'winston';
import { MsgType } from '../..';
import { Message } from '../messages';
import { Logger, Utils } from '../messages/flags/utils';

const logger: winston.Logger = Logger.getLogger('MqttSnClient');

export class MqttSnClient {

    private client: dgram.Socket;

    private messages: Buffer[];

    constructor() {
        this.messages = [];
        this.client = dgram.createSocket('udp4');
        this.client.bind(1885, 'localhost');
        this.client.on('message', this.onMessage.bind(this));
    }

    // public async connect(): Promise<void> {
    //     this.client.send(Connect.create({
    //         flags: new Flags(),
    //         protocolId: 0,
    //         duration: 10,
    //         clientId: 'foo',
    //     }).toBuffer(), 1884, 'localhost', (err) => {
    //         if (err) {
    //             logger.error(err);
    //             this.client.close();
    //         }
    //     });
    // }

    // public async send(buffer: Buffer): Promise<void> {
    //     return new Promise<void>((resolve) => this.client.send(buffer, 1884, 'localhost', (err) => resolve()));
    // }

    public async send(message: Message): Promise<void> {
        return new Promise<void>((resolve) => this.client.send(message.toBuffer(), 1884, 'localhost', (err) => resolve()));
    }

    public async newMessage(): Promise<Buffer> {
        return new Promise<Buffer>(async (resolve) => {
            do {
                await new Promise<void>((r) => setTimeout(() => r(), 500));
            } while (this.messages.length === 0);

            resolve(this.messages.shift());
        });
    }

    private onMessage(buffer: Buffer, addressInfo: AddressInfo): void {
        logger.info(`<---\t[${addressInfo.address}:${addressInfo.port}] ${MsgType[buffer[1]] !== undefined ? MsgType[buffer[1]] : 'UNKNOWN'}\t<${Utils.toHexString(buffer)}>`);

        if (buffer[0] !== buffer.length) {
            logger.error('Invalid message: Content length mismatch.');
            return;
        }

        if (MsgType[buffer[1]] === undefined) {
            logger.error('Invalid message: Unknown message type.');
            return;
        }

        this.messages.push(buffer);
    }

}
