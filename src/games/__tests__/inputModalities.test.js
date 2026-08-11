import { describe, it, expect, vi } from 'vitest';
import { CosmicBreaker } from '../cosmic-breaker/index.js';
import { NeonFlow } from '../neon-flow/index.js';
import { Asteroids } from '../asteroids/index.js';
import { StarfallArmada } from '../starfall-armada/index.js';
import { CircuitChase } from '../circuit-chase/index.js';
import { NeonBlocks } from '../neon-blocks/index.js';
import { Orbit } from '../orbit/index.js';
import { ElementalSandbox } from '../elemental-sandbox/index.js';
import { ELEMENTS } from '../elemental-sandbox/Elements.js';

function fakeContext() {
    return new Proxy({
        createImageData: vi.fn((width, height) => ({ data: new Uint8ClampedArray(width * height * 4) })),
    }, { get: (target, prop) => target[prop] ?? vi.fn() });
}

function makeCanvas() {
    return {
        width: 0,
        height: 0,
        style: {},
        parentElement: null,
        listeners: {},
        addEventListener: vi.fn(function (event, handler) { this.listeners[event] = handler; }),
        removeEventListener: vi.fn(),
        remove: vi.fn(),
        getContext: vi.fn(() => fakeContext()),
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
    };
}

function installDom() {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalLocalStorage = globalThis.localStorage;
    const originalAdd = globalThis.addEventListener;
    const originalRemove = globalThis.removeEventListener;
    const originalNavigator = globalThis.navigator;

    const windowListeners = {};
    const win = {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener: vi.fn((event, handler) => { windowListeners[event] = handler; }),
        removeEventListener: vi.fn(),
    };
    globalThis.window = win;
    globalThis.addEventListener = win.addEventListener;
    globalThis.removeEventListener = win.removeEventListener;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { maxTouchPoints: 0 } });

    globalThis.document = {
        createElement: vi.fn((tag) => {
            if (tag === 'canvas') return makeCanvas();
            return {
                style: {},
                className: '',
                textContent: '',
                children: [],
                classList: { add: vi.fn(), remove: vi.fn() },
                appendChild(child) { this.children.push(child); child.parentElement = this; },
                addEventListener: vi.fn(),
                remove: vi.fn(),
                querySelectorAll: vi.fn(() => []),
            };
        }),
    };
    globalThis.localStorage = { getItem: vi.fn(() => '0'), setItem: vi.fn() };

    const container = {
        clientWidth: 800,
        clientHeight: 600,
        appendChild: vi.fn((child) => { child.parentElement = container; }),
    };

    return {
        container,
        windowListeners,
        restore: () => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
            globalThis.localStorage = originalLocalStorage;
            globalThis.addEventListener = originalAdd;
            globalThis.removeEventListener = originalRemove;
            Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
        },
    };
}

