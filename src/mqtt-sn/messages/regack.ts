import { MsgType, ReturnCode } from '../../enums';
import { Message } from './message';

export class RegAck extends Message {

    public static create(regAck: { topicId: number, msgId: number, returnCode: ReturnCode }): RegAck {
        return new RegAck(regAck);
    }

    public readonly topicId: number;
    public readonly msgId: number;
    public readonly returnCode: ReturnCode;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.topicId = (value[2] << 8) | value[3]; // 0x02 0x03
            this.msgId = (value[4] << 8) | value[5]; // 0x04 0x05
            this.returnCode = value[6]; // 0x06
        } else {
            super(undefined);

            this.msgType = MsgType.REGACK; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.topicId >> 8, this.topicId & 0x00FF, this.msgId >> 8, this.msgId & 0x00FF, this.returnCode]);
    }

}
