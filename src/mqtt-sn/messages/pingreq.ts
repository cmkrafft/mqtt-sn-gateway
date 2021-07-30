import { MsgType } from '../../enums/msgtype';
import { Message } from './message';

export class PingReq extends Message {

    public static create(pingreq: { clientId?: string }): PingReq {
        return new PingReq(pingreq);
    }

    public readonly clientId?: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            if (value.length > 2) {
                this.clientId = value.slice(2).toString('utf-8');
            }
        } else {
            super(undefined);

            this.msgType = MsgType.PINGREQ;

            this.clientId = value.clientId;
        }

        const data: Buffer = this.clientId ? Buffer.from(this.clientId) : Buffer.from([]);

        this.buffer = data;
    }

}
