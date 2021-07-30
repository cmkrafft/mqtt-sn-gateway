import { MsgType, ReturnCode } from '../../enums';
import { Message } from './message';

export class PubAck extends Message {

    public static create(pubAck: { topicId: number, msgId: number, returnCode: ReturnCode }): PubAck {
        return new PubAck(pubAck);
    }

    public readonly topicId: number;
    public readonly msgId: number;
    public readonly returnCode: ReturnCode;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.topicId = (value[2] << 8) | value[3]; // 0x02 0x04
            this.msgId = (value[4] << 8) | value[5]; // 0x04 0x05
            this.returnCode = value[6];
        } else {
            super(undefined);

            this.msgType = MsgType.PUBACK; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.topicId >> 8, this.topicId & 0x00FF, this.msgId >> 8, this.msgId & 0x00FF, this.returnCode]);
    }

}
