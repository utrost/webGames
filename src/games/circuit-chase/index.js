import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { CONFIG } from './config.js';
import { LEVEL } from './levels.js';
import {
    DIRECTIONS,
    createMazeState,
    findNextHunterDirection,
    keyFor,
    sameDirection,
    stepPosition,
} from './Logic.js';

const HUNTER_COLORS = ['#ff3366', '#00f3ff', '#ffaa00', '#b967ff'];

export class CircuitChase {
    constructor(container, onGameOver) {
        this.container = container;
        this.onGameOver = onGameOver;
        this.audio = new AudioManager();
        this.storage = new StorageManager();

        this.canvas = document.createElement('canvas');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.scaler = new CanvasScaler(this.canvas, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        this.width = CONFIG.CANVAS_WIDTH;
        this.height = CONFIG.CANVAS_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;
        this.highScore = this.storage.getHighScore('circuit-chase');
        this.isRunning = false;
        this.keys = {};
        this.touchStart = null;
    }

    resetGameState() {
        this.maze = createMazeState(LEVEL);
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.player = {
            ...this.maze.player,
            lives: CONFIG.STARTING_LIVES,
            invincible: CONFIG.RESPAWN_GRACE,
        };
        this.currentDirection = DIRECTIONS.LEFT;
        this.queuedDirection = DIRECTIONS.LEFT;
        this.playerStepTimer = 0;
        this.hunterStepTimer = 0;
        this.frightenedTimer = 0;
        this.hunters = this.maze.hunters.map((home, index) => ({
            ...home,
            home: { ...home },
            direction: index % 2 === 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT,
            mode: 'chase',
            color: HUNTER_COLORS[index % HUNTER_COLORS.length],
        }));
    }

    init() {
        this.resetGameState();
        this.setupInput();
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render(),
        );
        this.loop.start();
        this.isRunning = true;
    }

    setupInput() {
        this.keyDownHandler = (event) => this.handleKeyDown(event);
        window.addEventListener('keydown', this.keyDownHandler);

        this.pointerDownHandler = (event) => {
            event.preventDefault();
            this.touchStart = { x: event.clientX, y: event.clientY };
        };
        this.pointerUpHandler = (event) => {
            event.preventDefault();
            if (!this.touchStart) return;
            this.queueDirectionFromSwipe(this.touchStart, { x: event.clientX, y: event.clientY });
            this.touchStart = null;
        };
        this.touchStartHandler = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.touchStart = { x: touch.clientX, y: touch.clientY };
        };
        this.touchEndHandler = (event) => {
            event.preventDefault();
            if (!this.touchStart) return;
            const touch = event.changedTouches[0];
            this.queueDirectionFromSwipe(this.touchStart, { x: touch.clientX, y: touch.clientY });
            this.touchStart = null;
        };

        this.canvas.addEventListener('mousedown', this.pointerDownHandler);
        this.canvas.addEventListener('mouseup', this.pointerUpHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
    }

