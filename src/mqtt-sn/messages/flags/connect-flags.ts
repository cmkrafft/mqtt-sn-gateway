import { Flags } from './utils';

export class ConnectFlags extends Flags {

    constructor(flags?: { will?: boolean, cleanSession?: boolean }) {
        super(flags);
    }

}