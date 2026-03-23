import { describe, it, expect } from 'vitest';
import { Levels } from '../levels.js';
import { CONFIG } from '../config.js';

describe('Levels', () => {
    it('has 5 levels', () => {
        expect(Levels.length).toBe(5);
    });

    it('every level has a name', () => {
        Levels.forEach((level, i) => {
            expect(level.name).toBeTruthy();
            expect(typeof level.name).toBe('string');
        });
    });

    it('every level has a map array', () => {
        Levels.forEach((level) => {
            expect(Array.isArray(level.map)).toBe(true);
            expect(level.map.length).toBeGreaterThan(0);
        });
    });

    it('all rows have 10 columns', () => {
        Levels.forEach((level) => {
            level.map.forEach((row) => {
                expect(row.length).toBe(10);
            });
        });
    });

    it('brick values are 0-6', () => {
        Levels.forEach((level) => {
            level.map.forEach((row) => {
                row.forEach((cell) => {
                    expect(cell).toBeGreaterThanOrEqual(0);
                    expect(cell).toBeLessThanOrEqual(6);
                });
            });
        });
    });

    it('level names are unique', () => {
        const names = Levels.map(l => l.name);
        expect(new Set(names).size).toBe(names.length);
    });
});

describe('Cosmic Breaker CONFIG', () => {
    it('has required game constants', () => {
        expect(CONFIG.CANVAS_WIDTH).toBeGreaterThan(0);
        expect(CONFIG.CANVAS_HEIGHT).toBeGreaterThan(0);
        expect(CONFIG.PADDLE_WIDTH).toBeGreaterThan(0);
        expect(CONFIG.BALL_RADIUS).toBeGreaterThan(0);
        expect(CONFIG.INITIAL_SPEED).toBeGreaterThan(0);
    });

    it('max speed exceeds initial speed', () => {
        expect(CONFIG.MAX_SPEED).toBeGreaterThan(CONFIG.INITIAL_SPEED);
    });

    it('powerup drop chance is between 0 and 1', () => {
        expect(CONFIG.POWERUP_DROP_CHANCE).toBeGreaterThan(0);
        expect(CONFIG.POWERUP_DROP_CHANCE).toBeLessThanOrEqual(1);
    });

    it('wide paddle multiplier increases paddle size', () => {
        expect(CONFIG.WIDE_PADDLE_MULTIPLIER).toBeGreaterThan(1);
    });
});
