import { Message } from '.';
import { MsgType, ReturnCode } from '../../enums';

export class WillTopicResp extends Message {
    public static create(willTopicResp: { returnCode: ReturnCode }): WillTopicResp {
        return new WillTopicResp(willTopicResp);
    }

    public readonly returnCode: ReturnCode;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.returnCode = value[2];
        } else {
            super(undefined);

            this.msgType = MsgType.WILLTOPICRESP;

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.returnCode]);
    }

}
