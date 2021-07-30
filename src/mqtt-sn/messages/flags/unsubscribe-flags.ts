import { TopicIdType } from '../../../enums';
import { Flags } from './utils';

export class UnsubscribeFlags extends Flags {

    constructor(flags?: { topicIdType?: TopicIdType }) {
        super(flags);
    }

}