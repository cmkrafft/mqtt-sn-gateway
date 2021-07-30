import { MsgType, State, StateTransitionMachine } from '../src';

describe('StateTransitionMachine', () => {
    it('stateTransition', () => {
        expect(StateTransitionMachine.getStateTransition(State.DISCONNECTED, Buffer.from([0x00, MsgType.CONNECT]))).toBe(State.ACTIVE);

        expect(StateTransitionMachine.getStateTransition(State.ACTIVE, Buffer.from([0x00, MsgType.DISCONNECT]))).toBe(State.DISCONNECTED);
        expect(StateTransitionMachine.getStateTransition(State.ACTIVE, Buffer.from([0x00, MsgType.DISCONNECT, 0x01, 0x00]))).toBe(State.ASLEEP);
        expect(StateTransitionMachine.getStateTransition(State.ACTIVE, Buffer.from([0x00, MsgType.TIMEOUT]))).toBe(State.LOST);

        expect(StateTransitionMachine.getStateTransition(State.AWAKE, Buffer.from([0x00, MsgType.DISCONNECT]))).toBe(State.DISCONNECTED);
        expect(StateTransitionMachine.getStateTransition(State.AWAKE, Buffer.from([0x00, MsgType.CONNECT]))).toBe(State.ACTIVE);
        expect(StateTransitionMachine.getStateTransition(State.AWAKE, Buffer.from([0x00, MsgType.PINGRESP]))).toBe(State.ASLEEP);

        expect(StateTransitionMachine.getStateTransition(State.ASLEEP, Buffer.from([0x00, MsgType.CONNECT]))).toBe(State.ACTIVE);
        expect(StateTransitionMachine.getStateTransition(State.ASLEEP, Buffer.from([0x00, MsgType.PINGREQ]))).toBe(State.AWAKE);
        expect(StateTransitionMachine.getStateTransition(State.ASLEEP, Buffer.from([0x00, MsgType.TIMEOUT]))).toBe(State.LOST);

        expect(StateTransitionMachine.getStateTransition(State.LOST, Buffer.from([0x00, MsgType.CONNECT]))).toBe(State.ACTIVE);
    });
});
