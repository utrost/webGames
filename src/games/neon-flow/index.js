import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { Grid, TILE_TYPES, PIPE_SHAPES } from './Logic.js';
import { Levels } from './levels.js';

export class NeonFlow {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;

        this.audio = new AudioManager();
        this.storage = new StorageManager();

        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.scaler = new CanvasScaler(this.canvas, this.width, this.height);
        this.isRunning = false;
        this.paused = false;
        this.currentLevelIndex = 0;
        this.moves = 0;
        this.totalMoves = 0;

        this.tileSize = 60;
        this.colorBlind = localStorage.getItem('webGames_colorblind') === 'true';

        // Color-blind symbols for each primary/secondary color
        this.cbSymbols = {
            '#f00': 'R', '#00f': 'B', '#0f0': 'G',
            '#f0f': 'M', '#ff0': 'Y', '#0ff': 'C', '#fff': 'W'
        };
        this.cbPatterns = {
            '#f00': 'diagonal', '#00f': 'dots', '#0f0': 'horizontal',
            '#f0f': 'cross', '#ff0': 'vertical', '#0ff': 'zigzag', '#fff': 'solid'
        };

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursor = { r: 0, c: 0 };
        this.inputHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.height / rect.height);

            if (this.grid) {
                const gridX = this.mouseX - this.gridOffsetX;
                const gridY = this.mouseY - this.gridOffsetY;
                const c = Math.floor(gridX / this.tileSize);
                const r = Math.floor(gridY / this.tileSize);
                if (r >= 0 && r < this.grid.rows && c >= 0 && c < this.grid.cols) {
                    this.cursor = { r, c };
                }
            }
        };
        this.clickHandler = (e) => {
            e.preventDefault();
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }
            if (!this.paused) {
                this.inputHandler(e);
                this.onClick();
            }
        };
        this.touchHandler = (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const evt = { clientX: touch.clientX, clientY: touch.clientY };
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }
            if (!this.paused) {
                this.inputHandler(evt);
                this.onClick();
            }
        };
    }

    init() {
        this.particles = [];
        this.moves = 0;
        this.loadLevel(this.currentLevelIndex);

        window.addEventListener('pointermove', this.inputHandler);
        this.canvas.addEventListener('pointerdown', this.clickHandler);
        this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });

        this.handleKey = (e) => {
            if (e.code === 'Escape') {
                this.paused = !this.paused;
                return;
            }
            if (e.code === 'KeyR') {
                this.currentLevelIndex = 0;
                this.totalMoves = 0;
                this.stop();
                this.init();
                return;
            }
            if (this.paused) return;

            if (e.code === 'ArrowUp') this.cursor.r = Math.max(0, this.cursor.r - 1);
            if (e.code === 'ArrowDown') this.cursor.r = Math.min(this.grid.rows - 1, this.cursor.r + 1);
            if (e.code === 'ArrowLeft') this.cursor.c = Math.max(0, this.cursor.c - 1);
            if (e.code === 'ArrowRight') this.cursor.c = Math.min(this.grid.cols - 1, this.cursor.c + 1);

            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                if (this.audio.context.state === 'suspended') {
                    this.audio.context.resume();
                }
                this.onClickPos(this.cursor.r, this.cursor.c);
            }
        };
        window.addEventListener('keydown', this.handleKey);

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
        this.isRunning = true;
    }

    loadLevel(index) {
        if (index >= Levels.length) {
            this.storage.saveHighScore('neon-flow', this.totalMoves);
            if (this.onGameOver) this.onGameOver();
            return;
        }
        const level = Levels[index % Levels.length];
        this.grid = new Grid(level.rows, level.cols);

        level.tiles.forEach(t => {
            this.grid.setTile(t.r, t.c, t.type, t.shape, t.rotation, t.color);
        });

        this.gridOffsetX = (this.width - this.grid.cols * this.tileSize) / 2;
        this.gridOffsetY = (this.height - this.grid.rows * this.tileSize) / 2;
        this.cursor = { r: Math.floor(this.grid.rows / 2), c: Math.floor(this.grid.cols / 2) };

        this.particles = [];
        this.moves = 0;
        this.grid.calculateFlow();
    }

    stop() {
        this.loop.stop();
        this.scaler.destroy();
        this.isRunning = false;
        window.removeEventListener('pointermove', this.inputHandler);
        this.canvas.removeEventListener('pointerdown', this.clickHandler);
        window.removeEventListener('keydown', this.handleKey);
        this.canvas.removeEventListener('touchstart', this.touchHandler);
        this.canvas.remove();
    }

    update(dt) {
        if (this.paused) return;

        if (Math.random() < 0.3) {
            const r = Math.floor(Math.random() * this.grid.rows);
            const c = Math.floor(Math.random() * this.grid.cols);
            const tile = this.grid.get(r, c);

            if (tile && tile.activeColors.size > 0 && tile.type === TILE_TYPES.PIPE) {
                const color = this.mixColors(Array.from(tile.activeColors));
                this.particles.push({
                    x: c * this.tileSize + this.tileSize / 2 + (Math.random() * 10 - 5),
                    y: r * this.tileSize + this.tileSize / 2 + (Math.random() * 10 - 5),
                    vx: (Math.random() - 0.5) * 50,
                    vy: (Math.random() - 0.5) * 50,
                    life: 1.0,
                    color
                });
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.translate(this.gridOffsetX, this.gridOffsetY);

        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                const tile = this.grid.get(r, c);

                this.ctx.strokeStyle = '#222';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);

                if (r === this.cursor.r && c === this.cursor.c) {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                }

                if (!tile) continue;

                this.ctx.save();
                this.ctx.translate(x + this.tileSize / 2, y + this.tileSize / 2);
                this.ctx.rotate(tile.rotation * Math.PI / 2);

                if (tile.type === TILE_TYPES.SOURCE) {
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = tile.color;
                    this.ctx.fillStyle = tile.color;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = tile.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                    this.drawColorBlindIndicator(tile.color, 0, 20, 10);
                } else if (tile.type === TILE_TYPES.SINK) {
                    const isSatisfied = this.grid.colorsMatch(tile.activeColors, tile.color);
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
                    if (isSatisfied) {
                        this.ctx.fillStyle = tile.color;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        this.ctx.fillStyle = tile.color;
                        this.ctx.globalAlpha = 0.5;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.globalAlpha = 1.0;
                    }
                    this.ctx.shadowBlur = 0;
                    this.drawColorBlindIndicator(tile.color, 0, 20, 10);
                }
                if (tile.type === TILE_TYPES.PIPE) {
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 10;
                    this.ctx.lineCap = 'round';
                    this.drawPipePath(tile);
                    this.ctx.stroke();

                    if (tile.activeColors.size > 0) {
                        this.ctx.strokeStyle = this.mixColors(Array.from(tile.activeColors));
                        this.ctx.lineWidth = 4;
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = this.ctx.strokeStyle;
                        this.drawPipePath(tile);
                        this.ctx.stroke();
                        this.ctx.shadowBlur = 0;
                    }
                }

                this.ctx.restore();
            }
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        const levelName = Levels[this.currentLevelIndex % Levels.length].name;
        this.ctx.fillText(`Level ${this.currentLevelIndex + 1}: ${levelName}`, 20, 30);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Moves: ${this.moves}`, this.width - 20, 30);

        // Particles
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

        // Pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#00f3ff';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px monospace';
            this.ctx.fillText('Press ESC to resume', this.width / 2, this.height / 2 + 40);
        }
    }

    drawPipePath(tile) {
        const h = this.tileSize / 2;
        this.ctx.beginPath();
        if (tile.shape === PIPE_SHAPES.STRAIGHT) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, h);
        } else if (tile.shape === PIPE_SHAPES.CORNER) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(h, 0);
        } else if (tile.shape === PIPE_SHAPES.TEE) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(h, 0);
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-h, 0);
        } else if (tile.shape === PIPE_SHAPES.CROSS) {
            this.ctx.moveTo(0, -h);
            this.ctx.lineTo(0, h);
            this.ctx.moveTo(-h, 0);
            this.ctx.lineTo(h, 0);
        }
    }

    mixColors(colors) {
        if (colors.length === 0) return '#333';
        if (colors.length === 1) return colors[0];

        const hasRed = colors.includes('#f00');
        const hasBlue = colors.includes('#00f');
        const hasGreen = colors.includes('#0f0');

        if (hasRed && hasBlue && hasGreen) return '#fff';
        if (hasRed && hasBlue) return '#f0f';
        if (hasRed && hasGreen) return '#ff0';
        if (hasBlue && hasGreen) return '#0ff';
        return '#fff';
    }

    drawColorBlindIndicator(color, x, y, size) {
        if (!this.colorBlind) return;
        const symbol = this.cbSymbols[color];
        if (!symbol) return;

        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${size}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, x, y);
        this.ctx.restore();
    }

    onClick() {
        const gridX = this.mouseX - this.gridOffsetX;
        const gridY = this.mouseY - this.gridOffsetY;

        const c = Math.floor(gridX / this.tileSize);
        const r = Math.floor(gridY / this.tileSize);

        if (r >= 0 && r < this.grid.rows && c >= 0 && c < this.grid.cols) {
            this.onClickPos(r, c);
        }
    }

    onClickPos(r, c) {
        if (this.grid.rotateTile(r, c)) {
            this.moves++;
            this.totalMoves++;
            this.audio.playTone(400 + Math.random() * 200, 'sine', 0.1);
            this.grid.calculateFlow();

            if (this.grid.checkWinCondition()) {
                this.audio.playTone(880, 'triangle', 0.3);
                this.audio.playTone(1100, 'triangle', 0.3);

                setTimeout(() => {
                    this.currentLevelIndex++;
                    if (this.currentLevelIndex >= Levels.length) {
                        this.storage.saveHighScore('neon-flow', this.totalMoves);
                    }
                    this.loadLevel(this.currentLevelIndex);
                }, 1000);
            }
        }
    }
}
