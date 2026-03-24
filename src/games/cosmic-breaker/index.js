import { Vector2 } from '../../core/Vector2.js';
import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { Levels } from './levels.js';

export class CosmicBreaker {
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
        this.score = 0;
        this.currentLevel = 0;
        this.highScore = this.storage.getHighScore('cosmic-breaker');
        this.lives = 3;
        this.bricks = [];
        this.balls = [];
        this.powerups = [];
        this.particles = [];
        this.shake = 0;

        this.POWERUP_TYPES = {
            MULTI: { color: '#2ecc71', symbol: 'M', score: 100 },
            WIDE: { color: '#3498db', symbol: 'W', score: 100 },
            LIFE: { color: '#e74c3c', symbol: 'L', score: 500 }
        };

        this.PADDLE_WIDTH = 120;
        this.BASE_PADDLE_WIDTH = 120;
        this.PADDLE_HEIGHT = 20;
        this.BALL_RADIUS = 8;
        this.INITIAL_SPEED = 400;
        this.MAX_SPEED = 800;
        this.SPEED_INCREMENT = 20;

        this.paddle = {
            x: this.width / 2 - this.PADDLE_WIDTH / 2,
            y: this.height - 50,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT,
            color: '#00f3ff'
        };

        this.mouseX = this.width / 2;
        this.gameOver = false;
        this.keys = { left: false, right: false };

