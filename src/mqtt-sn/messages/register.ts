import { Message } from '.';
import { MsgType } from '../../enums';

export class Register extends Message {
    public static create(register: { topicId: number, msgId: number, topicName: string }): Register {
        return new Register(register);
    }

    public readonly topicId: number;
    public readonly msgId: number;
    public readonly topicName: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.topicId = (value[2] << 8) | value[3]; // 0x02 0x03
            this.msgId = (value[4] << 8) | value[5]; // 0x04 0x05
            this.topicName = value.slice(6).toString('utf-8'); // 0x06 n
        } else {
            super(undefined);

            this.msgType = MsgType.REGISTER;

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.topicId >> 8, this.topicId & 0x00FF, this.msgId >> 8, this.msgId & 0x00FF, ...Buffer.from(this.topicName)]);
    }

}
