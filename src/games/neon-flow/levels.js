import { TILE_TYPES, PIPE_SHAPES } from './Logic.js';

export const Levels = [
    // Level 1: Intro (Straight Line)
    {
        name: "First Connection",
        rows: 5, cols: 5,
        tiles: [
            { r: 2, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 2, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
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
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#00f' },
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
            { r: 1, c: 3, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 5, c: 3, type: TILE_TYPES.SOURCE, color: '#00f' },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 4, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            { r: 3, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 5, type: TILE_TYPES.SINK, color: '#f0f' }
        ]
    },
    // Level 5: Green Intro
    {
        name: "Emerald Stream",
        rows: 6, cols: 6,
        tiles: [
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#0f0' },
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 2 },
            { r: 3, c: 4, type: TILE_TYPES.SINK, color: '#0f0' },
            { r: 4, c: 3, type: TILE_TYPES.SINK, color: '#0f0' }
        ]
    },
    // Level 6: Color Theory
    {
        name: "Primary School",
        rows: 7, cols: 7,
        tiles: [
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#0f0' },
            { r: 3, c: 0, type: TILE_TYPES.SOURCE, color: '#00f' },
            { r: 3, c: 6, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 2, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 2, c: 1, type: TILE_TYPES.SINK, color: '#0ff' },
            { r: 2, c: 5, type: TILE_TYPES.SINK, color: '#ff0' }
        ]
    },
    // Level 7: Three-way mix to white
    {
        name: "Prism Core",
        rows: 7, cols: 7,
        tiles: [
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 6, c: 0, type: TILE_TYPES.SOURCE, color: '#0f0' },
            { r: 6, c: 6, type: TILE_TYPES.SOURCE, color: '#00f' },
            // Red flows down
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            // Green flows up-right
            { r: 5, c: 0, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 5, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 5, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 4, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 4, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // Blue flows up-left
            { r: 5, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 5, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 5, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 4, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            // Convergence
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            // Output
            { r: 3, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 3, c: 5, type: TILE_TYPES.SINK, color: '#fff' }
        ]
    },
    // Level 8: Route colors around each other
    {
        name: "Overpass",
        rows: 7, cols: 7,
        tiles: [
            { r: 3, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#00f' },
            // Red must go right without crossing blue
            { r: 3, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 2, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 3, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 3, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 3, c: 6, type: TILE_TYPES.SINK, color: '#f00' },
            // Blue must go down
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 1, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 4, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 5, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 5, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 5, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 6, c: 3, type: TILE_TYPES.SINK, color: '#00f' }
        ]
    },
    // Level 9: Complex mixing with multiple outputs
    {
        name: "Motherboard",
        rows: 8, cols: 8,
        tiles: [
            { r: 0, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 0, c: 7, type: TILE_TYPES.SOURCE, color: '#00f' },
            { r: 7, c: 3, type: TILE_TYPES.SOURCE, color: '#0f0' },
            // Red path down-right
            { r: 1, c: 0, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 1, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 2 },
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            // Blue path down-left
            { r: 1, c: 7, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 1, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 1 },
            { r: 1, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            // R+B mixing column
            { r: 2, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // R+B sink (magenta)
            { r: 3, c: 3, type: TILE_TYPES.SINK, color: '#f0f' },
            // Blue-only path to mixing with green
            { r: 2, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 4, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 4, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // Green path up
            { r: 6, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 5, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 5, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // Cyan sink (B+G)
            { r: 4, c: 3, type: TILE_TYPES.SINK, color: '#0ff' }
        ]
    },
    // Level 10: Master puzzle — all three mix to white at center
    {
        name: "The Neon Core",
        rows: 9, cols: 9,
        tiles: [
            // Three corner sources
            { r: 0, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 0, c: 8, type: TILE_TYPES.SOURCE, color: '#0f0' },
            { r: 8, c: 4, type: TILE_TYPES.SOURCE, color: '#00f' },
            // Red path: (0,0) -> down -> right -> center
            { r: 1, c: 0, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 1, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 2 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 3, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            // Green path: (0,8) -> down -> left -> center
            { r: 1, c: 8, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 1, c: 7, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 1, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 },
            { r: 2, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 3, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // Blue path: (8,4) -> up -> to center
            { r: 7, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 6, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 5, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            // Convergence at center
            { r: 4, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            // Side sinks for partial mixes
            { r: 4, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 4, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 4, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 4, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            // White sink below center
            { r: 4, c: 7, type: TILE_TYPES.SINK, color: '#fff' },
            // Yellow sink (R+G)
            { r: 4, c: 1, type: TILE_TYPES.SINK, color: '#ff0' }
        ]
    }
];
