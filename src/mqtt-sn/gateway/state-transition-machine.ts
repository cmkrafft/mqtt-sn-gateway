import { MsgType, State } from '../..';
import { Disconnect } from '../messages';

export class StateTransitionMachine {

    public static getStateTransition(currentState: State, message: Buffer): State {
        const msgType: MsgType = message[1];

        if (currentState === State.DISCONNECTED) {
            if (msgType === MsgType.CONNECT) {
                return State.ACTIVE;
            }
        } else if (currentState === State.ACTIVE) {
            if (msgType === MsgType.DISCONNECT) {
                const sleepDuration: number = new Disconnect(message).duration;
                if (sleepDuration === undefined) {
                    return State.DISCONNECTED;
                } else if (sleepDuration !== undefined) {
                    return State.ASLEEP;
                }
            } else if (msgType === MsgType.TIMEOUT) {
                return State.LOST;
            }
        } else if (currentState === State.AWAKE) {
            if (msgType === MsgType.DISCONNECT) {
                return State.DISCONNECTED;
            } else if (msgType === MsgType.CONNECT) {
                return State.ACTIVE;
            } else if (msgType === MsgType.PINGRESP) {
                return State.ASLEEP;
            }
        } else if (currentState === State.ASLEEP) {
            if (msgType === MsgType.PINGREQ) {
                return State.AWAKE;
            } else if (msgType === MsgType.CONNECT) {
                return State.ACTIVE;
            } else if (msgType === MsgType.TIMEOUT) {
                return State.LOST;
            }
        } else if (currentState === State.LOST) {
            if (msgType === MsgType.CONNECT) {
                return State.ACTIVE;
            }
        }

        return currentState;
    }

}
