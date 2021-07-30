import { QoS } from 'mqtt';
import { TopicIdType } from '../../../../enums';

export class Flags {

    public static fromNumber(flags: number): Flags {
        return new Flags({
            dup: !!(flags & 0x80),
            qos: (flags & 0x60) >> 5 as QoS,
            retain: !!(flags & 0x10),
            will: !!(flags & 0x08),
            cleanSession: !!(flags & 0x04),
            topicIdType: flags & 0x03,
        });
    }

    public dup: boolean;
    public qos: QoS;
    public retain: boolean;
    public will: boolean;
    public cleanSession: boolean;
    public topicIdType: TopicIdType;

    constructor(flags?: { dup?: boolean, qos?: QoS, retain?: boolean, will?: boolean, cleanSession?: boolean, topicIdType?: TopicIdType }) {
        if (flags) {
            this.dup = flags.dup !== undefined ? flags.dup : false;
            this.qos = flags.qos !== undefined ? flags.qos : 0b00;
            this.retain = flags.retain !== undefined ? flags.retain : false;
            this.will = flags.will !== undefined ? flags.will : false;
            this.cleanSession = flags.cleanSession !== undefined ? flags.cleanSession : false;
            this.topicIdType = flags.topicIdType !== undefined ? flags.topicIdType : 0b00;
        } else {
            this.dup = false;
            this.qos = 0b00;
            this.retain = false;
            this.will = false;
            this.cleanSession = false;
            this.topicIdType = 0b00;
        }
    }

    public toNumber(): number {
        return (+this.dup << 7)
            | ((this.qos & 0b10) << 6) | ((this.qos & 0b01) << 5)
            | (+this.retain << 4)
            | (+this.will << 3)
            | (+this.cleanSession << 2)
            | (this.topicIdType & 0b10) | (this.topicIdType & 0b01);
    }

    public get isEmpty(): boolean {
        return this.toNumber() === 0;
    }

}
