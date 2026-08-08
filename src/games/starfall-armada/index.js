import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { CONFIG } from './config.js';

const PLAYER_COLOR = '#00f3ff';
const ALIEN_COLORS = ['#ff3366', '#ff7a00', '#ffaa00', '#00ff88', '#b967ff'];
const SHOT_COLOR = '#f8f8ff';
const BOMB_COLOR = '#ff3366';

function rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export class StarfallArmada {
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
        this.defenseLine = CONFIG.DEFENSE_LINE;
        this.highScore = this.storage.getHighScore('starfall-armada');
        this.isRunning = false;
        this.keys = {};
        this.touchState = { left: false, right: false, fire: false };
    }

    resetGameState() {
        this.score = 0;
        this.wave = 1;
        this.gameOver = false;
        this.paused = false;
        this.playerShots = [];
        this.alienShots = [];
        this.explosions = [];
        this.formationDirection = 1;
        this.formationSpeed = CONFIG.FORMATION_SPEED;
        this.nextWaveTimer = 0;
        this.alienFireTimer = CONFIG.ALIEN_FIRE_INTERVAL;
        this.touchState = { left: false, right: false, fire: false };
        this.keys = {};
        this.player = {
            x: this.width / 2 - CONFIG.PLAYER_WIDTH / 2,
            y: this.height - 58,
            width: CONFIG.PLAYER_WIDTH,
            height: CONFIG.PLAYER_HEIGHT,
            lives: CONFIG.STARTING_LIVES,
            invincible: 0,
        };
        this.spawnFormation();
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
        this.keyUpHandler = (event) => this.handleKeyUp(event);
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);

        this.pointerActive = false;
        this.pointerDownHandler = (event) => {
            event.preventDefault();
            this.pointerActive = true;
            this.processPointer(event);
        };
        this.pointerMoveHandler = (event) => {
            if (!this.pointerActive) return;
            event.preventDefault();
            this.processPointer(event);
        };
        this.pointerUpHandler = (event) => {
            event.preventDefault();
            this.pointerActive = false;
            this.touchState = { left: false, right: false, fire: false };
        };
        this.touchStartHandler = (event) => {
            event.preventDefault();
            this.processTouches(event.touches);
        };
        this.touchMoveHandler = (event) => {
            event.preventDefault();
            this.processTouches(event.touches);
        };
        this.touchEndHandler = (event) => {
            event.preventDefault();
            this.processTouches(event.touches);
        };

        this.canvas.addEventListener('mousedown', this.pointerDownHandler);
        window.addEventListener('mousemove', this.pointerMoveHandler);
        window.addEventListener('mouseup', this.pointerUpHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
    }

    stop() {
        this.loop?.stop();
        this.scaler.destroy();
        this.isRunning = false;
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        this.canvas.removeEventListener('mousedown', this.pointerDownHandler);
        window.removeEventListener('mousemove', this.pointerMoveHandler);
        window.removeEventListener('mouseup', this.pointerUpHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        this.canvas.removeEventListener('touchend', this.touchEndHandler);
        this.canvas.remove();
    }

    handleKeyDown(event) {
        if (event.code === 'Escape') {
            this.paused = !this.paused;
            return;
        }
        if (this.gameOver && event.code === 'KeyR') {
            this.resetGameState();
            return;
        }
        this.keys[event.code] = true;
        if (event.code === 'Space') {
            event.preventDefault?.();
            this.firePlayerShot();
        }
    }

    handleKeyUp(event) {
        this.keys[event.code] = false;
    }

    processPointer(point) {
        this.processControlPoints([point]);
    }

    processTouches(touches) {
        this.processControlPoints(Array.from(touches));
    }

    processControlPoints(points) {
        this.touchState = { left: false, right: false, fire: false };
        const rect = this.canvas.getBoundingClientRect();

        for (const point of points) {
            const tx = (point.clientX - rect.left) / rect.width;
            const ty = (point.clientY - rect.top) / rect.height;
            if (ty < 0.45) continue;
            if (tx < 0.35) this.touchState.left = true;
            else if (tx > 0.65) this.touchState.right = true;
            else this.touchState.fire = true;
        }

        if (this.touchState.fire) this.firePlayerShot();
    }

    spawnFormation() {
        this.aliens = [];
        for (let row = 0; row < CONFIG.ALIEN_ROWS; row++) {
            for (let col = 0; col < CONFIG.ALIEN_COLS; col++) {
                this.aliens.push({
                    x: CONFIG.ALIEN_START_X + col * CONFIG.ALIEN_GAP_X,
                    y: CONFIG.ALIEN_START_Y + row * CONFIG.ALIEN_GAP_Y,
                    width: CONFIG.ALIEN_WIDTH,
                    height: CONFIG.ALIEN_HEIGHT,
                    row,
                    col,
                    points: (CONFIG.ALIEN_ROWS - row) * 10,
                });
            }
        }
    }

    update(dt) {
        if (this.gameOver || this.paused) return;

        this.updatePlayer(dt);
        this.updateShots(dt);
        this.updateFormation(dt);
        this.updateAlienFire(dt);
        this.handleCollisions();
        this.updateExplosions(dt);
        this.checkWaveOrDefeat(dt);
    }

    updatePlayer(dt) {
        const movingLeft = this.keys.ArrowLeft || this.touchState.left;
        const movingRight = this.keys.ArrowRight || this.touchState.right;
        if (movingLeft) this.player.x -= CONFIG.PLAYER_SPEED * dt;
        if (movingRight) this.player.x += CONFIG.PLAYER_SPEED * dt;
        this.player.x = clamp(this.player.x, 0, this.width - this.player.width);
        if (this.keys.Space || this.touchState.fire) this.firePlayerShot();
        if (this.player.invincible > 0) this.player.invincible -= dt;
    }

    updateShots(dt) {
        for (const shot of this.playerShots) {
            shot.x += shot.vx * dt;
            shot.y += shot.vy * dt;
        }
        for (const shot of this.alienShots) {
            shot.x += shot.vx * dt;
            shot.y += shot.vy * dt;
        }
        this.playerShots = this.playerShots.filter((shot) => shot.y + shot.height > 0);
        this.alienShots = this.alienShots.filter((shot) => shot.y < this.height);
    }

    updateFormation(dt) {
        if (this.aliens.length === 0) return;

        let edgeHit = false;
        for (const alien of this.aliens) {
            alien.x += this.formationDirection * this.formationSpeed * dt;
            if (alien.x <= 18 || alien.x + alien.width >= this.width - 18) edgeHit = true;
        }

        if (edgeHit) {
            this.formationDirection *= -1;
            for (const alien of this.aliens) {
                alien.x = clamp(alien.x, 18, this.width - 18 - alien.width);
                alien.y += CONFIG.FORMATION_DESCENT;
            }
        }
    }

    updateAlienFire(dt) {
        if (this.aliens.length === 0) return;
        this.alienFireTimer -= dt;
        if (this.alienFireTimer > 0) return;

        const shooters = this.bottomAliensByColumn();
        const shooter = this.selectAlienShooter(shooters);
        this.alienShots.push({
            x: shooter.x + shooter.width / 2 - 3,
            y: shooter.y + shooter.height,
            width: 6,
            height: 14,
            vx: 0,
            vy: CONFIG.ALIEN_SHOT_SPEED,
        });
        this.alienFireTimer = Math.max(0.35, CONFIG.ALIEN_FIRE_INTERVAL - this.wave * 0.08);
    }

    bottomAliensByColumn() {
        const byColumn = new Map();
        for (const alien of this.aliens) {
            const existing = byColumn.get(alien.col);
            if (!existing || alien.y > existing.y) byColumn.set(alien.col, alien);
        }
        return Array.from(byColumn.values());
    }

    selectAlienShooter(shooters) {
        const playerCenter = this.player.x + this.player.width / 2;
        const safeShooters = shooters.filter((alien) => {
            const alienCenter = alien.x + alien.width / 2;
            return Math.abs(alienCenter - playerCenter) > 70;
        });
        const candidates = safeShooters.length > 0 ? safeShooters : shooters;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    firePlayerShot() {
        if (this.gameOver || this.paused) return;
        if (this.playerShots.length > 0) return;
        this.playerShots.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y - 14,
            width: 4,
            height: 14,
            vx: 0,
            vy: CONFIG.PLAYER_SHOT_SPEED,
        });
        this.audio.playTone(760, 'square', 0.05);
    }

    handleCollisions() {
        for (const shot of this.playerShots) {
            const alien = this.aliens.find((candidate) => rectsOverlap(shot, candidate));
            if (!alien) continue;
            this.score += alien.points;
            this.aliens = this.aliens.filter((candidate) => candidate !== alien);
            this.playerShots = this.playerShots.filter((candidate) => candidate !== shot);
            this.explosions.push({ x: alien.x + alien.width / 2, y: alien.y + alien.height / 2, time: 0.28 });
            this.audio.playTone(260 + alien.points * 5, 'triangle', 0.08);
            break;
        }

        if (this.player.invincible > 0) return;
        const playerHit = this.alienShots.find((shot) => rectsOverlap(shot, this.player));
        if (playerHit) {
            this.alienShots = this.alienShots.filter((shot) => shot !== playerHit);
            this.loseLife();
        }
    }

    loseLife() {
        this.player.lives -= 1;
        this.explosions.push({ x: this.player.x + this.player.width / 2, y: this.player.y, time: 0.45 });
        this.audio.playTone(120, 'sawtooth', 0.25);
        if (this.player.lives <= 0) {
            this.endGame();
            return;
        }
        this.player.x = this.width / 2 - this.player.width / 2;
        this.player.invincible = 1.5;
    }

    updateExplosions(dt) {
        for (const explosion of this.explosions) explosion.time -= dt;
        this.explosions = this.explosions.filter((explosion) => explosion.time > 0);
    }

    checkWaveOrDefeat(dt) {
        if (this.aliens.some((alien) => alien.y + alien.height >= this.defenseLine)) {
            this.endGame();
            return;
        }

        if (this.aliens.length === 0) {
            if (!this.nextWaveTimer) this.nextWaveTimer = CONFIG.NEXT_WAVE_DELAY;
            this.nextWaveTimer -= dt;
            if (this.nextWaveTimer <= 0) {
                this.wave += 1;
                this.formationSpeed = CONFIG.FORMATION_SPEED + (this.wave - 1) * 10;
                this.formationDirection = 1;
                this.alienShots = [];
                this.playerShots = [];
                this.nextWaveTimer = 0;
                this.spawnFormation();
            }
        }
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.highScore = Math.max(this.highScore, this.score);
        this.storage.saveHighScore('starfall-armada', this.score);
        this.onGameOver?.();
    }

    render() {
        this.renderBackground();
        this.renderDefenseLine();
        this.renderPlayer();
        this.renderAliens();
        this.renderShots();
        this.renderExplosions();
        this.renderHud();
        this.renderOverlay();
    }

    renderBackground() {
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
        for (let x = 0; x < this.width; x += 80) {
            this.ctx.fillRect(x, 0, 1, this.height);
        }
    }

    renderDefenseLine() {
        this.ctx.strokeStyle = 'rgba(255, 51, 102, 0.45)';
        this.ctx.setLineDash?.([8, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.defenseLine);
        this.ctx.lineTo(this.width, this.defenseLine);
        this.ctx.stroke();
        this.ctx.setLineDash?.([]);
    }

    renderPlayer() {
        this.ctx.save?.();
        this.ctx.globalAlpha = this.player.invincible > 0 ? 0.55 : 1;
        this.ctx.fillStyle = PLAYER_COLOR;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y - 10);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore?.();
    }

    renderAliens() {
        for (const alien of this.aliens) {
            this.ctx.fillStyle = ALIEN_COLORS[alien.row % ALIEN_COLORS.length];
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            this.ctx.fillStyle = '#050510';
            this.ctx.fillRect(alien.x + 6, alien.y + 6, 5, 5);
            this.ctx.fillRect(alien.x + alien.width - 11, alien.y + 6, 5, 5);
        }
    }

    renderShots() {
        this.ctx.fillStyle = SHOT_COLOR;
        for (const shot of this.playerShots) this.ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
        this.ctx.fillStyle = BOMB_COLOR;
        for (const shot of this.alienShots) this.ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
    }

    renderExplosions() {
        for (const explosion of this.explosions) {
            const radius = 28 * (explosion.time + 0.1);
            this.ctx.strokeStyle = '#ffaa00';
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    renderHud() {
        this.ctx.fillStyle = '#f8f8ff';
        this.ctx.font = '18px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE ${this.score}`, 20, 30);
        this.ctx.fillText(`HI ${Math.max(this.highScore, this.score)}`, 20, 55);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`WAVE ${this.wave}`, this.width - 20, 30);
        this.ctx.fillText(`LIVES ${this.player.lives}`, this.width - 20, 55);
    }

    renderOverlay() {
        if (!this.paused && !this.gameOver) return;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.gameOver ? '#ff3366' : '#00f3ff';
        this.ctx.font = '40px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.gameOver ? 'ARMADA BREACHED' : 'PAUSED', this.width / 2, this.height / 2);
        this.ctx.fillStyle = '#f8f8ff';
        this.ctx.font = '18px monospace';
        this.ctx.fillText(this.gameOver ? 'Press R to restart' : 'Press Esc to resume', this.width / 2, this.height / 2 + 42);
    }
}
