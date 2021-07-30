import { MsgType } from '../../enums/msgtype';
import { Message } from './message';

export class WillTopicReq extends Message {

    public static create(willTopicReq: {}): WillTopicReq {
        return new WillTopicReq(willTopicReq);
    }

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);
        } else {
            super(undefined);

            this.msgType = MsgType.WILLTOPICREQ;
        }

        this.buffer = Buffer.from([]);
    }

}
