import { MsgType } from '../../enums';
import { Flags } from './flags/utils';
import { WillTopicFlags } from './flags/willtopic-flags';
import { Message } from './message';

export class WillMsgUpd extends Message {

    public static create(willMsgUpd: { willMsg: string }): WillMsgUpd {
        return new WillMsgUpd(willMsgUpd);
    }

    public readonly willMsg: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.willMsg = value.slice(2).toString('utf-8');
        } else {
            super(undefined);

            this.msgType = MsgType.WILLMSGUPD; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([...Buffer.from(this.willMsg)]);
    }

}
