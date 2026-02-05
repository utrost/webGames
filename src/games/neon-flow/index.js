import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { Grid, TILE_TYPES, PIPE_SHAPES } from './Logic.js';
import { Levels } from './levels.js';

export class NeonFlow {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;

        // Services
        this.audio = new AudioManager();

        // Canvas Setup
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // State
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
        this.currentLevelIndex = 0;

        // Grid Config
        this.tileSize = 60;
        // Offsets set in loadLevel

        // Mouse Input
        this.mouseX = 0;
        this.mouseY = 0;
        this.inputHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.height / rect.height);
        };
        this.clickHandler = () => {
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }
            this.onClick();
        };
    }

    init() {
        console.log('Neon Flow Initialized');

        this.particles = []; // {x, y, vx, vy, color, life}
        this.loadLevel(this.currentLevelIndex);

        // Register Input
        window.addEventListener('mousemove', this.inputHandler);
        window.addEventListener('click', this.clickHandler);

        // Start Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
        this.isRunning = true;
    }

    loadLevel(index) {
        const level = Levels[index % Levels.length];
        this.grid = new Grid(level.rows, level.cols);

        // Apply tiles
        level.tiles.forEach(t => {
            this.grid.setTile(t.r, t.c, t.type, t.shape, t.rotation, t.color);
        });

        // Recalculate offsets to center
        this.gridOffsetX = (this.width - this.grid.cols * this.tileSize) / 2;
        this.gridOffsetY = (this.height - this.grid.rows * this.tileSize) / 2;

        this.particles = [];
        this.grid.calculateFlow();
    }


    stop() {
        this.loop.stop();
        this.isRunning = false;
        window.removeEventListener('mousemove', this.inputHandler);
        window.removeEventListener('click', this.clickHandler);
        this.canvas.remove();
    }

    update(dt) {
        // Spawn Particles on Active Tiles
        if (Math.random() < 0.3) { // Spawn rate
            // Find a random active tile
            const r = Math.floor(Math.random() * this.grid.rows);
            const c = Math.floor(Math.random() * this.grid.cols);
            const tile = this.grid.get(r, c);

            if (tile && tile.activeColors.size > 0 && tile.type === TILE_TYPES.PIPE) {
                // Determine direction based on tile shape/rotation
                // Simplification for visual effect:
                // Just spawn center and move randomly along one of the valid axes
                const color = this.mixColors(Array.from(tile.activeColors));

                this.particles.push({
                    x: c * this.tileSize + this.tileSize / 2 + (Math.random() * 10 - 5),
                    y: r * this.tileSize + this.tileSize / 2 + (Math.random() * 10 - 5),
                    vx: (Math.random() - 0.5) * 50,
                    vy: (Math.random() - 0.5) * 50,
                    life: 1.0,
                    color: color
                });
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        // Clear background
        this.ctx.fillStyle = '#050510'; // Dark Navy
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render Grid
        this.ctx.translate(this.gridOffsetX, this.gridOffsetY);

        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                const tile = this.grid.get(r, c);

                // Draw Tile Background (Grid Lines)
                this.ctx.strokeStyle = '#222';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);

                if (!tile) continue;

                // Draw Content
                this.ctx.save();
                this.ctx.translate(x + this.tileSize / 2, y + this.tileSize / 2);
                this.ctx.rotate(tile.rotation * Math.PI / 2);

                if (tile.type === TILE_TYPES.SOURCE) {
                    // Glow effect
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = tile.color;
                    this.ctx.fillStyle = tile.color;

                    // Core
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Outer Ring
                    this.ctx.strokeStyle = tile.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
                    this.ctx.stroke();

                    this.ctx.shadowBlur = 0;
                }
                else if (tile.type === TILE_TYPES.SINK) {
                    const isSatisfied = this.grid.colorsMatch(tile.activeColors, tile.color);

                    // Base Ring
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeStyle = '#333';
                    if (isSatisfied) {
                        this.ctx.strokeStyle = tile.color;
                        this.ctx.shadowBlur = 20;
                        this.ctx.shadowColor = tile.color;
                    }

                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Inner dot (Empty if not satisfied, Filled if satisfied)
                    if (isSatisfied) {
                        this.ctx.fillStyle = tile.color;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        // Small colored dot to show requirement
                        this.ctx.fillStyle = tile.color;
                        this.ctx.globalAlpha = 0.5;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.globalAlpha = 1.0;
                    }
                    this.ctx.shadowBlur = 0;
                }
                if (tile.type === TILE_TYPES.PIPE) {
                    // Draw Inactive Pipe
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 10;
                    this.ctx.lineCap = 'round';
                    this.drawPipePath(tile);
                    this.ctx.stroke();

                    // Draw Active Flow
                    if (tile.activeColors.size > 0) {
                        // Mix colors
                        this.ctx.strokeStyle = this.mixColors(Array.from(tile.activeColors));
                        this.ctx.lineWidth = 4;
                        // Add glow
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = this.ctx.strokeStyle;

                        this.drawPipePath(tile);
                        this.ctx.stroke();

                        this.ctx.shadowBlur = 0; // Reset
                    }
                }

                this.ctx.restore();
            }
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

        // UI overlay
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        const levelName = Levels[this.currentLevelIndex % Levels.length].name;
        this.ctx.fillText(`Level ${this.currentLevelIndex + 1}: ${levelName} `, 20, 30);

        // Render Particles
        this.ctx.translate(this.gridOffsetX, this.gridOffsetY);
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    drawPipePath(tile) {
        const h = this.tileSize / 2;
        this.ctx.beginPath();
        if (tile.shape === PIPE_SHAPES.STRAIGHT) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, h);
        }
        else if (tile.shape === PIPE_SHAPES.CORNER) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(h, 0);
        }
        else if (tile.shape === PIPE_SHAPES.TEE) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(h, 0);
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-h, 0);
        }
        else if (tile.shape === PIPE_SHAPES.CROSS) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, h);
            this.ctx.moveTo(-h, 0);
            this.ctx.lineTo(h, 0);
        }
    }

    mixColors(colors) {
        if (colors.length === 0) return '#333';
        if (colors.length === 1) return colors[0];

        // Simple CMY/RGB mixing logic or just hardcode
        // R+B = Magenta
        const hasRed = colors.includes('#f00');
        const hasBlue = colors.includes('#00f');
        const hasGreen = colors.includes('#0f0');

        if (hasRed && hasBlue) return '#f0f'; // Magenta
        if (hasRed && hasGreen) return '#ff0'; // Yellow
        if (hasBlue && hasGreen) return '#0ff'; // Cyan
        return '#fff'; // White (all 3)
    }

    onClick() {
        // Calculate Grid Coords
        const gridX = this.mouseX - this.gridOffsetX;
        const gridY = this.mouseY - this.gridOffsetY;

        const c = Math.floor(gridX / this.tileSize);
        const r = Math.floor(gridY / this.tileSize);

        if (this.grid.rotateTile(r, c)) {
            // Play click sound?
            this.audio.playTone(400 + Math.random() * 200, 'sine', 0.1);
            // Re-calc flow
            this.grid.calculateFlow();

            // Check Win
            if (this.grid.checkWinCondition()) {
                console.log('Level Complete!');
                this.audio.playTone(880, 'triangle', 0.3);
                this.audio.playTone(1100, 'triangle', 0.3);

                setTimeout(() => {
                    this.currentLevelIndex++;
                    this.loadLevel(this.currentLevelIndex);
                }, 1000);
            }

        }
    }
}
