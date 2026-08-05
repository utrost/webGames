import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { CONFIG } from './config.js';

export class TemplateGame {
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
        this.isRunning = false;
        this.paused = false;
        this.gameOver = false;
        this.score = 0;
    }

    resetGameState() {
        this.paused = false;
        this.gameOver = false;
        this.score = 0;
    }

    init() {
        this.resetGameState();
        this.handleKey = (event) => {
            if (event.code === 'Escape') {
                this.paused = !this.paused;
            }
            if (this.gameOver && event.code === 'KeyR') {
                this.resetGameState();
            }
        };
        window.addEventListener('keydown', this.handleKey);

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render(),
        );
        this.loop.start();
        this.isRunning = true;
    }

    stop() {
        this.loop?.stop();
        this.scaler.destroy();
        this.isRunning = false;
        window.removeEventListener('keydown', this.handleKey);
        this.canvas.remove();
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        if (this.onGameOver) this.onGameOver();
    }

    update(dt) {
        if (!this.isRunning || this.paused || this.gameOver) return;
        this.score += dt;
    }

    render() {
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#00f3ff';
        this.ctx.font = '24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Template Game', this.width / 2, this.height / 2);
    }
}
