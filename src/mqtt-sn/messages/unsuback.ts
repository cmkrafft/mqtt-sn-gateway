import { MsgType, ReturnCode } from '../../enums';
import { Flags } from './flags/utils';
import { Message } from './message';

export class UnsubAck extends Message {

    public static create(unsubAck: { msgId: number }): UnsubAck {
        return new UnsubAck(unsubAck);
    }

    public readonly msgId: number;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.msgId = (value[2] << 8) | value[3]; // 0x02 0x03
        } else {
            super(undefined);

            this.msgType = MsgType.UNSUBACK; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.msgId >> 8, this.msgId & 0x00FF]);
    }

}
