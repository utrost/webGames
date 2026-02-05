import { GameLoop } from '../../core/GameLoop.js';
import { SHAPES } from './Shapes.js';

export class NeonBlocks {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;

        this.canvas = document.createElement('canvas');
        this.canvas.width = 300; // 10 blocks * 30px
        this.canvas.height = 600; // 20 blocks * 30px
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.backgroundColor = '#050505';

        this.cols = 10;
        this.rows = 20;
        this.blockSize = 30;
    }

    init() {
        console.log('Neon Blocks Initialized');

        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));

        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.gameOver = false;

        this.particles = [];

        // Player / Piece State
        this.player = {
            pos: { x: 0, y: 0 },
            matrix: null,
            color: null
        };

        this.resetPiece();

        // Input
        this.handleKey = (e) => {
            if (this.gameOver && e.code === 'KeyR') {
                this.stop();
                this.init();
                return;
            }
            if (this.gameOver) return;

            if (e.code === 'ArrowLeft') this.playerMove(-1);
            else if (e.code === 'ArrowRight') this.playerMove(1);
            else if (e.code === 'ArrowDown') this.playerDrop();
            else if (e.code === 'ArrowUp') this.playerRotate(1);
            else if (e.code === 'Space') this.playerHardDrop();
        };
        window.addEventListener('keydown', this.handleKey);

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
    }

    playerMove(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.grid, this.player)) {
            this.player.pos.x -= dir;
        }
    }

    playerDrop() {
        this.player.pos.y++;
        if (this.collide(this.grid, this.player)) {
            this.player.pos.y--; // Undrop
            this.merge(this.grid, this.player);
            this.arenaSweep();
            this.resetPiece();
            this.dropCounter = 0;
        }
        this.dropCounter = 0;
    }

    playerHardDrop() {
        while (!this.collide(this.grid, this.player)) {
            this.player.pos.y++;
        }
        this.player.pos.y--; // Back up one from collision
        this.merge(this.grid, this.player);
        this.arenaSweep();
        this.resetPiece();
        this.dropCounter = 0;
    }

    playerRotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix, dir);
        while (this.collide(this.grid, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.rotate(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
    }

    rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    resetPiece() {
        const types = 'ILJOTSZ';
        const type = types[Math.floor(Math.random() * types.length)];
        const shape = SHAPES[type];
        this.player.matrix = shape.matrix.map(row => [...row]);
        this.player.color = shape.color;

        this.player.pos.y = 0;
        this.player.pos.x = (this.cols / 2 | 0) - (this.player.matrix[0].length / 2 | 0);

        if (this.collide(this.grid, this.player)) {
            this.gameOver = true;
        }
    }

    collide(arena, player) {
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

    merge(arena, player) {
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

    arenaSweep() {
        let rowCount = 0;
        outer: for (let y = this.grid.length - 1; y > 0; --y) {
            for (let x = 0; x < this.grid[y].length; ++x) {
                if (this.grid[y][x] === null) {
                    continue outer;
                }
            }

            const row = this.grid.splice(y, 1)[0].fill(null);
            this.grid.unshift(row);
            ++y;
            rowCount++;

            // Add particles for cleared row
            for (let x = 0; x < this.cols; x++) {
                this.spawnParticles(x * this.blockSize + 15, (y + 1) * this.blockSize + 15, '#fff');
            }
        }

        if (rowCount > 0) {
            const points = rowCount * 100 * rowCount;
            this.score += points;
            this.linesCleared += rowCount;

            // Level Up
            if (this.linesCleared > this.level * 5) {
                this.level++;
                this.dropInterval *= 0.9; // 10% faster
            }
        }
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color
            });
        }
    }

    stop() {
        this.loop.stop();
        this.canvas.remove();
        window.removeEventListener('keydown', this.handleKey);
    }

    update(dt) {
        if (this.gameOver) return;

        this.dropCounter += dt * 1000;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== null) {
                    this.drawBlock(x, y, value);
                }
            });
        });

        // Ghost Piece
        const ghost = {
            matrix: this.player.matrix,
            pos: { x: this.player.pos.x, y: this.player.pos.y },
            color: this.player.color
        };
        // Drop ghost until collision
        while (!this.collide(this.grid, ghost)) {
            ghost.pos.y++;
        }
        ghost.pos.y--; // Back up

        // Render Ghost
        this.ctx.globalAlpha = 0.2;
        if (ghost.matrix) {
            ghost.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlock(ghost.pos.x + x, ghost.pos.y + y, ghost.color, true); // True = outline only optional?
                    }
                });
            });
        }
        this.ctx.globalAlpha = 1.0;

        // Render Active Piece
        if (this.player.matrix) {
            this.player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlock(this.player.pos.x + x, this.player.pos.y + y, this.player.color);
                    }
                });
            });
        }

        // Render Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
            this.ctx.fillRect(p.x, p.y, 4, 4);
        });

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 25);
        this.ctx.fillText(`LEVEL: ${this.level}`, 10, 50);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#f00';
            this.ctx.textAlign = 'center';
            this.ctx.font = '30px monospace';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);

        // Inner Bevel
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);

        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(x * this.blockSize + 4, y * this.blockSize + 4, this.blockSize - 8, this.blockSize - 8);
    }
}