describe('game input modality coverage', () => {
    it('Cosmic Breaker starts from mouse/touch input before audio was initialized', () => {
        const { container, restore } = installDom();
        try {
            const game = new CosmicBreaker(container, vi.fn());
            game.balls = [{ active: false }];
            game.serveBall = vi.fn();

            expect(() => game.clickHandler({ preventDefault: vi.fn() })).not.toThrow();
            expect(game.serveBall).toHaveBeenCalled();
        } finally {
            restore();
        }
    });

    it('Neon Flow accepts mouse/touch rotation before audio was initialized', () => {
        const { container, restore } = installDom();
        try {
            const game = new NeonFlow(container, vi.fn());
            game.paused = false;
            game.inputHandler = vi.fn();
            game.onClick = vi.fn();

            expect(() => game.clickHandler({ preventDefault: vi.fn(), clientX: 10, clientY: 10 })).not.toThrow();
            expect(game.onClick).toHaveBeenCalled();
        } finally {
            restore();
        }
    });

    it('Asteroids exposes mouse pointer controls equivalent to touch regions', () => {
        const { container, restore } = installDom();
        try {
            const game = new Asteroids(container, vi.fn());
            game.setupTouchControls();

            game.handlePointerDown({ preventDefault: vi.fn(), clientX: 700, clientY: 300 });
            expect(game.touchState.fire).toBe(true);

            game.handlePointerMove({ preventDefault: vi.fn(), clientX: 100, clientY: 300 });
            expect(game.touchState.left).toBe(true);

            game.handlePointerUp({ preventDefault: vi.fn() });
            expect(game.touchState).toEqual({ left: false, right: false, thrust: false, fire: false });
        } finally {
            restore();
        }
    });

    it('Starfall Armada maps pointer/touch regions to move and fire controls', () => {
        const { container, restore } = installDom();
        try {
            const game = new StarfallArmada(container, vi.fn());
            game.audio.playTone = vi.fn();
            game.resetGameState();
            game.setupInput();

            game.pointerDownHandler({ preventDefault: vi.fn(), clientX: 100, clientY: 550 });
            expect(game.touchState.left).toBe(true);

            game.pointerMoveHandler({ preventDefault: vi.fn(), clientX: 700, clientY: 550 });
            expect(game.touchState.right).toBe(true);

            game.pointerMoveHandler({ preventDefault: vi.fn(), clientX: 400, clientY: 550 });
            expect(game.playerShots).toHaveLength(1);

            game.pointerUpHandler({ preventDefault: vi.fn() });
            expect(game.touchState).toEqual({ left: false, right: false, fire: false });
        } finally {
            restore();
        }
    });

    it('Circuit Chase maps keyboard and swipe input to queued maze turns', () => {
        const { container, restore } = installDom();
        try {
            const game = new CircuitChase(container, vi.fn());
            game.resetGameState();
            game.setupInput();

            game.handleKeyDown({ code: 'ArrowUp', preventDefault: vi.fn() });
            expect(game.queuedDirection.name).toBe('up');

            game.pointerDownHandler({ preventDefault: vi.fn(), clientX: 300, clientY: 300 });
            game.pointerUpHandler({ preventDefault: vi.fn(), clientX: 360, clientY: 300 });
            expect(game.queuedDirection.name).toBe('right');
        } finally {
            restore();
        }
    });

    it('Neon Blocks maps mouse drag/tap gestures to the same actions as touch', () => {
        const { container, restore } = installDom();
        try {
            const game = new NeonBlocks(container, vi.fn());
            game.resetGameState();
            const moveSpy = vi.spyOn(game, 'playerMove');
            const rotateSpy = vi.spyOn(game, 'playerRotate');

            game.setupPointerControls();
            game.handlePointerStart({ preventDefault: vi.fn(), clientX: 100, clientY: 100 });
            game.handlePointerEnd({ preventDefault: vi.fn(), clientX: 180, clientY: 102 });
            expect(moveSpy).toHaveBeenCalledWith(1);

            game.handlePointerStart({ preventDefault: vi.fn(), clientX: 100, clientY: 100 });
            game.handlePointerEnd({ preventDefault: vi.fn(), clientX: 102, clientY: 100 });
            expect(rotateSpy).toHaveBeenCalledWith(1);
        } finally {
            restore();
        }
    });

    it('Orbit can launch a projectile using keyboard-only aiming controls', () => {
        const { container, restore } = installDom();
        try {
            const game = new Orbit(container, vi.fn());
            game.audio.playTone = vi.fn();
            game.resetGameState();
            game.setupInput();
            const before = game.bodies.length;

            game.handleKey({ code: 'ArrowRight', preventDefault: vi.fn() });
            game.handleKey({ code: 'KeyW', preventDefault: vi.fn() });
            game.handleKey({ code: 'Space', preventDefault: vi.fn() });

            expect(game.bodies.length).toBe(before + 1);
            expect(game.bodies.at(-1).type).toBe('Projectile');
        } finally {
            restore();
        }
    });

    it('Elemental Sandbox can move its brush and paint cells from the keyboard', () => {
        const { container, restore } = installDom();
        try {
            const game = new ElementalSandbox(container, vi.fn());
            game.createUI();
            game.setupInput();
            game.selectedElement = ELEMENTS.SAND;
            game.brushSize = 1;
            game.drawX = 10;
            game.drawY = 10;

            game.handleKey({ code: 'ArrowRight', key: 'ArrowRight', preventDefault: vi.fn() });
            game.handleKey({ code: 'Space', key: ' ', preventDefault: vi.fn() });

            expect(game.drawX).toBe(11);
            expect(game.sim.get(11, 10)).toBe(ELEMENTS.SAND);
        } finally {
            restore();
        }
    });

    it('Neon Flow restart after campaign completion allows a fresh completion', () => {
        const { container, restore } = installDom();
        try {
            const onGameOver = vi.fn();
            const game = new NeonFlow(container, onGameOver);
            game.resetGameState();

            game.loadLevel(999);
            expect(game.gameOver).toBe(true);
            expect(onGameOver).toHaveBeenCalledTimes(1);

            game.resetGameState();
            expect(game.gameOver).toBe(false);
            expect(game.currentLevelIndex).toBe(0);

            game.loadLevel(999);
            expect(game.gameOver).toBe(true);
            expect(onGameOver).toHaveBeenCalledTimes(2);
        } finally {
            restore();
        }
    });
});
