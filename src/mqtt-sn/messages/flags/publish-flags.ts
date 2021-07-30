import { TopicIdType } from '../../../enums';
import { Flags } from './utils';
import { QoS } from '../model';

export class PublishFlags extends Flags {

    constructor(flags?: { dup?: boolean, qos?: QoS, retain?: boolean, topicIdType?: TopicIdType }) {
        super(flags);
    }

}