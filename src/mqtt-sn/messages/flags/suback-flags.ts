import { Flags } from './utils';
import { QoS } from '../model';

export class SubAckFlags extends Flags {

    constructor(flags?: { qos?: QoS }) {
        super(flags);
    }

}