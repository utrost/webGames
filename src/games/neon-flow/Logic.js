export const TILE_TYPES = {
    EMPTY: 0,
    SOURCE: 1, // Emitter
    SINK: 2,   // Receiver
    PIPE: 3
};

export const PIPE_SHAPES = {
    STRAIGHT: 'I',
    CORNER: 'L',
    TEE: 'T',
    CROSS: 'X'
};

export class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tiles = [];

        // Initialize empty grid
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({
                    type: TILE_TYPES.EMPTY,
                    shape: null,
                    rotation: 0, // 0, 1, 2, 3 (x90 deg clockwise)
                    color: null, // For source/sink
                    activeColors: new Set() // For flow simulation
                });
            }
            this.tiles.push(row);
        }
    }

    get(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
        return this.tiles[r][c];
    }

    setTile(r, c, type, shape = null, rotation = 0, color = null) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
        this.tiles[r][c] = {
            type,
            shape,
            rotation,
            color,
            activeColors: new Set()
        };
    }

    rotateTile(r, c) {
        const tile = this.get(r, c);
        if (tile && tile.type === TILE_TYPES.PIPE) {
            tile.rotation = (tile.rotation + 1) % 4;
            return true;
        }
        return false;
    }

    calculateFlow() {
        // 1. Reset all active colors
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.tiles[r][c].activeColors.clear();
            }
        }

        // 2. Find Sources
        const queue = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tile = this.tiles[r][c];
                if (tile.type === TILE_TYPES.SOURCE) {
                    // Activate source tile with its own color
                    tile.activeColors.add(tile.color);
                    queue.push({ r, c, color: tile.color }); // Source pushes to neighbors
                }
            }
        }

        // 3. Propagate Flow (BFS)
        const visited = new Set(); // Avoid infinite loops

        while (queue.length > 0) {
            const { r, c, color } = queue.shift();
            const currentTile = this.get(r, c);
            const key = `${r},${c},${color}`;

            if (visited.has(key)) continue;
            visited.add(key);

            // Check all 4 neighbors
            // Directions: 0=Np, 1=East, 2=South, 3=West
            const dr = [-1, 0, 1, 0];
            const dc = [0, 1, 0, -1];

            for (let dir = 0; dir < 4; dir++) {
                // If current tile can output to this direction
                if (!this.connects(currentTile, dir)) continue;

                const nr = r + dr[dir];
                const nc = c + dc[dir];
                const neighbor = this.get(nr, nc);

                if (neighbor) {
                    // Calculate "incoming" direction from neighbor's POV
                    const incomingDir = (dir + 2) % 4;

                    // If neighbor accepts input from this direction
                    if (this.connects(neighbor, incomingDir)) {
                        // Propagate color
                        if (!neighbor.activeColors.has(color)) {
                            neighbor.activeColors.add(color);
                            queue.push({ r: nr, c: nc, color: color });
                        }
                    }
                }
            }
        }
    }

    // Check if a tile has a connection pointing in a specific direction (0,1,2,3)
    connects(tile, dir) {
        if (!tile) return false;

        // Sources connect everywhere (simplification, usually 1 way)
        if (tile.type === TILE_TYPES.SOURCE) return true;

        // Sinks accept from everywhere
        if (tile.type === TILE_TYPES.SINK) return true;

        if (tile.type === TILE_TYPES.PIPE) {
            // Apply rotation
            // shape definition: which ports are open (0=N, 1=E, 2=S, 3=W)
            // relative to 0 rotation.
            // e.g. Straight at rot 0 connects N(0) and S(2).
            // at rot 1 connects E(1) and W(3).
            // Formula: (basePort + rotation) % 4 == dir

            let ports = [];
            switch (tile.shape) {
                case PIPE_SHAPES.STRAIGHT: ports = [0, 2]; break;
                case PIPE_SHAPES.CORNER: ports = [0, 1]; break; // N and E
                case PIPE_SHAPES.TEE: ports = [0, 1, 3]; break; // N, E, W
                case PIPE_SHAPES.CROSS: ports = [0, 1, 2, 3]; break;
            }

            // Check if any port rotates to match `dir`
            return ports.some(p => (p + tile.rotation) % 4 === dir);
        }

        return false;
    }

    checkWinCondition() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tile = this.tiles[r][c];
                if (tile.type === TILE_TYPES.SINK) {
                    if (!this.colorsMatch(tile.activeColors, tile.color)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    colorsMatch(activeSet, targetColor) {
        // Normalizes primary colors
        const hasRed = activeSet.has('#f00');
        const hasBlue = activeSet.has('#00f');
        const hasGreen = activeSet.has('#0f0');

        // Check target requirements
        switch (targetColor) {
            case '#f00': return hasRed;
            case '#00f': return hasBlue;
            case '#0f0': return hasGreen;
            case '#f0f': return hasRed && hasBlue; // Magenta
            case '#ff0': return hasRed && hasGreen; // Yellow
            case '#0ff': return hasBlue && hasGreen; // Cyan
            case '#fff': return hasRed && hasBlue && hasGreen; // White
            default: return false;
        }
    }
}
