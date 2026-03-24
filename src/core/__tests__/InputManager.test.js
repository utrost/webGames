import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager } from '../InputManager.js';

function makeCanvas() {
    const listeners = {};
    return {
        addEventListener: vi.fn((evt, fn) => { listeners[evt] = fn; }),
        removeEventListener: vi.fn(),
        _fire(evt, data) { if (listeners[evt]) listeners[evt](data); },
    };
}

describe('InputManager', () => {
    let canvas, input;
    const origAdd = globalThis.addEventListener;
    const origRemove = globalThis.removeEventListener;
    let globalListeners;

    beforeEach(() => {
        canvas = makeCanvas();
        globalListeners = {};
        globalThis.addEventListener = vi.fn((evt, fn) => { globalListeners[evt] = fn; });
        globalThis.removeEventListener = vi.fn();
        input = new InputManager(canvas);
    });

    afterEach(() => {
        globalThis.addEventListener = origAdd;
        globalThis.removeEventListener = origRemove;
    });

    it('tracks key state', () => {
        expect(input.isDown('ArrowLeft')).toBe(false);
        globalListeners.keydown({ code: 'ArrowLeft' });
        expect(input.isDown('ArrowLeft')).toBe(true);
        globalListeners.keyup({ code: 'ArrowLeft' });
        expect(input.isDown('ArrowLeft')).toBe(false);
    });

    it('tracks just-pressed keys', () => {
        globalListeners.keydown({ code: 'Space' });
        expect(input.wasPressed('Space')).toBe(true);
        expect(input.wasPressed('Space')).toBe(false);
    });

    it('detects tap gesture', () => {
        canvas._fire('touchstart', {
            preventDefault: vi.fn(),
            touches: [{ clientX: 100, clientY: 100 }],
        });
        canvas._fire('touchend', {
            preventDefault: vi.fn(),
            changedTouches: [{ clientX: 102, clientY: 100 }],
        });
        expect(input.consumeGesture()).toBe('tap');
        expect(input.consumeGesture()).toBeNull();
    });

    it('detects swipe-right gesture', () => {
        canvas._fire('touchstart', {
            preventDefault: vi.fn(),
            touches: [{ clientX: 100, clientY: 100 }],
        });
        canvas._fire('touchmove', {
            preventDefault: vi.fn(),
            touches: [{ clientX: 160, clientY: 105 }],
        });
        canvas._fire('touchend', {
            preventDefault: vi.fn(),
            changedTouches: [{ clientX: 160, clientY: 105 }],
        });
        expect(input.consumeGesture()).toBe('swipe-right');
    });

    it('detects swipe-down gesture', () => {
        canvas._fire('touchstart', {
            preventDefault: vi.fn(),
            touches: [{ clientX: 100, clientY: 100 }],
        });
        canvas._fire('touchmove', {
            preventDefault: vi.fn(),
            touches: [{ clientX: 105, clientY: 200 }],
        });
        canvas._fire('touchend', {
            preventDefault: vi.fn(),
            changedTouches: [{ clientX: 105, clientY: 200 }],
        });
        expect(input.consumeGesture()).toBe('swipe-down');
    });

    it('cleans up on destroy', () => {
        input.destroy();
        expect(input.keys).toEqual({});
        expect(globalThis.removeEventListener).toHaveBeenCalled();
    });
});
