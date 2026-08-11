import { describe, expect, it } from 'vitest';
import {
    DIRECTIONS,
    createMazeState,
    directionBetween,
    findNextHunterDirection,
    isWalkable,
    stepPosition,
} from '../Logic.js';
import { LEVEL } from '../levels.js';

describe('Circuit Chase maze logic', () => {
    it('parses walls, dots, power nodes, player start, and hunter starts from the tile map', () => {
        const state = createMazeState(LEVEL);

        expect(state.rows).toBe(21);
        expect(state.cols).toBe(19);
        expect(state.player).toMatchObject({ row: 15, col: 9 });
        expect(state.hunters).toHaveLength(4);
        expect(state.dots.size).toBeGreaterThan(100);
        expect(state.powerNodes.size).toBe(4);
        expect(isWalkable(state, 0, 0)).toBe(false);
        expect(isWalkable(state, state.player.row, state.player.col)).toBe(true);
    });

    it('moves one grid cell only through open corridors', () => {
        const state = createMazeState(LEVEL);

        expect(stepPosition(state, { row: 15, col: 9 }, DIRECTIONS.LEFT)).toEqual({ row: 15, col: 8 });
        expect(stepPosition(state, { row: 15, col: 9 }, DIRECTIONS.UP)).toEqual({ row: 15, col: 9 });
    });

    it('chooses a shortest-path hunter direction toward the target', () => {
        const state = createMazeState(LEVEL);
        const direction = findNextHunterDirection(state, { row: 15, col: 5 }, { row: 15, col: 9 }, DIRECTIONS.NONE);

        expect(direction).toEqual(DIRECTIONS.RIGHT);
        expect(directionBetween({ row: 15, col: 5 }, { row: 15, col: 6 })).toEqual(DIRECTIONS.RIGHT);
    });

    it('avoids direct reversals when another shortest chase route is available', () => {
        const state = createMazeState(LEVEL);
        const direction = findNextHunterDirection(state, { row: 15, col: 8 }, { row: 15, col: 5 }, DIRECTIONS.RIGHT);

        expect(direction).not.toEqual(DIRECTIONS.LEFT);
        expect([DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.RIGHT]).toContain(direction);
    });
});
