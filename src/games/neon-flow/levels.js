import { TILE_TYPES, PIPE_SHAPES } from './Logic.js';

// Legend for terse map definition
// S: Source, K: Sink, I: Straight, L: Corner, T: Tee, X: Cross, .: Empty
// S(color), K(color)

export const Levels = [
    // Level 1: Intro (Straight Line)
    {
        name: "First Connection",
        rows: 5, cols: 5,
        tiles: [
            { r: 2, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' }, // Red
            { r: 2, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 }, // Wrong rot
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 2, c: 4, type: TILE_TYPES.SINK, color: '#f00' }
        ]
    },
    // Level 2: The Turn
    {
        name: "Right Angles",
        rows: 6, cols: 6,
        tiles: [
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#00f' }, // Blue
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 4, type: TILE_TYPES.SINK, color: '#00f' }
        ]
    },
    // Level 3: Dual Flow (Red + Blue separate)
    {
        name: "Parallel Lines",
        rows: 6, cols: 6,
        tiles: [
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 4, c: 1, type: TILE_TYPES.SOURCE, color: '#00f' },

            // Pipes (Scrambled rotations)
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 4, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 4, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },

            { r: 1, c: 4, type: TILE_TYPES.SINK, color: '#f00' },
            { r: 4, c: 4, type: TILE_TYPES.SINK, color: '#00f' }
        ]
    },
    // Level 4: Mixing (Magenta)
    {
        name: "Fusion",
        rows: 7, cols: 7,
        tiles: [
            { r: 1, c: 3, type: TILE_TYPES.SOURCE, color: '#f00' }, // Top Red
            { r: 5, c: 3, type: TILE_TYPES.SOURCE, color: '#00f' }, // Bottom Blue

            // Top Path
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // Bottom Path
            { r: 4, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },

            // Center Junction
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },

            // Output to Right
            { r: 3, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 5, type: TILE_TYPES.SINK, color: '#f0f' } // Magenta Sink
        ]
    }
];
