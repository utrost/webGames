import { ELEMENTS, getColor, getFireColor } from './Elements.js';

export class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Uint8Array(width * height);        // Element type
        this.colors = new Uint32Array(width * height);      // Packed RGBA color
        this.updated = new Uint8Array(width * height);      // Frame update flag
        this.frame = 0;
    }

    idx(x, y) {
        return y * this.width + x;
    }

    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    get(x, y) {
        if (!this.inBounds(x, y)) return ELEMENTS.STONE; // Walls are stone
        return this.grid[this.idx(x, y)];
    }

    set(x, y, type) {
        if (!this.inBounds(x, y)) return;
        const i = this.idx(x, y);
        this.grid[i] = type;
        if (type === ELEMENTS.EMPTY) {
            this.colors[i] = 0;
        } else if (type === ELEMENTS.FIRE) {
            this.colors[i] = getFireColor();
        } else {
            this.colors[i] = getColor(type);
        }
    }

    swap(x1, y1, x2, y2) {
        const i1 = this.idx(x1, y1);
        const i2 = this.idx(x2, y2);
        const tmpType = this.grid[i1];
        const tmpColor = this.colors[i1];
        this.grid[i1] = this.grid[i2];
        this.colors[i1] = this.colors[i2];
        this.grid[i2] = tmpType;
        this.colors[i2] = tmpColor;
        this.updated[i1] = this.frame;
        this.updated[i2] = this.frame;
    }

    isEmpty(x, y) {
        return this.get(x, y) === ELEMENTS.EMPTY;
    }

    isLiquid(x, y) {
        const t = this.get(x, y);
        return t === ELEMENTS.WATER || t === ELEMENTS.OIL || t === ELEMENTS.ACID;
    }

    isGas(x, y) {
        const t = this.get(x, y);
        return t === ELEMENTS.STEAM || t === ELEMENTS.SMOKE;
    }

    wasUpdated(x, y) {
        return this.updated[this.idx(x, y)] === this.frame;
    }

    step() {
        this.frame++;
        // Alternate scan direction to avoid bias
        const leftToRight = this.frame % 2 === 0;

        for (let y = this.height - 1; y >= 0; y--) {
            const startX = leftToRight ? 0 : this.width - 1;
            const endX = leftToRight ? this.width : -1;
            const stepX = leftToRight ? 1 : -1;

            for (let x = startX; x !== endX; x += stepX) {
                if (this.wasUpdated(x, y)) continue;

                const type = this.get(x, y);
                switch (type) {
                    case ELEMENTS.SAND: this.updateSand(x, y); break;
                    case ELEMENTS.WATER: this.updateWater(x, y); break;
                    case ELEMENTS.FIRE: this.updateFire(x, y); break;
                    case ELEMENTS.OIL: this.updateOil(x, y); break;
                    case ELEMENTS.ACID: this.updateAcid(x, y); break;
                    case ELEMENTS.PLANT: this.updatePlant(x, y); break;
                    case ELEMENTS.STEAM: this.updateSteam(x, y); break;
                    case ELEMENTS.SMOKE: this.updateSmoke(x, y); break;
                }
            }
        }
    }

    // Powder: falls down, piles diagonally
    updateSand(x, y) {
        if (y + 1 >= this.height) return;

        const below = this.get(x, y + 1);
        if (below === ELEMENTS.EMPTY) {
            this.swap(x, y, x, y + 1);
        } else if (this.isLiquid(x, y + 1)) {
            this.swap(x, y, x, y + 1);
        } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (this.inBounds(x + dir, y + 1) && (this.isEmpty(x + dir, y + 1) || this.isLiquid(x + dir, y + 1))) {
                this.swap(x, y, x + dir, y + 1);
            } else if (this.inBounds(x - dir, y + 1) && (this.isEmpty(x - dir, y + 1) || this.isLiquid(x - dir, y + 1))) {
                this.swap(x, y, x - dir, y + 1);
            }
        }
    }

    // Liquid: falls, spreads sideways
    updateWater(x, y) {
        if (y + 1 < this.height && this.isEmpty(x, y + 1)) {
            this.swap(x, y, x, y + 1);
            return;
        }

        // Diagonal fall
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + dir, y + 1) && this.isEmpty(x + dir, y + 1)) {
            this.swap(x, y, x + dir, y + 1);
            return;
        }
        if (this.inBounds(x - dir, y + 1) && this.isEmpty(x - dir, y + 1)) {
            this.swap(x, y, x - dir, y + 1);
            return;
        }

        // Spread sideways
        const spread = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + spread, y) && this.isEmpty(x + spread, y)) {
            this.swap(x, y, x + spread, y);
        } else if (this.inBounds(x - spread, y) && this.isEmpty(x - spread, y)) {
            this.swap(x, y, x - spread, y);
        }
    }

    // Oil: like water but floats on water, flammable
    updateOil(x, y) {
        // Check if water is above — swap (oil floats)
        if (y > 0 && this.get(x, y - 1) === ELEMENTS.WATER) {
            this.swap(x, y, x, y - 1);
            return;
        }

        if (y + 1 < this.height && this.isEmpty(x, y + 1)) {
            this.swap(x, y, x, y + 1);
            return;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + dir, y + 1) && this.isEmpty(x + dir, y + 1)) {
            this.swap(x, y, x + dir, y + 1);
            return;
        }

        const spread = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + spread, y) && this.isEmpty(x + spread, y)) {
            this.swap(x, y, x + spread, y);
        }
    }

    // Fire: burns upward, ignites neighbors, produces smoke, eventually dies
    updateFire(x, y) {
        // Update color for flicker
        this.colors[this.idx(x, y)] = getFireColor();

        // Random chance to die
        if (Math.random() < 0.05) {
            this.set(x, y, Math.random() < 0.3 ? ELEMENTS.SMOKE : ELEMENTS.EMPTY);
            return;
        }

        // Try to rise
        if (y > 0 && this.isEmpty(x, y - 1)) {
            if (Math.random() < 0.3) {
                this.swap(x, y, x, y - 1);
                return;
            }
        }

        // Spread to flammable neighbors
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (!this.inBounds(nx, ny)) continue;
                const neighbor = this.get(nx, ny);

                if (neighbor === ELEMENTS.OIL && Math.random() < 0.5) {
                    this.set(nx, ny, ELEMENTS.FIRE);
                } else if (neighbor === ELEMENTS.PLANT && Math.random() < 0.2) {
                    this.set(nx, ny, ELEMENTS.FIRE);
                } else if (neighbor === ELEMENTS.WOOD && Math.random() < 0.05) {
                    this.set(nx, ny, ELEMENTS.FIRE);
                } else if (neighbor === ELEMENTS.WATER) {
                    this.set(x, y, ELEMENTS.STEAM);
                    this.set(nx, ny, ELEMENTS.STEAM);
                    return;
                }
            }
        }
    }

    // Acid: dissolves most things, falls like liquid
    updateAcid(x, y) {
        // Check neighbors for dissolution
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (!this.inBounds(nx, ny)) continue;
                const neighbor = this.get(nx, ny);

                if (neighbor === ELEMENTS.SAND || neighbor === ELEMENTS.WOOD ||
                    neighbor === ELEMENTS.PLANT || neighbor === ELEMENTS.STONE) {
                    if (Math.random() < 0.1) {
                        this.set(nx, ny, ELEMENTS.EMPTY);
                        if (Math.random() < 0.5) {
                            this.set(x, y, ELEMENTS.SMOKE);
                            return;
                        }
                    }
                }
            }
        }

        // Fall like water
        if (y + 1 < this.height && this.isEmpty(x, y + 1)) {
            this.swap(x, y, x, y + 1);
            return;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + dir, y + 1) && this.isEmpty(x + dir, y + 1)) {
            this.swap(x, y, x + dir, y + 1);
            return;
        }

        const spread = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + spread, y) && this.isEmpty(x + spread, y)) {
            this.swap(x, y, x + spread, y);
        }
    }

    // Plant: grows when touching water, burns with fire
    updatePlant(x, y) {
        // Check neighbors for water — grow
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (!this.inBounds(nx, ny)) continue;

                if (this.get(nx, ny) === ELEMENTS.WATER && Math.random() < 0.02) {
                    this.set(nx, ny, ELEMENTS.PLANT);
                }
            }
        }
    }

    // Steam: rises, eventually condenses
    updateSteam(x, y) {
        if (Math.random() < 0.01) {
            this.set(x, y, ELEMENTS.WATER);
            return;
        }

        if (y > 0 && this.isEmpty(x, y - 1)) {
            this.swap(x, y, x, y - 1);
            return;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + dir, y - 1) && this.isEmpty(x + dir, y - 1)) {
            this.swap(x, y, x + dir, y - 1);
            return;
        }

        if (this.inBounds(x + dir, y) && this.isEmpty(x + dir, y)) {
            this.swap(x, y, x + dir, y);
        }
    }

    // Smoke: rises and disappears
    updateSmoke(x, y) {
        if (Math.random() < 0.02) {
            this.set(x, y, ELEMENTS.EMPTY);
            return;
        }

        if (y > 0 && this.isEmpty(x, y - 1)) {
            this.swap(x, y, x, y - 1);
            return;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.inBounds(x + dir, y) && this.isEmpty(x + dir, y)) {
            this.swap(x, y, x + dir, y);
        }
    }

    clear() {
        this.grid.fill(0);
        this.colors.fill(0);
    }
}
