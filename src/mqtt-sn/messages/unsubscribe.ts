import { MsgType, TopicIdType } from '../../enums';
import { Flags } from './flags/utils';
import { UnsubscribeFlags } from './flags';
import { Message } from './message';

export class Unsubscribe extends Message {

    public static create(subscribe: { flags: UnsubscribeFlags, msgId: number, topic: string | number }): Unsubscribe {
        return new Unsubscribe(subscribe);
    }

    public readonly flags: UnsubscribeFlags;
    public readonly msgId: number;
    public readonly topic: string | number;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.flags = Flags.fromNumber(value[2]); // 0x02
            this.msgId = (value[3] << 8) | value[4]; // 0x03 0x04

            if (this.flags.topicIdType === TopicIdType.PRE_DEFINED_TOPIC_ID) {
                this.topic = (value[5] << 8) | value[6]; // 0x05 0x06
            } else {
                this.topic = value.slice(5).toString('utf-8');
            }
        } else {
            super(undefined);

            this.msgType = MsgType.UNSUBSCRIBE; // 0x01

            Object.assign(this, value);
        }

        const topicFragment: Buffer = typeof this.topic === 'number'
            ? Buffer.from([(this.topic as number >> 8), this.topic as number & 0x00FF])
            : Buffer.from(this.topic);

        this.buffer = Buffer.from([this.flags.toNumber(), this.msgId >> 8, this.msgId & 0x00FF, ...topicFragment]);
    }

}
