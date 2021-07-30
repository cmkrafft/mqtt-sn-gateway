import { MsgType, ReturnCode } from '../../enums';
import { Message } from './message';

export class ConnAck extends Message {

    public static create(connAck: { returnCode: ReturnCode }): ConnAck {
        return new ConnAck(connAck);
    }

    public readonly returnCode: number;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.returnCode = value[2];
        } else {
            super(undefined);

            Object.assign(this, value);

            this.msgType = MsgType.CONNACK;
        }

        this.buffer = Buffer.from([this.returnCode]);
    }

}
