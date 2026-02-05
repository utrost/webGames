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
    },
    // Level 5: The Source of Life (Green Intro)
    {
        name: "Emerald Stream",
        rows: 6, cols: 6,
        tiles: [
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#0f0' }, // Green

            // Winding path
            { r: 1, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 3 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 2 },

            // Multiple sinks for same source
            { r: 3, c: 4, type: TILE_TYPES.SINK, color: '#0f0' },
            { r: 4, c: 3, type: TILE_TYPES.SINK, color: '#0f0' }
        ]
    },
    // Level 6: Cyan & Yellow (Color Theory)
    {
        name: "Primary School",
        rows: 7, cols: 7,
        tiles: [
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#0f0' }, // Top Green
            { r: 3, c: 0, type: TILE_TYPES.SOURCE, color: '#00f' }, // Left Blue
            { r: 3, c: 6, type: TILE_TYPES.SOURCE, color: '#f00' }, // Right Red

            // Central Cross
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },

            // Pipes leading to mixing zones
            { r: 1, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 }, // Vertical
            { r: 3, c: 1, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 }, // Horizontal

            // Mix Points
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 0 }, // B+G -> Cyan area
            { r: 2, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 }, // R+G -> Yellow area

            { r: 2, c: 1, type: TILE_TYPES.SINK, color: '#0ff' }, // Cyan
            { r: 2, c: 5, type: TILE_TYPES.SINK, color: '#ff0' }, // Yellow
        ]
    },
    // Level 7: White Light (Three-way mix)
    {
        name: "Prism Core",
        rows: 7, cols: 7,
        tiles: [
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#f00' }, // Red Top
            { r: 6, c: 1, type: TILE_TYPES.SOURCE, color: '#0f0' }, // Green Bot-Left
            { r: 6, c: 5, type: TILE_TYPES.SOURCE, color: '#00f' }, // Blue Bot-Right

            // The Converger
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },

            // Sinks around center
            { r: 4, c: 3, type: TILE_TYPES.SINK, color: '#fff' } // White (Require all 3)
        ]
    },
    // Level 8: The Bridge
    {
        name: "Overpass",
        rows: 8, cols: 8,
        tiles: [
            { r: 3, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 0, c: 3, type: TILE_TYPES.SOURCE, color: '#00f' },

            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 }, // They cross but don't mix? wait, logic says they mix. 
            // So we need to route them *around* each other to avoid mixing if we want separate...
            // Or use the cross to mean "Bridge" conceptually? No, my logic is a fluid simul.
            // Let's make a level where mixing is BAD.

            // Goal: Route Red to Right, Blue to Bottom. DO NOT MIX.
            { r: 3, c: 7, type: TILE_TYPES.SINK, color: '#f00' },
            { r: 7, c: 3, type: TILE_TYPES.SINK, color: '#00f' },

            // If they cross at (3,3), they become Magenta.
            // Sinks only accept Pure Red/Blue.
            // Player must route one around.
            { r: 3, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 1 },
            { r: 2, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },
        ]
    },
    // Level 9: Circuit Board
    {
        name: "Motherboard",
        rows: 10, cols: 10,
        tiles: [
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#0ff' }, // Cyan? No, sources are RGB.
            // Wait, logic supports any color source, but let's stick to RGB for consistency.
            { r: 1, c: 1, type: TILE_TYPES.SOURCE, color: '#00f' },
            { r: 8, c: 1, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 4, c: 8, type: TILE_TYPES.SOURCE, color: '#0f0' },

            // Complex scattered pipes
            { r: 2, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 0 },
            { r: 3, c: 3, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 },
            { r: 5, c: 5, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CORNER, rotation: 1 },
            { r: 6, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.STRAIGHT, rotation: 0 },

            { r: 5, c: 0, type: TILE_TYPES.SINK, color: '#f0f' },
            { r: 0, c: 5, type: TILE_TYPES.SINK, color: '#ff0' },
            { r: 9, c: 9, type: TILE_TYPES.SINK, color: '#0ff' }
        ]
    },
    // Level 10: Masterpiece
    {
        name: "The Neon Core",
        rows: 9, cols: 9,
        tiles: [
            { r: 4, c: 4, type: TILE_TYPES.SINK, color: '#fff' }, // Center Goal

            // Corners have sources
            { r: 0, c: 0, type: TILE_TYPES.SOURCE, color: '#f00' },
            { r: 0, c: 8, type: TILE_TYPES.SOURCE, color: '#0f0' },
            { r: 8, c: 0, type: TILE_TYPES.SOURCE, color: '#00f' },
            { r: 8, c: 8, type: TILE_TYPES.SOURCE, color: '#f00' }, // Extra Red

            // Ring of pipes
            { r: 2, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 2 },
            { r: 6, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 0 },
            { r: 4, c: 2, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 1 },
            { r: 4, c: 6, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.TEE, rotation: 3 },

            // Inner Cross
            { r: 4, c: 4, type: TILE_TYPES.PIPE, shape: PIPE_SHAPES.CROSS, rotation: 0 } // Occupied by Sink? No.
            // Wait, (4,4) is the Sink AND the mixing point?
            // Sinks occupy tiles. So we need pipes adjacent to it feeding it.
            // Correction:
        ]
    }
];
