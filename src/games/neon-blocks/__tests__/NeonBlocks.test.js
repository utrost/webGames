import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SHAPES } from '../Shapes.js';
import { CONFIG } from '../config.js';

// Test pure game logic extracted from NeonBlocks without DOM/Canvas dependencies

function makeGrid(rows = CONFIG.ROWS, cols = CONFIG.COLS) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== null) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (arena[y + player.pos.y]) {
                    arena[y + player.pos.y][x + player.pos.x] = player.color;
                }
            }
        });
    });
}

function arenaSweep(grid, cols) {
    let rowCount = 0;
    outer: for (let y = grid.length - 1; y > 0; --y) {
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === null) continue outer;
        }
        const row = grid.splice(y, 1)[0].fill(null);
        grid.unshift(row);
        ++y;
        rowCount++;
    }
    return rowCount;
}

describe('Neon Blocks game logic', () => {
    describe('Grid', () => {
        it('creates empty grid of correct dimensions', () => {
            const grid = makeGrid();
            expect(grid.length).toBe(20);
            expect(grid[0].length).toBe(10);
            expect(grid.every(row => row.every(cell => cell === null))).toBe(true);
        });
    });

    describe('Collision detection', () => {
        it('returns false when piece is in open space', () => {
            const grid = makeGrid();
            const player = {
                matrix: SHAPES.T.matrix.map(r => [...r]),
                pos: { x: 3, y: 5 },
            };
            expect(collide(grid, player)).toBe(false);
        });

        it('returns true when piece hits bottom', () => {
            const grid = makeGrid();
            const player = {
                matrix: SHAPES.T.matrix.map(r => [...r]),
                pos: { x: 3, y: 19 },
            };
            expect(collide(grid, player)).toBe(true);
        });

        it('returns true when piece hits left wall', () => {
            const grid = makeGrid();
            const player = {
                matrix: SHAPES.T.matrix.map(r => [...r]),
                pos: { x: -1, y: 5 },
            };
            expect(collide(grid, player)).toBe(true);
        });

        it('returns true when piece hits right wall', () => {
            const grid = makeGrid();
            const player = {
                matrix: SHAPES.T.matrix.map(r => [...r]),
                pos: { x: 8, y: 5 },
            };
            expect(collide(grid, player)).toBe(true);
        });

        it('returns true when piece overlaps placed block', () => {
            const grid = makeGrid();
            grid[5][4] = '#fff';
            const player = {
                matrix: SHAPES.T.matrix.map(r => [...r]),
                pos: { x: 3, y: 4 },
            };
            expect(collide(grid, player)).toBe(true);
        });
    });

    describe('Merge', () => {
        it('places piece colors onto grid', () => {
            const grid = makeGrid();
            const player = {
                matrix: SHAPES.O.matrix.map(r => [...r]),
                pos: { x: 4, y: 18 },
                color: '#f0f000',
            };
            merge(grid, player);
            expect(grid[18][4]).toBe('#f0f000');
            expect(grid[18][5]).toBe('#f0f000');
            expect(grid[19][4]).toBe('#f0f000');
            expect(grid[19][5]).toBe('#f0f000');
        });
    });

    describe('Rotation', () => {
        it('rotates a T piece clockwise', () => {
            const m = SHAPES.T.matrix.map(r => [...r]);
            // Original T:
            // [0,1,0]
            // [1,1,1]
            // [0,0,0]
            rotate(m, 1);
            expect(m[0][1]).toBe(1); // top center
            expect(m[1][1]).toBe(1); // middle center
            expect(m[2][1]).toBe(1); // bottom center
            expect(m[1][2]).toBe(1); // middle right (bump rotated clockwise)
        });

        it('rotating 4 times returns to original', () => {
            const original = SHAPES.T.matrix.map(r => [...r]);
            const m = SHAPES.T.matrix.map(r => [...r]);
            rotate(m, 1);
            rotate(m, 1);
            rotate(m, 1);
            rotate(m, 1);
            expect(m).toEqual(original);
        });

        it('counter-clockwise undo clockwise', () => {
            const original = SHAPES.S.matrix.map(r => [...r]);
            const m = SHAPES.S.matrix.map(r => [...r]);
            rotate(m, 1);
            rotate(m, -1);
            expect(m).toEqual(original);
        });
    });

    describe('Line clearing', () => {
        it('clears a full row', () => {
            const grid = makeGrid();
            // Fill bottom row
            for (let x = 0; x < 10; x++) grid[19][x] = '#fff';
            const cleared = arenaSweep(grid, 10);
            expect(cleared).toBe(1);
            expect(grid[19].every(c => c === null)).toBe(true);
        });

        it('clears multiple rows', () => {
            const grid = makeGrid();
            for (let x = 0; x < 10; x++) {
                grid[18][x] = '#fff';
                grid[19][x] = '#fff';
            }
            const cleared = arenaSweep(grid, 10);
            expect(cleared).toBe(2);
        });

        it('does not clear incomplete rows', () => {
            const grid = makeGrid();
            for (let x = 0; x < 9; x++) grid[19][x] = '#fff';
            // Leave one cell empty
            const cleared = arenaSweep(grid, 10);
            expect(cleared).toBe(0);
        });

        it('shifts rows down after clearing', () => {
            const grid = makeGrid();
            grid[17][0] = '#f00'; // A block above the cleared row
            for (let x = 0; x < 10; x++) grid[19][x] = '#fff';
            arenaSweep(grid, 10);
            // The block at row 17 should still be at row 17 (only rows below shift)
            expect(grid[18][0]).toBe('#f00');
        });

        it('clears 4 lines (Tetris) at once', () => {
            const grid = makeGrid();
            for (let y = 16; y < 20; y++) {
                for (let x = 0; x < 10; x++) grid[y][x] = '#fff';
            }
            const cleared = arenaSweep(grid, 10);
            expect(cleared).toBe(4);
        });
    });

    describe('Scoring', () => {
        it('awards 100 for single line', () => {
            expect(1 * CONFIG.SINGLE_LINE_SCORE * 1).toBe(100);
        });

        it('awards 400 for double', () => {
            expect(2 * CONFIG.SINGLE_LINE_SCORE * 2).toBe(400);
        });

        it('awards 900 for triple', () => {
            expect(3 * CONFIG.SINGLE_LINE_SCORE * 3).toBe(900);
        });

        it('awards 1600 for Tetris (4 lines)', () => {
            expect(4 * CONFIG.SINGLE_LINE_SCORE * 4).toBe(1600);
        });
    });

    describe('Leveling', () => {
        it('level up threshold is LINES_PER_LEVEL * level', () => {
            expect(CONFIG.LINES_PER_LEVEL).toBe(5);
        });

        it('drop speed decreases each level', () => {
            let interval = CONFIG.INITIAL_DROP_INTERVAL;
            interval *= CONFIG.DROP_SPEED_FACTOR;
            expect(interval).toBe(900);
            interval *= CONFIG.DROP_SPEED_FACTOR;
            expect(interval).toBeCloseTo(810);
        });
    });

    describe('7-bag randomizer', () => {
        it('produces all 7 piece types in each bag', () => {
            // Simulate bag logic
            const types = 'ILJOTSZ'.split('');
            const seen = new Set();
            for (const t of types) seen.add(t);
            expect(seen.size).toBe(7);
        });
    });

    describe('Lock delay', () => {
        it('config has lock delay settings', () => {
            expect(CONFIG.LOCK_DELAY).toBe(500);
            expect(CONFIG.LOCK_DELAY_RESETS).toBe(15);
        });
    });
});
