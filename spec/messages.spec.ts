import { ConnAck, Connect, Disconnect, Flags, MsgType, PingReq, PingResp, PubAck, Publish, RegAck, Register, ReturnCode, SubAck, Subscribe, TopicIdType, UnsubAck, Unsubscribe, WillMsg, WillMsgReq, WillTopic, WillTopicReq, WillTopicUpd, WillTopicResp, WillMsgUpd, WillMsgResp } from '../src';

describe('Messages', () => {
    describe('PingReq', () => {
        it('createFromObject', () => {
            const pingreq: PingReq = PingReq.create({ clientId: 'clientId' });

            expect(pingreq.length).toBe(10);
            expect(pingreq.msgType).toBe(MsgType.PINGREQ);
            expect(pingreq.clientId).toBe('clientId');
        });

        it('createWithoutClientId', () => {
            const pingreq: PingReq = PingReq.create({});

            expect(pingreq.length).toBe(2);
            expect(pingreq.msgType).toBe(MsgType.PINGREQ);
        });

        it('createFromBuffer', () => {
            let pingreq: PingReq = new PingReq(Buffer.from([0x0A, 0x16, ...Buffer.from('clientId')]));

            expect(pingreq.length).toBe(10);
            expect(pingreq.msgType).toBe(MsgType.PINGREQ);
            expect(pingreq.clientId).toBe('clientId');

            pingreq = new PingReq(Buffer.from([0x0A, 0x16]));

            expect(pingreq.length).toBe(2);
            expect(pingreq.msgType).toBe(MsgType.PINGREQ);
            expect(pingreq.clientId).toBe(undefined);
        });

        it('toBuffer', () => {
            const pingreq: PingReq = PingReq.create({ clientId: 'clientId' });

            expect(pingreq.toBuffer()).toEqual(Buffer.from([0x0A, 0x16, ...Buffer.from('clientId')]));
        });
    });

    describe('PingResp', () => {
        it('createFromObject', () => {
            const pingresp: PingResp = PingResp.create({});

            expect(pingresp.length).toBe(2);
            expect(pingresp.msgType).toBe(MsgType.PINGRESP);
        });

        it('createFromBuffer', () => {
            const pingresp: PingResp = new PingResp(Buffer.from([0x02, 0x17]));

            expect(pingresp.length).toBe(2);
            expect(pingresp.msgType).toBe(MsgType.PINGRESP);
        });

        it('toBuffer', () => {
            const pingresp: PingResp = new PingResp(Buffer.from([0x02, 0x17]));

            expect(pingresp.toBuffer()).toEqual(Buffer.from([0x02, 0x17]));
        });
    });

    describe('Connect', () => {
        it('createFromObject', () => {
            const connect: Connect = Connect.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }), protocolId: 0, duration: 5, clientId: 'clientId',
            });

            expect(connect.length).toBe(14);
            expect(connect.msgType).toBe(MsgType.CONNECT);
            expect(connect.flags.toNumber()).toBe(0b00100010);
            expect(connect.protocolId).toBe(0);
            expect(connect.duration).toBe(5);
            expect(connect.clientId).toBe('clientId');
        });

        it('createFromBuffer', () => {
            const buffer: Buffer = Buffer.from([
                0x0E,
                0x04,
                new Flags({}).toNumber(),
                0x01,
                0x00,
                0x05,
                ...Buffer.from('clientId'),
            ]);

            const connect: Connect = new Connect(buffer);

            expect(connect.length).toBe(14);
            expect(connect.msgType).toBe(MsgType.CONNECT);
            expect(connect.flags.toNumber()).toBe(0);
            expect(connect.protocolId).toBe(1);
            expect(connect.duration).toBe(5);
            expect(connect.clientId).toBe('clientId');
        });

        it('toBuffer', () => {
            const connect: Connect = Connect.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }), protocolId: 0, duration: 5, clientId: 'clientId',
            });

            expect(connect.toBuffer()).toEqual(Buffer.from([
                0x0E,
                0x04,
                0x22,
                0x00,
                0x00,
                0x05,
                ...Buffer.from('clientId'),
            ]));
        });
    });

    describe('ConnAck', () => {
        it('createFromObject', () => {
            const connack: ConnAck = ConnAck.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(connack.length).toBe(3);
            expect(connack.msgType).toBe(MsgType.CONNACK);
            expect(connack.returnCode).toBe(ReturnCode.REJECTED_CONGESTION);
        });

        it('createFromBuffer', () => {
            const connack: ConnAck = new ConnAck(Buffer.from([0x03, 0x05, 0x01]));

            expect(connack.length).toBe(3);
            expect(connack.msgType).toBe(MsgType.CONNACK);
            expect(connack.returnCode).toBe(ReturnCode.REJECTED_CONGESTION);
        });

        it('toBuffer', () => {
            const connack: ConnAck = ConnAck.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(connack.toBuffer()).toEqual(Buffer.from([0x03, 0x05, 0x01]));
        });
    });

    describe('Disconnect', () => {
        it('createFromObject', () => {
            let disconnect: Disconnect = Disconnect.create({ duration: 5 });

            expect(disconnect.length).toBe(4);
            expect(disconnect.msgType).toBe(MsgType.DISCONNECT);
            expect(disconnect.duration).toBe(5);

            disconnect = Disconnect.create({});

            expect(disconnect.length).toBe(2);
            expect(disconnect.msgType).toBe(MsgType.DISCONNECT);
            expect(disconnect.duration).toBe(undefined);
        });

        it('createFromBuffer', () => {
            const disconnect: Disconnect = new Disconnect(Buffer.from([0x04, 0x18, 0x03, 0x10]));

            expect(disconnect.length).toBe(4);
            expect(disconnect.msgType).toBe(MsgType.DISCONNECT);
            expect(disconnect.duration).toBe(784);
        });

        it('toBuffer', () => {
            const disconnect: Disconnect = Disconnect.create({ duration: 839 });

            expect(disconnect.toBuffer()).toEqual(Buffer.from([
                0x04,
                0x18,
                0x03,
                0x47,
            ]));
        });
    });

    describe('Subscribe', () => {
        it('createFromObject', () => {
            let subscribe: Subscribe = Subscribe.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }),
                msgId: 17,
                topic: 'the-topic',
            });

            expect(subscribe.length).toBe(14);
            expect(subscribe.msgType).toBe(MsgType.SUBSCRIBE);
            expect(subscribe.flags.toNumber()).toBe(0b00100010);
            expect(subscribe.msgId).toBe(17);
            expect(subscribe.topic).toBe('the-topic');

            subscribe = Subscribe.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }),
                msgId: 17,
                topic: 491,
            });

            expect(subscribe.length).toBe(7);
            expect(subscribe.msgType).toBe(MsgType.SUBSCRIBE);
            expect(subscribe.flags.toNumber()).toBe(0b00100010);
            expect(subscribe.msgId).toBe(17);
            expect(subscribe.topic).toBe(491);
        });
    });

    it('createFromBuffer', () => {
        const subscribe: Subscribe = new Subscribe(Buffer.from([
            0x0E,
            0x12,
            0x22,
            0x00,
            0x11,
            ...Buffer.from('the-topic'),
        ]));

        expect(subscribe.length).toBe(14);
        expect(subscribe.msgType).toBe(MsgType.SUBSCRIBE);
        expect(subscribe.flags.toNumber()).toBe(0b00100010);
        expect(subscribe.msgId).toBe(17);
        expect(subscribe.topic).toBe('the-topic');
    });

    it('toBuffer', () => {
        let subscribe: Subscribe = Subscribe.create({
            flags: new Flags({
                dup: false,
                qos: 1,
                retain: false,
                will: false,
                cleanSession: false,
                topicIdType: TopicIdType.SHORT_TOPIC_NAME,
            }),
            msgId: 17,
            topic: 'the-topic',
        });

        expect(subscribe.toBuffer()).toEqual(Buffer.from([
            0x0E,
            0x12,
            0x22,
            0x00,
            0x11,
            ...Buffer.from('the-topic'),
        ]));

        subscribe = Subscribe.create({
            flags: new Flags({
                dup: false,
                qos: 1,
                retain: false,
                will: false,
                cleanSession: false,
                topicIdType: TopicIdType.SHORT_TOPIC_NAME,
            }),
            msgId: 17,
            topic: 420,
        });

        expect(subscribe.toBuffer()).toEqual(Buffer.from([
            0x07,
            0x12,
            0x22,
            0x00,
            0x11,
            0x01,
            0xA4,
        ]));
    });

    describe('SubAck', () => {
        it('createFromObject', () => {
            const suback: SubAck = SubAck.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }),
                topicId: 519,
                msgId: 489,
                returnCode: ReturnCode.ACCEPTED,
            });

            expect(suback.length).toBe(8);
            expect(suback.msgType).toBe(MsgType.SUBACK);
            expect(suback.flags.toNumber()).toBe(0b00100010);
            expect(suback.topicId).toBe(519);
            expect(suback.msgId).toBe(489);
            expect(suback.returnCode).toBe(ReturnCode.ACCEPTED);
        });
    });

    it('createFromBuffer', () => {
        const suback: SubAck = new SubAck(Buffer.from([
            0x08,
            0x13,
            0x22,
            0x02,
            0x07,
            0x01,
            0xE9,
            0x00,
        ]));

        expect(suback.length).toBe(8);
        expect(suback.msgType).toBe(MsgType.SUBACK);
        expect(suback.flags.toNumber()).toBe(0b00100010);
        expect(suback.topicId).toBe(519);
        expect(suback.msgId).toBe(489);
        expect(suback.returnCode).toBe(ReturnCode.ACCEPTED);
    });

    describe('Publish', () => {
        it('createFromObject', () => {
            const publish: Publish = Publish.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }),
                topicId: 723,
                msgId: 575,
                data: Buffer.from('message-content'),
            });

            expect(publish.length).toBe(22);
            expect(publish.msgType).toBe(MsgType.PUBLISH);
            expect(publish.flags.toNumber()).toBe(0b00100010);
            expect(publish.topicId).toBe(723);
            expect(publish.msgId).toBe(575);
            expect(publish.data.toString('utf-8')).toBe('message-content');
        });

        it('createFromBuffer', () => {
            const publish: Publish = new Publish(Buffer.from([
                0x16,
                0x0C,
                0x22,
                0x02,
                0xD3,
                0x02,
                0x3F,
                ...Buffer.from('message-content'),
            ]));

            expect(publish.length).toBe(22);
            expect(publish.msgType).toBe(MsgType.PUBLISH);
            expect(publish.flags.toNumber()).toBe(0b00100010);
            expect(publish.topicId).toBe(723);
            expect(publish.msgId).toBe(575);
            expect(publish.data.toString('utf-8')).toBe('message-content');
        });

        it('toBuffer', () => {
            const publish: Publish = Publish.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.SHORT_TOPIC_NAME,
                }),
                topicId: 723,
                msgId: 575,
                data: Buffer.from('message-content'),
            });

            expect(publish.toBuffer()).toEqual(Buffer.from([
                0x16,
                0x0C,
                0x22,
                0x02,
                0xD3,
                0x02,
                0x3F,
                ...Buffer.from('message-content'),
            ]));
        });
    });

    describe('PubAck', () => {
        it('creeateFromObject', () => {
            const puback: PubAck = PubAck.create({
                topicId: 935,
                msgId: 744,
                returnCode: ReturnCode.REJECTED_INVALID_TOPIC_ID,
            });

            expect(puback.length).toBe(7);
            expect(puback.msgType).toBe(MsgType.PUBACK);
            expect(puback.topicId).toBe(935);
            expect(puback.msgId).toBe(744);
            expect(puback.returnCode).toBe(ReturnCode.REJECTED_INVALID_TOPIC_ID);
        });

        it('createFromBuffer', () => {
            const puback: PubAck = new PubAck(Buffer.from([
                0x07,
                0x0D,
                0x03,
                0xA7,
                0x02,
                0xE8,
                0x02,
            ]));

            expect(puback.length).toBe(7);
            expect(puback.msgType).toBe(MsgType.PUBACK);
            expect(puback.topicId).toBe(935);
            expect(puback.msgId).toBe(744);
            expect(puback.returnCode).toBe(ReturnCode.REJECTED_INVALID_TOPIC_ID);
        });

        it('toBuffer', () => {
            const puback: PubAck = PubAck.create({
                topicId: 935,
                msgId: 744,
                returnCode: ReturnCode.REJECTED_INVALID_TOPIC_ID,
            });

            expect(puback.toBuffer()).toEqual(Buffer.from([
                0x07,
                0x0D,
                0x03,
                0xA7,
                0x02,
                0xE8,
                0x02,
            ]));
        });
    });

    describe('Register', () => {
        it('createFromObject', () => {
            const register: Register = Register.create({
                topicId: 477,
                msgId: 293,
                topicName: 'topic-name',
            });

            expect(register.length).toBe(16);
            expect(register.msgType).toBe(MsgType.REGISTER);
            expect(register.topicId).toBe(477);
            expect(register.msgId).toBe(293);
            expect(register.topicName).toBe('topic-name');
        });

        it('createFromBuffer', () => {
            const register: Register = new Register(Buffer.from([
                0x10,
                0x0A,
                0x01,
                0xDD,
                0x01,
                0x25,
                ...Buffer.from('topic-name'),
            ]));

            expect(register.length).toBe(16);
            expect(register.msgType).toBe(MsgType.REGISTER);
            expect(register.topicId).toBe(477);
            expect(register.msgId).toBe(293);
            expect(register.topicName).toBe('topic-name');
        });

        it('toBuffer', () => {
            const register: Register = Register.create({
                topicId: 477,
                msgId: 293,
                topicName: 'topic-name',
            });

            expect(register.toBuffer()).toEqual(Buffer.from([
                0x10,
                0x0A,
                0x01,
                0xDD,
                0x01,
                0x25,
                ...Buffer.from('topic-name'),
            ]));
        });
    });

    describe('RegAck', () => {
        it('createFromObject', () => {
            const regack: RegAck = RegAck.create({
                topicId: 477,
                msgId: 293,
                returnCode: ReturnCode.REJECTED_INVALID_TOPIC_ID,
            });

            expect(regack.length).toBe(7);
            expect(regack.msgType).toBe(MsgType.REGACK);
            expect(regack.topicId).toBe(477);
            expect(regack.msgId).toBe(293);
            expect(regack.returnCode).toBe(ReturnCode.REJECTED_INVALID_TOPIC_ID);
        });

        it('createFromBuffer', () => {
            const regack: RegAck = new RegAck(Buffer.from([
                0x07,
                0x0B,
                0x01,
                0xDD,
                0x01,
                0x25,
                0x02,
            ]));

            expect(regack.length).toBe(7);
            expect(regack.msgType).toBe(MsgType.REGACK);
            expect(regack.topicId).toBe(477);
            expect(regack.msgId).toBe(293);
            expect(regack.returnCode).toBe(ReturnCode.REJECTED_INVALID_TOPIC_ID);
        });

        it('toBuffer', () => {
            const regack: RegAck = RegAck.create({
                topicId: 477,
                msgId: 293,
                returnCode: ReturnCode.REJECTED_INVALID_TOPIC_ID,
            });

            expect(regack.toBuffer()).toEqual(Buffer.from([
                0x07,
                0x0B,
                0x01,
                0xDD,
                0x01,
                0x25,
                0x02,
            ]));
        });
    });

    describe('Unsubscribe', () => {
        it('createFromObject', () => {
            const unsubscribe: Unsubscribe = Unsubscribe.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.TOPIC_NAME,
                }),
                msgId: 477,
                topic: 'the-topic',
            });

            expect(unsubscribe.length).toBe(14);
            expect(unsubscribe.msgType).toBe(MsgType.UNSUBSCRIBE);
            expect(unsubscribe.msgId).toBe(477);
            expect(unsubscribe.topic).toBe('the-topic');
        });

        it('createFromBuffer', () => {
            const unsubscribe: Unsubscribe = new Unsubscribe(Buffer.from([
                0x0E,
                0x14,
                0x20,
                0x01,
                0xDD,
                ...Buffer.from('the-topic'),
            ]));

            expect(unsubscribe.length).toBe(14);
            expect(unsubscribe.msgType).toBe(MsgType.UNSUBSCRIBE);
            expect(unsubscribe.msgId).toBe(477);
            expect(unsubscribe.topic).toBe('the-topic');
        });

        it('toBuffer', () => {
            const unsubscribe: Unsubscribe = Unsubscribe.create({
                flags: new Flags({
                    dup: false,
                    qos: 1,
                    retain: false,
                    will: false,
                    cleanSession: false,
                    topicIdType: TopicIdType.TOPIC_NAME,
                }),
                msgId: 477,
                topic: 'the-topic',
            });

            expect(unsubscribe.toBuffer()).toEqual(Buffer.from([
                0x0E,
                0x14,
                0x20,
                0x01,
                0xDD,
                ...Buffer.from('the-topic'),
            ]));
        });
    });

    describe('UnsubAck', () => {
        it('createFromObject', () => {
            const unsubAck: UnsubAck = UnsubAck.create({ msgId: 333 });

            expect(unsubAck.length).toBe(4);
            expect(unsubAck.msgType).toBe(MsgType.UNSUBACK);
            expect(unsubAck.msgId).toBe(333);
        });

        it('createFromBuffer', () => {
            const unsubAck: UnsubAck = new UnsubAck(Buffer.from([
                0x04,
                0x15,
                0x01,
                0x4D,
            ]));

            expect(unsubAck.length).toBe(4);
            expect(unsubAck.msgType).toBe(MsgType.UNSUBACK);
            expect(unsubAck.msgId).toBe(333);
        });

        it('toBuffer', () => {
            const unsubAck: UnsubAck = UnsubAck.create({ msgId: 333 });

            expect(unsubAck.toBuffer()).toEqual(Buffer.from([
                0x04,
                0x15,
                0x01,
                0x4D,
            ]));
        });
    });

    describe('WillTopic', () => {
        it('createFromObject', () => {
            const willTopic: WillTopic = WillTopic.create({ flags: new Flags({}), willTopic: 'lastWill' });

            expect(willTopic.length).toBe(11);
            expect(willTopic.msgType).toBe(MsgType.WILLTOPIC);
            expect(willTopic.willTopic).toBe('lastWill');
        });

        it('createFromBuffer', () => {
            const willTopic: WillTopic = new WillTopic(Buffer.from([
                0x0B,
                0x07,
                0x00,
                0x6c,
                0x61,
                0x73,
                0x74,
                0x57,
                0x69,
                0x6c,
                0x6c,
            ]));

            expect(willTopic.length).toBe(11);
            expect(willTopic.msgType).toBe(MsgType.WILLTOPIC);
            expect(willTopic.willTopic).toBe('lastWill');
        });

        it('toBuffer', () => {
            const willTopic: WillTopic = WillTopic.create({ flags: new Flags({}), willTopic: 'lastWill' });

            expect(willTopic.toBuffer()).toEqual(Buffer.from([
                0x0B,
                0x07,
                0x00,
                0x6c,
                0x61,
                0x73,
                0x74,
                0x57,
                0x69,
                0x6c,
                0x6c,
            ]));
        });
    });

    describe('WillMsg', () => {
        it('createFromObject', () => {
            const willMsg: WillMsg = WillMsg.create({ willMsg: 'lastWill' });

            expect(willMsg.length).toBe(10);
            expect(willMsg.msgType).toBe(MsgType.WILLMSG);
            expect(willMsg.willMsg).toBe('lastWill');
        });

        it('createFromBuffer', () => {
            const willMsg: WillMsg = new WillMsg(Buffer.from([
                0x0A,
                0x09,
                0x6c,
                0x61,
                0x73,
                0x74,
                0x57,
                0x69,
                0x6c,
                0x6c,
            ]));

            expect(willMsg.length).toBe(10);
            expect(willMsg.msgType).toBe(MsgType.WILLMSG);
            expect(willMsg.willMsg).toBe('lastWill');
        });

        it('toBuffer', () => {
            const willMsg: WillMsg = WillMsg.create({ willMsg: 'lastWill' });

            expect(willMsg.toBuffer()).toEqual(Buffer.from([
                0x0A,
                0x09,
                0x6c,
                0x61,
                0x73,
                0x74,
                0x57,
                0x69,
                0x6c,
                0x6c,
            ]));
        });
    });

    describe('WillTopicReq', () => {
        it('createFromObject', () => {
            const willTopicReq: WillTopicReq = WillTopicReq.create({});

            expect(willTopicReq.length).toBe(2);
            expect(willTopicReq.msgType).toBe(MsgType.WILLTOPICREQ);
        });

        it('createFromBuffer', () => {
            const willTopicReq: WillTopicReq = new WillTopicReq(Buffer.from([
                0x02,
                0x06,
            ]));

            expect(willTopicReq.length).toBe(2);
            expect(willTopicReq.msgType).toBe(MsgType.WILLTOPICREQ);
        });

        it('toBuffer', () => {
            const willTopicReq: WillTopicReq = WillTopicReq.create({});

            expect(willTopicReq.toBuffer()).toEqual(Buffer.from([
                0x02,
                0x06,
            ]));
        });
    });

    describe('WillMsgReq', () => {
        it('createFromObject', () => {
            const willMsgReq: WillMsgReq = WillMsgReq.create({});

            expect(willMsgReq.length).toBe(2);
            expect(willMsgReq.msgType).toBe(MsgType.WILLMSGREQ);
        });

        it('createFromBuffer', () => {
            const willMsgReq: WillMsgReq = new WillMsgReq(Buffer.from([
                0x02,
                0x08,
            ]));

            expect(willMsgReq.length).toBe(2);
            expect(willMsgReq.msgType).toBe(MsgType.WILLMSGREQ);
        });

        it('toBuffer', () => {
            const willMsgReq: WillMsgReq = WillMsgReq.create({});

            expect(willMsgReq.toBuffer()).toEqual(Buffer.from([
                0x02,
                0x08,
            ]));
        });
    });

    describe('WillTopicUpd', () => {
        it('createFromObject', () => {
            const willTopicUpd: WillTopicUpd = WillTopicUpd.create({ flags: new Flags({}), willTopic: 'willTopic' });

            expect(willTopicUpd.length).toBe(12);
            expect(willTopicUpd.msgType).toBe(MsgType.WILLTOPICUPD);
            expect(willTopicUpd.willTopic).toBe('willTopic');
        });

        it('createFromBuffer', () => {
            const willTopicUpd: WillTopicUpd = new WillTopicUpd(Buffer.from([
                0x0C,
                0x1A,
                0x00,
                0x77,
                0x69,
                0x6c,
                0x6c,
                0x54,
                0x6f,
                0x70,
                0x69,
                0x63,
            ]));

            expect(willTopicUpd.length).toBe(12);
            expect(willTopicUpd.msgType).toBe(MsgType.WILLTOPICUPD);
        });

        it('toBuffer', () => {
            const willTopicUpd: WillTopicUpd = WillTopicUpd.create({ flags: new Flags({}), willTopic: 'willTopic' });

            expect(willTopicUpd.toBuffer()).toEqual(Buffer.from([
                0x0C,
                0x1A,
                0x00,
                0x77,
                0x69,
                0x6c,
                0x6c,
                0x54,
                0x6f,
                0x70,
                0x69,
                0x63,
            ]));
        });
    });

    describe('WillTopicResp', () => {
        it('createFromObject', () => {
            const willTopicResp: WillTopicResp = WillTopicResp.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(willTopicResp.length).toBe(3);
            expect(willTopicResp.msgType).toBe(MsgType.WILLTOPICRESP);
            expect(willTopicResp.returnCode).toBe(ReturnCode.REJECTED_CONGESTION);
        });

        it('createFromBuffer', () => {
            const willTopicResp: WillTopicResp = new WillTopicResp(Buffer.from([
                0x03,
                0x1B,
                0x01,
            ]));

            expect(willTopicResp.length).toBe(3);
            expect(willTopicResp.msgType).toBe(MsgType.WILLTOPICRESP);
        });

        it('toBuffer', () => {
            const willTopicResp: WillTopicResp = WillTopicResp.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(willTopicResp.toBuffer()).toEqual(Buffer.from([
                0x03,
                0x1B,
                0x01,
            ]));
        });
    });

    describe('WillMsgUpd', () => {
        it('createFromObject', () => {
            const willMsgUpd: WillMsgUpd = WillMsgUpd.create({ willMsg: 'willMessage' });

            expect(willMsgUpd.length).toBe(13);
            expect(willMsgUpd.msgType).toBe(MsgType.WILLMSGUPD);
            expect(willMsgUpd.willMsg).toBe('willMessage');
        });

        it('createFromBuffer', () => {
            const willMsgUpd: WillMsgUpd = new WillMsgUpd(Buffer.from([
                0x0D,
                0x1C,
                0x77,
                0x69,
                0x6c,
                0x6c,
                0x4d,
                0x65,
                0x73,
                0x73,
                0x61,
                0x67,
                0x65,
            ]));

            expect(willMsgUpd.length).toBe(13);
            expect(willMsgUpd.msgType).toBe(MsgType.WILLMSGUPD);
        });

        it('toBuffer', () => {
            const willMsgUpd: WillMsgUpd = WillMsgUpd.create({ willMsg: 'willMessage' });

            expect(willMsgUpd.toBuffer()).toEqual(Buffer.from([
                0x0D,
                0x1C,
                0x77,
                0x69,
                0x6c,
                0x6c,
                0x4d,
                0x65,
                0x73,
                0x73,
                0x61,
                0x67,
                0x65,
            ]));
        });
    });

    describe('WillMsgResp', () => {
        it('createFromObject', () => {
            const willMsgResp: WillMsgResp = WillMsgResp.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(willMsgResp.length).toBe(3);
            expect(willMsgResp.msgType).toBe(MsgType.WILLMSGRESP);
            expect(willMsgResp.returnCode).toBe(ReturnCode.REJECTED_CONGESTION);
        });

        it('createFromBuffer', () => {
            const willMsgResp: WillMsgResp = new WillMsgResp(Buffer.from([
                0x03,
                0x1D,
                0x01,
            ]));

            expect(willMsgResp.length).toBe(3);
            expect(willMsgResp.msgType).toBe(MsgType.WILLMSGRESP);
        });

        it('toBuffer', () => {
            const willMsgResp: WillMsgResp = WillMsgResp.create({ returnCode: ReturnCode.REJECTED_CONGESTION });

            expect(willMsgResp.toBuffer()).toEqual(Buffer.from([
                0x03,
                0x1D,
                0x01,
            ]));
        });
    });
});
