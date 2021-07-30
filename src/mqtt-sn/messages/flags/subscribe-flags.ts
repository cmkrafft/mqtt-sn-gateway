import { TopicIdType } from '../../../enums';
import { Flags } from './utils';
import { QoS } from '../model';

export class SubscribeFlags extends Flags {

    constructor(flags?: { dup?: boolean, qos?: QoS, topicIdType?: TopicIdType }) {
        super(flags);
    }

}