    stop() {
        this.loop?.stop();
        this.scaler.destroy();
        this.isRunning = false;
        window.removeEventListener('keydown', this.keyDownHandler);
        this.canvas.removeEventListener('mousedown', this.pointerDownHandler);
        this.canvas.removeEventListener('mouseup', this.pointerUpHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('touchend', this.touchEndHandler);
        this.canvas.remove();
    }

    handleKeyDown(event) {
        const directionByCode = {
            ArrowUp: DIRECTIONS.UP,
            KeyW: DIRECTIONS.UP,
            ArrowRight: DIRECTIONS.RIGHT,
            KeyD: DIRECTIONS.RIGHT,
            ArrowDown: DIRECTIONS.DOWN,
            KeyS: DIRECTIONS.DOWN,
            ArrowLeft: DIRECTIONS.LEFT,
            KeyA: DIRECTIONS.LEFT,
        };

        if (event.code === 'Escape') {
            this.paused = !this.paused;
            return;
        }
        if (this.gameOver && event.code === 'KeyR') {
            this.resetGameState();
            return;
        }
        if (directionByCode[event.code]) {
            event.preventDefault?.();
            this.queuedDirection = directionByCode[event.code];
        }
    }

    queueDirectionFromSwipe(start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        this.queuedDirection = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT)
            : (dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
    }

    update(dt) {
        if (!this.isRunning || this.paused || this.gameOver) return;
        this.player.invincible = Math.max(0, this.player.invincible - dt);
        this.frightenedTimer = Math.max(0, this.frightenedTimer - dt);
        if (this.frightenedTimer === 0) {
            for (const hunter of this.hunters) {
                if (hunter.mode === 'frightened') hunter.mode = 'chase';
            }
        }

        this.playerStepTimer += dt;
        while (this.playerStepTimer >= CONFIG.PLAYER_STEP_INTERVAL) {
            this.playerStepTimer -= CONFIG.PLAYER_STEP_INTERVAL;
            this.updatePlayerStep();
        }

        const hunterInterval = this.frightenedTimer > 0 ? CONFIG.FRIGHTENED_HUNTER_STEP_INTERVAL : CONFIG.HUNTER_STEP_INTERVAL;
        this.hunterStepTimer += dt;
        while (this.hunterStepTimer >= hunterInterval) {
            this.hunterStepTimer -= hunterInterval;
            this.updateHunterStep();
        }
        this.handleHunterCollisions();
    }

    updatePlayerStep() {
        const queuedNext = stepPosition(this.maze, this.player, this.queuedDirection);
        if (queuedNext.row !== this.player.row || queuedNext.col !== this.player.col) {
            this.currentDirection = this.queuedDirection;
        }
        const next = stepPosition(this.maze, this.player, this.currentDirection);
        this.player.row = next.row;
        this.player.col = next.col;
        this.collectCurrentNode();
    }

    collectCurrentNode() {
        const key = keyFor(this.player.row, this.player.col);
        if (this.maze.dots.delete(key)) {
            this.score += CONFIG.DOT_POINTS;
            this.audio.playTone?.(660, 0.04, 'sine', 0.04);
        }
        if (this.maze.powerNodes.delete(key)) {
            this.score += CONFIG.POWER_NODE_POINTS;
            this.frightenedTimer = CONFIG.FRIGHTENED_TIME;
            for (const hunter of this.hunters) hunter.mode = 'frightened';
            this.audio.playTone?.(220, 0.15, 'sawtooth', 0.05);
        }
        if (this.maze.dots.size === 0 && this.maze.powerNodes.size === 0) this.nextRound();
    }

    updateHunterStep() {
        for (const hunter of this.hunters) {
            if (hunter.mode === 'returning') {
                hunter.row = hunter.home.row;
                hunter.col = hunter.home.col;
                hunter.mode = this.frightenedTimer > 0 ? 'frightened' : 'chase';
                continue;
            }
            const direction = findNextHunterDirection(this.maze, hunter, this.player, hunter.direction, hunter.mode);
            const next = stepPosition(this.maze, hunter, direction);
            hunter.row = next.row;
            hunter.col = next.col;
            if (!sameDirection(direction, DIRECTIONS.NONE)) hunter.direction = direction;
        }
    }

    handleHunterCollisions() {
        for (const hunter of this.hunters) {
            if (hunter.row !== this.player.row || hunter.col !== this.player.col) continue;
            if (hunter.mode === 'frightened') {
                this.score += CONFIG.HUNTER_POINTS;
                hunter.mode = 'returning';
                hunter.row = hunter.home.row;
                hunter.col = hunter.home.col;
                this.audio.playTone?.(880, 0.12, 'square', 0.05);
                continue;
            }
            if (this.player.invincible > 0) continue;
            this.loseLife();
            break;
        }
    }

    loseLife() {
        this.player.lives -= 1;
        if (this.player.lives <= 0) {
            this.endGame();
            return;
        }
        this.player.row = this.maze.player.row;
        this.player.col = this.maze.player.col;
        this.player.invincible = CONFIG.RESPAWN_GRACE;
        this.currentDirection = DIRECTIONS.LEFT;
        this.queuedDirection = DIRECTIONS.LEFT;
    }

    nextRound() {
        const lives = this.player.lives;
        const score = this.score;
        this.maze = createMazeState(LEVEL);
        this.player = { ...this.maze.player, lives, invincible: CONFIG.RESPAWN_GRACE };
        this.hunters = this.maze.hunters.map((home, index) => ({
            ...home,
            home: { ...home },
            direction: index % 2 === 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT,
            mode: 'chase',
            color: HUNTER_COLORS[index % HUNTER_COLORS.length],
        }));
        this.score = score + 500;
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.storage.saveHighScore('circuit-chase', this.score);
        this.highScore = Math.max(this.highScore, this.score);
        this.onGameOver?.();
    }

    tileCenter(row, col) {
        return {
            x: col * this.tileSize + this.tileSize / 2 + 38,
            y: row * this.tileSize + this.tileSize / 2 + CONFIG.HUD_HEIGHT,
        };
    }

    render() {
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.renderHud();
        this.renderMaze();
        this.renderNodes();
        this.renderHunters();
        this.renderPlayer();
        if (this.paused || this.gameOver) this.renderOverlay();
    }

    renderHud() {
        this.ctx.fillStyle = '#00f3ff';
        this.ctx.font = '18px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE ${this.score}`, 22, 28);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LIVES ${this.player.lives}  HIGH ${this.highScore}`, this.width - 22, 28);
    }

    renderMaze() {
        this.ctx.strokeStyle = '#263cff';
        this.ctx.lineWidth = 3;
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                if (!this.maze.walls.has(keyFor(row, col))) continue;
                const x = col * this.tileSize + 38;
                const y = row * this.tileSize + CONFIG.HUD_HEIGHT;
                this.ctx.strokeRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6);
            }
        }
    }

    renderNodes() {
        for (const key of this.maze.dots) {
            const [row, col] = key.split(',').map(Number);
            const center = this.tileCenter(row, col);
            this.ctx.fillStyle = '#f8f8ff';
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        for (const key of this.maze.powerNodes) {
            const [row, col] = key.split(',').map(Number);
            const center = this.tileCenter(row, col);
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderPlayer() {
        const center = this.tileCenter(this.player.row, this.player.col);
        this.ctx.fillStyle = this.player.invincible > 0 ? '#9ffcff' : '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, 13, 0.25 * Math.PI, 1.75 * Math.PI);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.fill();
    }

    renderHunters() {
        for (const hunter of this.hunters) {
            const center = this.tileCenter(hunter.row, hunter.col);
            this.ctx.fillStyle = hunter.mode === 'frightened' ? '#204cff' : hunter.color;
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y - 2, 13, Math.PI, 0);
            this.ctx.lineTo(center.x + 13, center.y + 12);
            this.ctx.lineTo(center.x - 13, center.y + 12);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    renderOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#00f3ff';
        this.ctx.font = '30px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.gameOver ? 'CIRCUIT BROKEN' : 'PAUSED', this.width / 2, this.height / 2);
        this.ctx.font = '16px monospace';
        this.ctx.fillText('R to restart • Esc to resume', this.width / 2, this.height / 2 + 34);
    }
}
