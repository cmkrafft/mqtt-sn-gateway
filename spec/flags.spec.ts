import { Flags } from '..';
import { TopicIdType } from '../src';

describe('Flags', () => {
    it('createFromObject', () => {
        const flags: Flags = new Flags({
            dup: true,
            qos: 1,
            retain: true,
            will: false,
            cleanSession: false,
            topicIdType: TopicIdType.PRE_DEFINED_TOPIC_ID,
        });

        expect(flags.toNumber()).toBe(0b10110001);
    });

    it('createFromNull', () => {
        const flags: Flags = new Flags();

        expect(flags.dup).toBe(false);
        expect(flags.qos).toBe(0);
        expect(flags.retain).toBe(false);
        expect(flags.will).toBe(false);
        expect(flags.cleanSession).toBe(false);
        expect(flags.topicIdType).toBe(TopicIdType.TOPIC_NAME);

        expect(flags.toNumber()).toBe(0b00000000);
    });

    it('fromNumber', () => {
        const flags: Flags = Flags.fromNumber(0b10110001);

        expect(flags.dup).toBe(true);
        expect(flags.qos).toBe(1);
        expect(flags.retain).toBe(true);
        expect(flags.will).toBe(false);
        expect(flags.cleanSession).toBe(false);
        expect(flags.topicIdType).toBe(TopicIdType.PRE_DEFINED_TOPIC_ID);
    });
});
