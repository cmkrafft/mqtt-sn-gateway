import { Message } from '.';
import { MsgType, ReturnCode } from '../../enums';

export class WillMsgResp extends Message {
    public static create(willMsgResp: { returnCode: ReturnCode }): WillMsgResp {
        return new WillMsgResp(willMsgResp);
    }

    public readonly returnCode: ReturnCode;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.returnCode = value[2];
        } else {
            super(undefined);

            this.msgType = MsgType.WILLMSGRESP;

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.returnCode]);
    }

}
