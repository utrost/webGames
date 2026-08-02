import { describe, expect, it, vi } from 'vitest';
import { CosmicBreaker } from '../index.js';
import { CONFIG } from '../config.js';
import { Vector2 } from '../../../core/Vector2.js';

function fakeContext() {
    return new Proxy({}, { get: () => vi.fn() });
}

function makeGame() {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalLocalStorage = globalThis.localStorage;
    const container = {
        clientWidth: CONFIG.CANVAS_WIDTH,
        clientHeight: CONFIG.CANVAS_HEIGHT,
        appendChild: vi.fn((child) => { child.parentElement = container; }),
    };

    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn(), innerWidth: CONFIG.CANVAS_WIDTH, innerHeight: CONFIG.CANVAS_HEIGHT };
    globalThis.document = {
        createElement: vi.fn(() => ({
            style: {},
            parentElement: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            remove: vi.fn(),
            getContext: vi.fn(() => fakeContext()),
        })),
    };
    globalThis.localStorage = { getItem: vi.fn(() => '0'), setItem: vi.fn() };

    const game = new CosmicBreaker(container, vi.fn());
    game.playSound = vi.fn();
    game.audio.playTone = vi.fn();

    return {
        game,
        restore: () => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
            globalThis.localStorage = originalLocalStorage;
        },
    };
}

describe('Cosmic Breaker mechanics', () => {
    it('keeps wide paddle until life loss instead of expiring on a timer', () => {
        const { game, restore } = makeGame();
        try {
            game.isRunning = true;
            game.balls = [{ pos: new Vector2(400, 300), vel: new Vector2(0, 0), active: true }];
            game.bricks = [{ status: 1 }];
            game.powerups = [];
            game.particles = [];
            game.activatePowerUp('WIDE');

            game.update(16);

            expect(game.paddle.width).toBe(CONFIG.PADDLE_WIDTH * CONFIG.WIDE_PADDLE_MULTIPLIER);
        } finally {
            restore();
        }
    });

    it('catches power-ups using their full rectangle, not just their center point', () => {
        const { game, restore } = makeGame();
        try {
            game.isRunning = true;
            game.bricks = [{ status: 1 }];
            game.balls = [{ pos: new Vector2(400, 300), vel: new Vector2(0, 0), active: true }];
            game.particles = [];
            game.powerups = [{
                x: game.paddle.x - 10,
                y: game.paddle.y - 5,
                width: 30,
                height: 15,
                dy: 0,
                type: 'LIFE',
                color: '#e74c3c',
                symbol: 'L',
            }];
            const livesBefore = game.lives;

            game.update(0);

            expect(game.powerups).toHaveLength(0);
            expect(game.lives).toBe(livesBefore + 1);
        } finally {
            restore();
        }
    });
});
