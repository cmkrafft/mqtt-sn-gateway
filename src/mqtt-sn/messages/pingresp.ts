import { MsgType } from '../../enums/msgtype';
import { Message } from './message';

export class PingResp extends Message {

    public static create(pingresp: {}): PingResp {
        return new PingResp(pingresp);
    }

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);
        } else {
            super(undefined);

            this.msgType = MsgType.PINGRESP;
        }

        this.buffer = Buffer.from([]);
    }

}
