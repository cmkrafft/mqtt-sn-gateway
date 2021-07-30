import { IMessage } from './imessage';

export abstract class Message implements IMessage {
    public msgType: number;
    protected _buffer: Buffer;

    constructor(buffer?: Buffer) {
        if (buffer) {
            this.msgType = buffer[1]; // 0x01
        } else {
            this.msgType = 0x00;
        }
    }

    public get length(): number {
        return this._buffer[0];
    }

    protected set buffer(buffer: Buffer) {
        this._buffer = buffer && buffer.length > 0
            ? Buffer.from([buffer.length + 2, this.msgType, ...buffer])
            : Buffer.from([2, this.msgType]);
    }

    public toBuffer(): Buffer {
        return this._buffer;
    }

}
