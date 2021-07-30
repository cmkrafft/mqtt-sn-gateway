import { MsgType } from '../../enums/msgtype';
import { Message } from './message';

export class Disconnect extends Message {

    public static create(disconnect: { duration?: number }): Disconnect {
        return new Disconnect(disconnect);
    }

    public readonly duration?: number;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            if (value[2] !== undefined && value[3] !== undefined) {
                this.duration = (value[2] << 8) | value[3]; // 0x02 0x03
            }
        } else {
            super(undefined);

            this.msgType = MsgType.DISCONNECT;

            if (value.duration) {
                this.duration = value.duration;
            }
        }

        const data: number[] = this.duration ? [this.duration >> 8, this.duration & 0x00FF] : [];

        this.buffer = Buffer.from(data);
    }

}