        this.inputHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
        };
        this.clickHandler = (e) => {
            e.preventDefault();
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }
            if (this.balls.some(b => !b.active)) {
                this.serveBall();
            }
        };
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (touch.clientX - rect.left) * (this.width / rect.width);
        };
        this.touchStartHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (touch.clientX - rect.left) * (this.width / rect.width);
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }
            if (this.balls.some(b => !b.active)) {
                this.serveBall();
            }
        };
    }

    init() {
        this.gameOver = false;
        this.keys = { left: false, right: false };
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 0;
        this.mouseX = this.width / 2;
        this.paddle.width = this.BASE_PADDLE_WIDTH;

        window.addEventListener('mousemove', this.inputHandler);
        this.canvas.addEventListener('pointerdown', this.clickHandler);
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });

        this.handleKey = (e) => {
            if (e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'Escape') {
                this.paused = !this.paused;
            }
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (this.balls.some(b => !b.active)) {
                    this.serveBall();
                }
            }
            if (this.gameOver && e.code === 'KeyR') {
                this.stop();
                this.init();
            }
        };
        this.handleKeyUp = (e) => {
            if (e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'ArrowRight') this.keys.right = false;
        };
        window.addEventListener('keydown', this.handleKey);
        window.addEventListener('keyup', this.handleKeyUp);

        this.createLevel();
        this.resetBall();

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
        this.isRunning = true;
    }

    stop() {
        this.loop.stop();
        this.scaler.destroy();
        this.isRunning = false;
        window.removeEventListener('mousemove', this.inputHandler);
        this.canvas.removeEventListener('pointerdown', this.clickHandler);
        window.removeEventListener('keydown', this.handleKey);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.remove();
    }

    createLevel() {
        this.bricks = [];
        const levelData = Levels[this.currentLevel % Levels.length];
        const map = levelData.map;
        const rows = map.length;
        const cols = map[0].length;
        const padding = 10;
        const brickWidth = (this.width - (cols + 1) * padding) / cols;
        const brickHeight = 25;

        const brickTypes = [
            null,
            { color: '#c0392b', hp: 3, score: 50 },
            { color: '#e67e22', hp: 2, score: 30 },
            { color: '#f1c40f', hp: 1, score: 20 },
            { color: '#2ecc71', hp: 1, score: 10 },
            { color: '#3498db', hp: 1, score: 10 },
            { color: '#9b59b6', hp: 1, score: 10 }
        ];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const typeId = map[r][c];
                if (typeId === 0) continue;
                const type = brickTypes[typeId];
                if (!type) continue;

                this.bricks.push({
                    x: padding + c * (brickWidth + padding),
                    y: padding + 50 + r * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: type.color,
                    maxHp: type.hp,
                    hp: type.hp,
                    scoreValue: type.score,
                    status: 1
                });
            }
        }
    }

    resetBall() {
        this.balls = [];
        this.powerups = [];
        this.spawnBall();
    }

    spawnBall() {
        this.balls.push({
            pos: new Vector2(
                this.paddle.x + this.paddle.width / 2,
                this.paddle.y - this.BALL_RADIUS - 2
            ),
            vel: new Vector2(0, 0),
            speed: this.INITIAL_SPEED,
            active: false,
            color: '#fff'
        });
    }

    serveBall() {
        this.balls.forEach(ball => {
            if (!ball.active) {
                ball.active = true;
                const angle = -Math.PI / 2 + (Math.random() - 0.5);
                ball.vel = new Vector2(Math.cos(angle), Math.sin(angle)).scale(ball.speed);
            }
        });
        this.playSound('serve');
    }

    update(dt) {
        if (!this.isRunning || this.paused || this.gameOver) return;

        const PADDLE_SPEED = 800;
        if (this.keys.left) this.mouseX -= PADDLE_SPEED * dt;
        if (this.keys.right) this.mouseX += PADDLE_SPEED * dt;

        this.paddle.x = this.mouseX - this.paddle.width / 2;
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));

        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            if (!ball.active) {
                ball.pos.x = this.paddle.x + this.paddle.width / 2;
                ball.pos.y = this.paddle.y - this.BALL_RADIUS - 2;
                continue;
            }

            const nextPos = ball.pos.add(ball.vel.clone().scale(dt));

            if (nextPos.x - this.BALL_RADIUS < 0) {
                nextPos.x = this.BALL_RADIUS;
                ball.vel.x *= -1;
                this.playSound('wall_hit');
            } else if (nextPos.x + this.BALL_RADIUS > this.width) {
                nextPos.x = this.width - this.BALL_RADIUS;
                ball.vel.x *= -1;
                this.playSound('wall_hit');
            }

            if (nextPos.y - this.BALL_RADIUS < 0) {
                nextPos.y = this.BALL_RADIUS;
                ball.vel.y *= -1;
                this.playSound('wall_hit');
            } else if (nextPos.y - this.BALL_RADIUS > this.height) {
                this.balls.splice(i, 1);
                this.playSound('die');
                continue;
            }

            if (this.checkAABB(nextPos, this.paddle)) {
                nextPos.y = this.paddle.y - this.BALL_RADIUS;
                const paddleCenter = this.paddle.x + this.paddle.width / 2;
                const hitOffset = (nextPos.x - paddleCenter) / (this.paddle.width / 2);
                const maxAngle = Math.PI / 3;
                const newAngle = -Math.PI / 2 + hitOffset * maxAngle;
                ball.vel = new Vector2(Math.cos(newAngle), Math.sin(newAngle)).scale(ball.speed);
                this.playSound('paddle_hit');
            }

            for (const brick of this.bricks) {
                if (brick.status === 1 && this.checkAABB(nextPos, brick)) {
                    brick.hp--;
                    this.score += 10;

                    if (brick.hp <= 0) {
                        brick.status = 0;
                        this.score += brick.scoreValue;
                        this.playSound('brick_break');
                        this.createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                        this.shake = 5;

                        if (Math.random() < 0.35) {
                            this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                        }
                    } else {
                        this.playSound('brick_hit');
                    }

                    const dx = Math.abs(ball.pos.x - (brick.x + brick.width / 2));
                    const dy = Math.abs(ball.pos.y - (brick.y + brick.height / 2));
                    const halfW = brick.width / 2;
                    const halfH = brick.height / 2;

                    if (dx / halfW > dy / halfH) {
                        ball.vel.x *= -1;
                    } else {
                        ball.vel.y *= -1;
                    }

                    this.increaseSpeed(ball);
                    break;
                }
            }

            ball.pos = nextPos;
        }

        if (this.balls.length === 0) {
            this.loseLife();
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.y += p.dy * dt;

            if (this.checkAABB({ x: p.x, y: p.y + p.height / 2 }, this.paddle)) {
                this.activatePowerUp(p.type);
                this.powerups.splice(i, 1);
                this.playSound('powerup');
                continue;
            }

            if (p.y > this.height) {
                this.powerups.splice(i, 1);
            }
        }

        if (this.bricks.every(b => b.status === 0)) {
            this.levelComplete();
        }

        if (this.shake > 0) {
            this.shake -= dt * 50;
            if (this.shake < 0) this.shake = 0;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    spawnPowerUp(x, y) {
        const types = Object.keys(this.POWERUP_TYPES);
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const type = this.POWERUP_TYPES[typeKey];

        this.powerups.push({
            x, y,
            width: 30, height: 15,
            dy: 150,
            type: typeKey,
            color: type.color,
            symbol: type.symbol,
            active: true
        });
    }

    activatePowerUp(type) {
        switch (type) {
            case 'MULTI': {
                const currentBalls = [...this.balls];
                currentBalls.forEach(ball => {
                    if (ball.active) {
                        for (let i = 0; i < 2; i++) {
                            const angle = Math.atan2(ball.vel.y, ball.vel.x) + (Math.random() * 0.5 - 0.25);
                            this.balls.push({
                                pos: new Vector2(ball.pos.x, ball.pos.y),
                                vel: new Vector2(Math.cos(angle), Math.sin(angle)).scale(ball.speed),
                                speed: ball.speed,
                                active: true,
                                color: this.POWERUP_TYPES.MULTI.color
                            });
                        }
                    }
                });
                break;
            }
            case 'WIDE':
                this.paddle.width = this.BASE_PADDLE_WIDTH * 1.5;
                this.paddle.color = this.POWERUP_TYPES.WIDE.color;
                break;
            case 'LIFE':
                this.lives++;
                this.playSound('levelup');
                break;
        }
        this.score += 100;
    }

    createExplosion(x, y, color) {
        const count = 10 + Math.random() * 5;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
                color,
                size: 2 + Math.random() * 3
            });
        }
    }

    checkAABB(circlePos, rect) {
        const closestX = Math.max(rect.x, Math.min(circlePos.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circlePos.y, rect.y + rect.height));
        const dx = circlePos.x - closestX;
        const dy = circlePos.y - closestY;
        return (dx * dx + dy * dy) < (this.BALL_RADIUS * this.BALL_RADIUS);
    }

    increaseSpeed(ball) {
        if (ball.speed < this.MAX_SPEED) {
            ball.speed += this.SPEED_INCREMENT;
            ball.vel = ball.vel.normalize().scale(ball.speed);
        }
    }

    loseLife() {
        this.lives--;
        this.playSound('die');
        this.paddle.width = this.BASE_PADDLE_WIDTH;
        this.paddle.color = '#00f3ff';

        if (this.lives <= 0) {
            this.gameOver = true;
            this.storage.saveHighScore('cosmic-breaker', this.score);
            if (this.onGameOver) this.onGameOver();
        } else {
            this.resetBall();
        }
    }

    levelComplete() {
        this.playSound('levelup');
        this.currentLevel++;
        this.resetBall();
        this.createLevel();
    }

    playSound(id) {
        switch (id) {
            case 'paddle_hit':
                this.audio.playTone(440, 'square', 0.1);
                break;
            case 'brick_hit':
                this.audio.playTone(880, 'square', 0.05);
                break;
            case 'brick_break':
                this.audio.playTone(440, 'sawtooth', 0.1);
                this.audio.playTone(880, 'square', 0.05);
                break;
            case 'wall_hit':
                this.audio.playTone(220, 'triangle', 0.05);
                break;
            case 'die':
                this.audio.playTone(110, 'sawtooth', 0.5);
                break;
            case 'serve':
                this.audio.playTone(660, 'sine', 0.2);
                break;
            case 'levelup':
                this.audio.playTone(1320, 'square', 0.4);
                break;
            case 'powerup':
                this.audio.playTone(550, 'sine', 0.1);
                this.audio.playTone(1100, 'sine', 0.1);
                break;
        }
    }

    drawRoundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }

    render() {
        this.ctx.save();

        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
        }

        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Bricks
        this.bricks.forEach(brick => {
            if (brick.status === 1) {
                this.ctx.fillStyle = brick.color;
                if (brick.hp < brick.maxHp) {
                    this.ctx.globalAlpha = 0.5 + (0.5 * (brick.hp / brick.maxHp));
                }
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 2);
                this.ctx.globalAlpha = 1.0;
            }
        });

        // Paddle
        this.ctx.fillStyle = this.paddle.color;
        this.drawRoundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 10);
        this.ctx.fill();
        this.ctx.shadowColor = this.paddle.color;
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // PowerUps
        this.powerups.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.drawRoundRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height, 5);
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.symbol, p.x, p.y + 3);
        });

        // Balls
        this.balls.forEach(ball => {
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.pos.x, ball.pos.y, this.BALL_RADIUS, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px "Courier New"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 30);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`HI: ${Math.max(this.score, this.highScore)}`, this.width / 2, 30);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LIVES: ${this.lives}`, this.width - 20, 30);

        this.ctx.textAlign = 'center';
        this.ctx.font = '14px "Courier New"';
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        const levelName = Levels[this.currentLevel % Levels.length].name;
        this.ctx.fillText(`LEVEL ${this.currentLevel + 1}: ${levelName}`, this.width / 2, 50);

        // Click to Start hint
        if (this.balls.some(b => !b.active) && this.isRunning) {
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.fillText("CLICK or SPACE TO LAUNCH", this.width / 2, this.height / 2 + 50);
        }

        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore();

        // Pause overlay (outside shake transform)
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

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Press R to Restart', this.width / 2, this.height / 2 + 55);
            if (this.score >= this.highScore && this.score > 0) {
                this.ctx.fillStyle = '#ff0';
                this.ctx.fillText('NEW HIGH SCORE!', this.width / 2, this.height / 2 + 90);
            }
        }
    }
}
