import { MsgType } from '../../enums';
import { Flags } from './flags/utils';
import { PublishFlags } from './flags';
import { Message } from './message';

export class Publish extends Message {

    public static create(publish: { flags: PublishFlags, topicId: number, msgId: number, data: Buffer }): Publish {
        return new Publish(publish);
    }

    public readonly flags: PublishFlags;
    public readonly topicId: number;
    public readonly msgId: number;
    public readonly data: Buffer;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.flags = Flags.fromNumber(value[2]); // 0x02
            this.topicId = (value[3] << 8) | value[4]; // 0x03 0x04
            this.msgId = (value[5] << 8) | value[6]; // 0x05 0x06
            this.data = value.slice(7); // 0x07
        } else {
            super(undefined);

            this.msgType = MsgType.PUBLISH; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.flags.toNumber(), this.topicId >> 8, this.topicId & 0x00FF, this.msgId >> 8, this.msgId & 0x00FF, ...this.data]);
    }

}
