import { Flags } from './utils';
import { QoS } from '../model';

export class WillTopicFlags extends Flags {

    constructor(flags?: { qos?: QoS, retain?: boolean }) {
        super(flags);
    }

}