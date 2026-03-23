import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing
const mockStorage = {};
const localStorageMock = {
    getItem: (key) => mockStorage[key] ?? null,
    setItem: (key, value) => { mockStorage[key] = String(value); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

import { StatsTracker } from '../StatsTracker.js';

describe('StatsTracker', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('initializes with default stats when no saved data', () => {
        const tracker = new StatsTracker();
        const stats = tracker.getStats();
        expect(stats.totalGamesPlayed).toBe(0);
        expect(stats.totalTimePlayed).toBe(0);
        expect(stats.gamesPlayed).toEqual({});
    });

    it('startSession increments totalGamesPlayed', () => {
        const tracker = new StatsTracker();
        tracker.startSession('asteroids');
        expect(tracker.getStats().totalGamesPlayed).toBe(1);
    });

    it('startSession tracks per-game plays', () => {
        const tracker = new StatsTracker();
        tracker.startSession('asteroids');
        tracker.endSession();
        tracker.startSession('asteroids');
        expect(tracker.getGameStats('asteroids').plays).toBe(2);
    });

    it('endSession records elapsed time', () => {
        const tracker = new StatsTracker();
        const now = Date.now();
        vi.spyOn(Date, 'now')
          .mockReturnValueOnce(now)       // startSession
          .mockReturnValueOnce(now + 5000); // endSession (5 seconds later)

        tracker.startSession('orbit');
        tracker.endSession();

        expect(tracker.getStats().totalTimePlayed).toBeCloseTo(5, 0);
        expect(tracker.getGameStats('orbit').totalTime).toBeCloseTo(5, 0);

        vi.restoreAllMocks();
    });

    it('endSession does nothing without startSession', () => {
        const tracker = new StatsTracker();
        tracker.endSession();
        expect(tracker.getStats().totalTimePlayed).toBe(0);
    });

    it('getGameStats returns defaults for unknown game', () => {
        const tracker = new StatsTracker();
        expect(tracker.getGameStats('unknown')).toEqual({ plays: 0, totalTime: 0 });
    });

    it('getStats returns a copy', () => {
        const tracker = new StatsTracker();
        const stats = tracker.getStats();
        stats.totalGamesPlayed = 999;
        expect(tracker.getStats().totalGamesPlayed).toBe(0);
    });

    it('persists stats across instances', () => {
        const tracker1 = new StatsTracker();
        tracker1.startSession('neon-flow');
        tracker1.endSession();

        const tracker2 = new StatsTracker();
        expect(tracker2.getStats().totalGamesPlayed).toBe(1);
        expect(tracker2.getGameStats('neon-flow').plays).toBe(1);
    });
});
