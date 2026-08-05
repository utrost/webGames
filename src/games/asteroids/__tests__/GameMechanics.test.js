import { describe, expect, it, vi } from 'vitest';
import { Asteroids } from '../index.js';
import { Asteroid } from '../Entities.js';

function fakeContext() {
    return new Proxy({}, { get: () => vi.fn() });
}

function makeGame() {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalLocalStorage = globalThis.localStorage;
    const container = {
        clientWidth: 800,
        clientHeight: 600,
        appendChild: vi.fn((child) => { child.parentElement = container; }),
    };

    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn(), innerWidth: 800, innerHeight: 600 };
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

    const game = new Asteroids(container, vi.fn());
    game.audio.playTone = vi.fn();
    game.spawnParticles = vi.fn();
    game.score = 0;

    return {
        game,
        restore: () => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
            globalThis.localStorage = originalLocalStorage;
        },
    };
}

describe('Asteroids game mechanics', () => {
    it('keeps the tracked asteroid list consistent when an asteroid splits', () => {
        const { game, restore } = makeGame();
        try {
            const asteroid = new Asteroid(100, 100, 3);
            game.entities = [asteroid];
            game.asteroids = [asteroid];

            game.destroyAsteroid(asteroid);

            const trackedLiveAsteroids = game.asteroids.filter(a => !a.toBeRemoved);
            const entityLiveAsteroids = game.entities.filter(e => e instanceof Asteroid && !e.toBeRemoved);
            expect(game.asteroids).not.toContain(asteroid);
            expect(trackedLiveAsteroids).toHaveLength(2);
            expect(trackedLiveAsteroids).toEqual(entityLiveAsteroids);
        } finally {
            restore();
        }
    });

    it('resets transient wave timing state on restart', () => {
        const { game, restore } = makeGame();
        try {
            game.waveDelay = 0.4;

            game.resetGameState();

            expect(game.waveDelay).toBe(0);
        } finally {
            restore();
        }
    });

    it('allows intentional edge spawns at x=0', () => {
        const { game, restore } = makeGame();
        try {
            game.entities = [];
            game.asteroids = [];

            game.spawnAsteroid(0, 100, 2);

            expect(game.asteroids).toHaveLength(1);
            expect(game.asteroids[0].pos.x).toBe(0);
            expect(game.asteroids[0].pos.y).toBe(100);
            expect(game.asteroids[0].size).toBe(2);
        } finally {
            restore();
        }
    });
});
