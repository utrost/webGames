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
});
