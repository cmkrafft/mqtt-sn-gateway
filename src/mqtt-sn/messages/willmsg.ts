import { MsgType } from '../../enums';
import { Message } from './message';

export class WillMsg extends Message {

    public static create(willMsg: { willMsg: string }): WillMsg {
        return new WillMsg(willMsg);
    }

    public readonly willMsg: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.willMsg = value.slice(2).toString('utf-8');
        } else {
            super(undefined);

            this.msgType = MsgType.WILLMSG; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([...Buffer.from(this.willMsg)]);
    }

}
