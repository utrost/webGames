import { describe, it, expect } from 'vitest';
import { SHAPES, COLORS } from '../Shapes.js';
import { CONFIG } from '../config.js';

describe('SHAPES', () => {
    const shapeNames = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    it('has all 7 tetrominoes', () => {
        expect(Object.keys(SHAPES).sort()).toEqual(shapeNames.sort());
    });

    it('each shape has a color', () => {
        shapeNames.forEach(name => {
            expect(SHAPES[name].color).toBeTruthy();
            expect(typeof SHAPES[name].color).toBe('string');
        });
    });

    it('each shape has a matrix', () => {
        shapeNames.forEach(name => {
            expect(Array.isArray(SHAPES[name].matrix)).toBe(true);
            expect(SHAPES[name].matrix.length).toBeGreaterThan(0);
        });
    });

    it('matrices are square', () => {
        shapeNames.forEach(name => {
            const matrix = SHAPES[name].matrix;
            const size = matrix.length;
            matrix.forEach(row => {
                expect(row.length).toBe(size);
            });
        });
    });

    it('matrix values are 0 or 1', () => {
        shapeNames.forEach(name => {
            SHAPES[name].matrix.forEach(row => {
                row.forEach(cell => {
                    expect(cell === 0 || cell === 1).toBe(true);
                });
            });
        });
    });

    it('I piece is 4x4', () => {
        expect(SHAPES.I.matrix.length).toBe(4);
    });

    it('O piece is 2x2', () => {
        expect(SHAPES.O.matrix.length).toBe(2);
    });

    it('T, S, Z, J, L pieces are 3x3', () => {
        ['T', 'S', 'Z', 'J', 'L'].forEach(name => {
            expect(SHAPES[name].matrix.length).toBe(3);
        });
    });

    it('each shape has at least one filled cell', () => {
        shapeNames.forEach(name => {
            const hasBlock = SHAPES[name].matrix.some(row => row.some(cell => cell === 1));
            expect(hasBlock).toBe(true);
        });
    });
});

describe('COLORS', () => {
    it('has a color for each shape', () => {
        const shapeNames = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        shapeNames.forEach(name => {
            expect(COLORS[name]).toBeTruthy();
        });
    });

    it('COLORS match SHAPES colors', () => {
        Object.keys(SHAPES).forEach(name => {
            expect(COLORS[name]).toBe(SHAPES[name].color);
        });
    });
});

describe('Neon Blocks CONFIG', () => {
    it('has standard Tetris grid dimensions', () => {
        expect(CONFIG.COLS).toBe(10);
        expect(CONFIG.ROWS).toBe(20);
    });

    it('block size is positive', () => {
        expect(CONFIG.BLOCK_SIZE).toBeGreaterThan(0);
    });

    it('drop speed factor decreases interval', () => {
        expect(CONFIG.DROP_SPEED_FACTOR).toBeGreaterThan(0);
        expect(CONFIG.DROP_SPEED_FACTOR).toBeLessThan(1);
    });
});
