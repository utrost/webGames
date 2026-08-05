import { describe, expect, it, vi } from 'vitest';
import { StarfallArmada } from '../index.js';

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
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
    };
}

function installDom() {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalLocalStorage = globalThis.localStorage;
    const originalAdd = globalThis.addEventListener;
    const originalRemove = globalThis.removeEventListener;

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
    globalThis.document = {
        createElement: vi.fn((tag) => {
            if (tag === 'canvas') return makeCanvas();
            return { style: {}, appendChild: vi.fn(), remove: vi.fn() };
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
        },
    };
}

function makeGame() {
    const env = installDom();
    const game = new StarfallArmada(env.container, vi.fn());
    game.audio.playTone = vi.fn();
    game.resetGameState();
    return { game, ...env };
}

describe('Starfall Armada mechanics', () => {
    it('starts with a centered defender and an alien formation', () => {
        const { game, restore } = makeGame();
        try {
            expect(game.player.x).toBeCloseTo(game.width / 2 - game.player.width / 2);
            expect(game.player.lives).toBe(3);
            expect(game.aliens).toHaveLength(40);
            expect(new Set(game.aliens.map((alien) => alien.row)).size).toBe(5);
        } finally {
            restore();
        }
    });

    it('keeps the defender inside the playfield when moving', () => {
        const { game, restore } = makeGame();
        try {
            game.keys.ArrowLeft = true;
            game.player.x = 1;
            game.update(1);
            expect(game.player.x).toBe(0);

            game.keys.ArrowLeft = false;
            game.keys.ArrowRight = true;
            game.player.x = game.width - game.player.width - 1;
            game.update(1);
            expect(game.player.x).toBe(game.width - game.player.width);
        } finally {
            restore();
        }
    });

    it('fires only one active defender shot until that shot is gone', () => {
        const { game, restore } = makeGame();
        try {
            game.firePlayerShot();
            game.firePlayerShot();
            expect(game.playerShots).toHaveLength(1);
            expect(game.playerShots[0].vx).toBe(0);
            expect(game.playerShots[0].vy).toBeLessThan(0);
        } finally {
            restore();
        }
    });

    it('reverses and descends the formation when it reaches an edge', () => {
        const { game, restore } = makeGame();
        try {
            game.formationDirection = 1;
            game.aliens = [{ x: game.width - 20, y: 80, width: 28, height: 18, row: 0, col: 0, points: 30 }];
            game.updateFormation(0.1);
            expect(game.formationDirection).toBe(-1);
            expect(game.aliens[0].y).toBeGreaterThan(80);
        } finally {
            restore();
        }
    });

    it('scores hits, removes aliens, and starts a harder next wave', () => {
        const { game, restore } = makeGame();
        try {
            game.aliens = [{ x: 100, y: 100, width: 30, height: 20, row: 1, col: 1, points: 20 }];
            game.playerShots = [{ x: 110, y: 105, width: 4, height: 12, vx: 0, vy: -500 }];
            game.handleCollisions();
            expect(game.score).toBe(20);
            expect(game.aliens).toHaveLength(0);

            game.update(1.1);
            expect(game.wave).toBe(2);
            expect(game.aliens).toHaveLength(40);
            expect(game.formationSpeed).toBeGreaterThan(35);
        } finally {
            restore();
        }
    });

    it('ends the game when aliens reach the defender line', () => {
        const { game, restore } = makeGame();
        try {
            game.aliens = [{ x: 100, y: game.defenseLine + 1, width: 30, height: 20, row: 0, col: 0, points: 10 }];
            game.update(0.016);
            expect(game.gameOver).toBe(true);
            expect(game.onGameOver).toHaveBeenCalledTimes(1);
        } finally {
            restore();
        }
    });
});
