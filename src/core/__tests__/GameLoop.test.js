import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../GameLoop.js';

describe('GameLoop', () => {
    let rafCallbacks;
    let rafId;

    beforeEach(() => {
        rafCallbacks = [];
        rafId = 0;
        vi.stubGlobal('requestAnimationFrame', (cb) => {
            const id = ++rafId;
            rafCallbacks.push({ id, cb });
            return id;
        });
        vi.stubGlobal('cancelAnimationFrame', (id) => {
            rafCallbacks = rafCallbacks.filter(r => r.id !== id);
        });
        vi.stubGlobal('performance', { now: () => 0 });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('constructs with update and render callbacks', () => {
        const update = vi.fn();
        const render = vi.fn();
        const loop = new GameLoop(update, render);
        expect(loop.update).toBe(update);
        expect(loop.render).toBe(render);
        expect(loop.isRunning).toBe(false);
    });

    it('starts the loop', () => {
        const loop = new GameLoop(vi.fn(), vi.fn());
        loop.start();
        expect(loop.isRunning).toBe(true);
        expect(rafCallbacks.length).toBe(1);
    });

    it('does not start twice', () => {
        const loop = new GameLoop(vi.fn(), vi.fn());
        loop.start();
        loop.start();
        expect(rafCallbacks.length).toBe(1);
    });

    it('calls update and render on tick', () => {
        const update = vi.fn();
        const render = vi.fn();
        const loop = new GameLoop(update, render);
        loop.start();

        // Simulate a frame at 16ms
        const callback = rafCallbacks[0].cb;
        callback(16);

        expect(update).toHaveBeenCalledTimes(1);
        expect(render).toHaveBeenCalledTimes(1);
    });

    it('passes delta time in seconds to update', () => {
        const update = vi.fn();
        const loop = new GameLoop(update, vi.fn());
        loop.start();

        const callback = rafCallbacks[0].cb;
        callback(1000); // 1 second after lastTime=0
        expect(update).toHaveBeenCalledWith(1);
    });

    it('stops the loop', () => {
        const loop = new GameLoop(vi.fn(), vi.fn());
        loop.start();
        loop.stop();
        expect(loop.isRunning).toBe(false);
    });
});
