import { MsgType } from '../../enums/msgtype';
import { Message } from './message';

export class WillMsgReq extends Message {

    public static create(willMsgReq: {}): WillMsgReq {
        return new WillMsgReq(willMsgReq);
    }

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);
        } else {
            super(undefined);

            this.msgType = MsgType.WILLMSGREQ;
        }

        this.buffer = Buffer.from([]);
    }

}
