import { describe, expect, it, vi } from 'vitest';
import { CircuitChase } from '../index.js';
import { DIRECTIONS } from '../Logic.js';

function fakeContext() {
    return new Proxy({}, { get: (target, prop) => target[prop] ?? vi.fn() });
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
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 760, height: 840 })),
    };
}

function installDom() {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalLocalStorage = globalThis.localStorage;
    const originalAdd = globalThis.addEventListener;
    const originalRemove = globalThis.removeEventListener;

    const win = {
        innerWidth: 800,
        innerHeight: 900,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };
    globalThis.window = win;
    globalThis.addEventListener = win.addEventListener;
    globalThis.removeEventListener = win.removeEventListener;
    globalThis.document = { createElement: vi.fn((tag) => (tag === 'canvas' ? makeCanvas() : { style: {}, remove: vi.fn() })) };
    globalThis.localStorage = { getItem: vi.fn(() => '0'), setItem: vi.fn() };

    const container = {
        clientWidth: 760,
        clientHeight: 840,
        appendChild: vi.fn((child) => { child.parentElement = container; }),
    };

    return {
        container,
        restore: () => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
            globalThis.localStorage = originalLocalStorage;
            globalThis.addEventListener = originalAdd;
            globalThis.removeEventListener = originalRemove;
        },
    };
}

function makeGame() {
    const env = installDom();
    const game = new CircuitChase(env.container, vi.fn());
    game.audio.playTone = vi.fn();
    game.resetGameState();
    return { game, ...env };
}

describe('Circuit Chase mechanics', () => {
    it('starts with a maze, pellets, four hunters, lives, and a high score', () => {
        const { game, restore } = makeGame();
        try {
            expect(game.maze.dots.size).toBeGreaterThan(100);
            expect(game.maze.powerNodes.size).toBe(4);
            expect(game.hunters).toHaveLength(4);
            expect(game.player.lives).toBe(3);
            expect(game.highScore).toBe(0);
        } finally {
            restore();
        }
    });

    it('queues keyboard turns and collects dots for score', () => {
        const { game, restore } = makeGame();
        try {
            game.handleKeyDown({ code: 'ArrowLeft', preventDefault: vi.fn() });
            expect(game.queuedDirection).toEqual(DIRECTIONS.LEFT);
            game.updatePlayerStep();
            expect(game.score).toBe(10);
            expect(game.maze.dots.has('15,8')).toBe(false);
        } finally {
            restore();
        }
    });

    it('turns power nodes into frightened-hunter mode', () => {
        const { game, restore } = makeGame();
        try {
            game.player.row = 3;
            game.player.col = 1;
            game.currentDirection = DIRECTIONS.RIGHT;
            game.queuedDirection = DIRECTIONS.RIGHT;
            game.updatePlayerStep();
            expect(game.score).toBe(50);
            expect(game.frightenedTimer).toBeGreaterThan(0);
            expect(game.hunters.every((hunter) => hunter.mode === 'frightened')).toBe(true);
        } finally {
            restore();
        }
    });

    it('eats frightened hunters and sends them home for bonus points', () => {
        const { game, restore } = makeGame();
        try {
            const hunter = game.hunters[0];
            hunter.row = game.player.row;
            hunter.col = game.player.col;
            hunter.mode = 'frightened';
            game.frightenedTimer = 5;
            game.handleHunterCollisions();
            expect(game.score).toBe(200);
            expect(hunter.mode).toBe('returning');
            expect(hunter.row).toBe(hunter.home.row);
        } finally {
            restore();
        }
    });

    it('loses a life on active hunter contact and calls game over after the last life', () => {
        const { game, restore } = makeGame();
        try {
            const hunter = game.hunters[0];
            game.player.invincible = 0;
            hunter.row = game.player.row;
            hunter.col = game.player.col;
            game.handleHunterCollisions();
            expect(game.player.lives).toBe(2);
            expect(game.gameOver).toBe(false);

            game.player.lives = 1;
            game.player.invincible = 0;
            hunter.row = game.player.row;
            hunter.col = game.player.col;
            game.handleHunterCollisions();
            expect(game.gameOver).toBe(true);
            expect(game.onGameOver).toHaveBeenCalledTimes(1);
        } finally {
            restore();
        }
    });
});
