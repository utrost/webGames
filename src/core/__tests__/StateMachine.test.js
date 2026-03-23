import { describe, it, expect, vi } from 'vitest';
import { StateMachine } from '../StateMachine.js';

describe('StateMachine', () => {
    it('initializes with given state', () => {
        const sm = new StateMachine('idle');
        expect(sm.state).toBe('idle');
        expect(sm.is('idle')).toBe(true);
    });

    it('is() returns false for non-current state', () => {
        const sm = new StateMachine('idle');
        expect(sm.is('running')).toBe(false);
    });

    it('addTransition returns this for chaining', () => {
        const sm = new StateMachine('idle');
        const result = sm.addTransition('idle', 'start', 'running');
        expect(result).toBe(sm);
    });

    it('transitions on valid event', () => {
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        const result = sm.send('start');
        expect(result).toBe(true);
        expect(sm.state).toBe('running');
    });

    it('returns false on invalid event', () => {
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        expect(sm.send('stop')).toBe(false);
        expect(sm.state).toBe('idle');
    });

    it('returns false when no transitions from current state', () => {
        const sm = new StateMachine('idle');
        expect(sm.send('anything')).toBe(false);
    });

    it('calls onExit callback with state and event', () => {
        const exitCb = vi.fn();
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        sm.setOnExit('idle', exitCb);
        sm.send('start');
        expect(exitCb).toHaveBeenCalledWith('idle', 'start');
    });

    it('calls onEnter callback with new state and previous state', () => {
        const enterCb = vi.fn();
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        sm.setOnEnter('running', enterCb);
        sm.send('start');
        expect(enterCb).toHaveBeenCalledWith('running', 'idle');
    });

    it('calls onExit before onEnter', () => {
        const order = [];
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        sm.setOnExit('idle', () => order.push('exit'));
        sm.setOnEnter('running', () => order.push('enter'));
        sm.send('start');
        expect(order).toEqual(['exit', 'enter']);
    });

    it('supports multiple transitions from same state', () => {
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running');
        sm.addTransition('idle', 'configure', 'settings');
        sm.send('configure');
        expect(sm.state).toBe('settings');
    });

    it('supports chained transitions', () => {
        const sm = new StateMachine('idle');
        sm.addTransition('idle', 'start', 'running')
          .addTransition('running', 'pause', 'paused')
          .addTransition('paused', 'resume', 'running');

        sm.send('start');
        expect(sm.state).toBe('running');
        sm.send('pause');
        expect(sm.state).toBe('paused');
        sm.send('resume');
        expect(sm.state).toBe('running');
    });

    it('setOnEnter and setOnExit return this for chaining', () => {
        const sm = new StateMachine('idle');
        expect(sm.setOnEnter('idle', () => {})).toBe(sm);
        expect(sm.setOnExit('idle', () => {})).toBe(sm);
    });
});
