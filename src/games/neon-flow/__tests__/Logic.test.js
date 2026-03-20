import { describe, it, expect } from 'vitest';
import { Grid, TILE_TYPES, PIPE_SHAPES } from '../Logic.js';

describe('Grid', () => {
    it('creates empty grid of correct size', () => {
        const grid = new Grid(5, 6);
        expect(grid.rows).toBe(5);
        expect(grid.cols).toBe(6);
        expect(grid.get(0, 0).type).toBe(TILE_TYPES.EMPTY);
    });

    it('get returns null for out of bounds', () => {
        const grid = new Grid(3, 3);
        expect(grid.get(-1, 0)).toBeNull();
        expect(grid.get(0, 3)).toBeNull();
    });

    it('setTile and get work correctly', () => {
        const grid = new Grid(3, 3);
        grid.setTile(1, 1, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 0);
        const tile = grid.get(1, 1);
        expect(tile.type).toBe(TILE_TYPES.PIPE);
        expect(tile.shape).toBe(PIPE_SHAPES.STRAIGHT);
        expect(tile.rotation).toBe(0);
    });

    it('rotateTile rotates pipes only', () => {
        const grid = new Grid(3, 3);
        grid.setTile(1, 1, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 0);
        expect(grid.rotateTile(1, 1)).toBe(true);
        expect(grid.get(1, 1).rotation).toBe(1);

        // Source should not rotate
        grid.setTile(0, 0, TILE_TYPES.SOURCE, null, 0, '#f00');
        expect(grid.rotateTile(0, 0)).toBe(false);
    });

    it('rotateTile wraps around at 4', () => {
        const grid = new Grid(3, 3);
        grid.setTile(0, 0, TILE_TYPES.PIPE, PIPE_SHAPES.CORNER, 3);
        grid.rotateTile(0, 0);
        expect(grid.get(0, 0).rotation).toBe(0);
    });
});

describe('connects', () => {
    it('straight pipe at rotation 0 connects N and S', () => {
        const grid = new Grid(1, 1);
        grid.setTile(0, 0, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 0);
        const tile = grid.get(0, 0);
        expect(grid.connects(tile, 0)).toBe(true); // N
        expect(grid.connects(tile, 2)).toBe(true); // S
        expect(grid.connects(tile, 1)).toBe(false); // E
        expect(grid.connects(tile, 3)).toBe(false); // W
    });

    it('straight pipe at rotation 1 connects E and W', () => {
        const grid = new Grid(1, 1);
        grid.setTile(0, 0, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 1);
        const tile = grid.get(0, 0);
        expect(grid.connects(tile, 1)).toBe(true); // E
        expect(grid.connects(tile, 3)).toBe(true); // W
        expect(grid.connects(tile, 0)).toBe(false); // N
    });

    it('corner pipe at rotation 0 connects N and E', () => {
        const grid = new Grid(1, 1);
        grid.setTile(0, 0, TILE_TYPES.PIPE, PIPE_SHAPES.CORNER, 0);
        const tile = grid.get(0, 0);
        expect(grid.connects(tile, 0)).toBe(true);
        expect(grid.connects(tile, 1)).toBe(true);
        expect(grid.connects(tile, 2)).toBe(false);
        expect(grid.connects(tile, 3)).toBe(false);
    });

    it('cross pipe connects all directions', () => {
        const grid = new Grid(1, 1);
        grid.setTile(0, 0, TILE_TYPES.PIPE, PIPE_SHAPES.CROSS, 0);
        const tile = grid.get(0, 0);
        for (let d = 0; d < 4; d++) {
            expect(grid.connects(tile, d)).toBe(true);
        }
    });

    it('source connects in all directions', () => {
        const grid = new Grid(1, 1);
        grid.setTile(0, 0, TILE_TYPES.SOURCE, null, 0, '#f00');
        const tile = grid.get(0, 0);
        for (let d = 0; d < 4; d++) {
            expect(grid.connects(tile, d)).toBe(true);
        }
    });
});

describe('calculateFlow', () => {
    it('propagates color from source through pipe to sink', () => {
        // Source(red) -> Straight pipe -> Sink(red)
        const grid = new Grid(1, 3);
        grid.setTile(0, 0, TILE_TYPES.SOURCE, null, 0, '#f00');
        grid.setTile(0, 1, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 1); // E-W
        grid.setTile(0, 2, TILE_TYPES.SINK, null, 0, '#f00');

        grid.calculateFlow();

        expect(grid.get(0, 2).activeColors.has('#f00')).toBe(true);
        expect(grid.checkWinCondition()).toBe(true);
    });

    it('does not propagate through misaligned pipe', () => {
        const grid = new Grid(1, 3);
        grid.setTile(0, 0, TILE_TYPES.SOURCE, null, 0, '#f00');
        grid.setTile(0, 1, TILE_TYPES.PIPE, PIPE_SHAPES.STRAIGHT, 0); // N-S (wrong direction)
        grid.setTile(0, 2, TILE_TYPES.SINK, null, 0, '#f00');

        grid.calculateFlow();

        expect(grid.get(0, 2).activeColors.has('#f00')).toBe(false);
        expect(grid.checkWinCondition()).toBe(false);
    });
});

describe('colorsMatch', () => {
    it('matches primary colors', () => {
        const grid = new Grid(1, 1);
        expect(grid.colorsMatch(new Set(['#f00']), '#f00')).toBe(true);
        expect(grid.colorsMatch(new Set(['#00f']), '#00f')).toBe(true);
    });

    it('matches mixed colors', () => {
        const grid = new Grid(1, 1);
        expect(grid.colorsMatch(new Set(['#f00', '#00f']), '#f0f')).toBe(true); // Magenta
        expect(grid.colorsMatch(new Set(['#f00', '#0f0']), '#ff0')).toBe(true); // Yellow
        expect(grid.colorsMatch(new Set(['#00f', '#0f0']), '#0ff')).toBe(true); // Cyan
        expect(grid.colorsMatch(new Set(['#f00', '#00f', '#0f0']), '#fff')).toBe(true); // White
    });

    it('rejects wrong colors', () => {
        const grid = new Grid(1, 1);
        expect(grid.colorsMatch(new Set(['#f00']), '#00f')).toBe(false);
        expect(grid.colorsMatch(new Set(), '#f00')).toBe(false);
    });
});
