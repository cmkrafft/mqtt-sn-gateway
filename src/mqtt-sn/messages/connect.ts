import { MsgType } from '../../enums';
import { Flags } from './flags/utils';
import { ConnectFlags } from './flags';
import { Message } from './message';

export class Connect extends Message {

    public static create(connect: { flags: ConnectFlags, protocolId: number, duration: number, clientId: string }): Connect {
        return new Connect(connect);
    }

    public readonly flags: ConnectFlags;
    public readonly protocolId: number;
    public readonly duration: number;
    public readonly clientId: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.flags = Flags.fromNumber(value[2]); // 0x02
            this.protocolId = value[3]; // 0x03
            this.duration = (value[4] << 8) | value[5]; // 0x04 0x05
            this.clientId = value.slice(6).toString('utf-8'); // 0x06 n

        } else {
            super(undefined);

            this.msgType = MsgType.CONNECT;

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.flags.toNumber(), this.protocolId, this.duration >> 8, this.duration & 0x00FF, ...Buffer.from(this.clientId)]);
    }

}
