import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../StorageManager.js';

// Mock localStorage
const mockStorage = {};
const localStorageMock = {
    getItem: (key) => mockStorage[key] ?? null,
    setItem: (key, value) => { mockStorage[key] = String(value); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('StorageManager', () => {
    let sm;

    beforeEach(() => {
        localStorageMock.clear();
        sm = new StorageManager();
    });

    it('returns 0 for unknown high score', () => {
        expect(sm.getHighScore('unknown')).toBe(0);
    });

    it('saves and retrieves high score', () => {
        sm.saveHighScore('test', 500);
        expect(sm.getHighScore('test')).toBe(500);
    });

    it('only saves if score is higher', () => {
        sm.saveHighScore('test', 500);
        const result = sm.saveHighScore('test', 300);
        expect(result).toBe(false);
        expect(sm.getHighScore('test')).toBe(500);
    });

    it('returns true on new high score', () => {
        sm.saveHighScore('test', 100);
        expect(sm.saveHighScore('test', 200)).toBe(true);
    });

    it('saves and retrieves settings', () => {
        const settings = { volume: 0.5, difficulty: 'hard' };
        sm.saveSettings('game1', settings);
        expect(sm.getSettings('game1')).toEqual(settings);
    });

    it('returns null for missing settings', () => {
        expect(sm.getSettings('nonexistent')).toBeNull();
    });

    it('uses correct prefix for keys', () => {
        sm.saveHighScore('myGame', 42);
        expect(mockStorage['webGames_myGame_highscore']).toBe('42');
    });
});
