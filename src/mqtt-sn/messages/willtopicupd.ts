import { MsgType } from '../../enums';
import { Flags } from './flags/utils';
import { WillTopicFlags } from './flags/willtopic-flags';
import { Message } from './message';

export class WillTopicUpd extends Message {

    public static create(willTopicUpd: { flags: WillTopicFlags, willTopic: string }): WillTopicUpd {
        return new WillTopicUpd(willTopicUpd);
    }

    public readonly flags: WillTopicFlags;
    public readonly willTopic: string;

    constructor(value: Buffer | { [key: string]: any }) {
        if (value instanceof Buffer) {
            super(value);

            this.flags = Flags.fromNumber(value[2]); // 0x02
            this.willTopic = value.slice(3).toString('utf-8');
        } else {
            super(undefined);

            this.msgType = MsgType.WILLTOPICUPD; // 0x01

            Object.assign(this, value);
        }

        this.buffer = Buffer.from([this.flags.toNumber(), ...Buffer.from(this.willTopic)]);
    }

    public get isEmpty(): boolean {
        return this.flags.isEmpty
            && this.willTopic === '';
    }

}
