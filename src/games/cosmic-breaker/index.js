import { Vector2 } from '../../core/Vector2.js';
import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';

export class CosmicBreaker {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;

        // Core Services
        this.audio = new AudioManager();
        this.storage = new StorageManager();

        // Canvas Setup
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Game State
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
        this.score = 0;
        this.highScore = this.storage.getHighScore('cosmic-breaker');
        this.lives = 3;
        this.lives = 3;
        this.bricks = [];
        this.balls = []; // Array of ball objects
        this.powerups = []; // Array of powerup objects
        this.particles = [];
        this.shake = 0;

        this.POWERUP_TYPES = {
            MULTI: { color: '#2ecc71', symbol: 'M', score: 100 },
            WIDE: { color: '#3498db', symbol: 'W', score: 100 },
            LIFE: { color: '#e74c3c', symbol: 'L', score: 500 }
        };

        // Physics Constants
        this.PADDLE_WIDTH = 120;
        this.BASE_PADDLE_WIDTH = 120; // Store base for resetting
        this.PADDLE_HEIGHT = 20;
        this.BALL_RADIUS = 8;
        this.INITIAL_SPEED = 400; // pixels per second
        this.MAX_SPEED = 800;
        this.SPEED_INCREMENT = 20;

        // Entities
        this.paddle = {
            x: this.width / 2 - this.PADDLE_WIDTH / 2,
            y: this.height - 50,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT,
            color: '#00f3ff'
        };

        this.balls = []; // Array of ball objects

        // Input
        this.mouseX = 0;
        this.inputHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
        };
        this.clickHandler = () => {
            // Resume audio context if suspended (browser policy)
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume();
            }

            if (this.balls.some(b => !b.active)) {
                this.serveBall();
            }
        };
    }

    init() {
        window.addEventListener('mousemove', this.inputHandler);
        window.addEventListener('click', this.clickHandler);

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
        this.isRunning = false;
        window.removeEventListener('mousemove', this.inputHandler);
        window.removeEventListener('click', this.clickHandler);
        this.canvas.remove();
    }

    createLevel() {
        this.bricks = [];
        const rows = 6;
        const cols = 10;
        const padding = 10;
        const brickWidth = (this.width - (cols + 1) * padding) / cols;
        const brickHeight = 25;

        // Define Brick Types by Row (Top to Bottom)
        // r=0 is top
        const rowTypes = [
            { color: '#c0392b', hp: 3, score: 50 }, // Deep Red (Strongest)
            { color: '#e67e22', hp: 2, score: 30 }, // Orange
            { color: '#f1c40f', hp: 1, score: 20 }, // Yellow
            { color: '#2ecc71', hp: 1, score: 10 }, // Green
            { color: '#3498db', hp: 1, score: 10 }, // Blue
            { color: '#9b59b6', hp: 1, score: 10 }  // Purple
        ];

        for (let r = 0; r < rows; r++) {
            const type = rowTypes[r % rowTypes.length];
            for (let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: padding + c * (brickWidth + padding),
                    y: padding + 50 + r * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: type.color,
                    maxHp: type.hp,
                    hp: type.hp,
                    scoreValue: type.score,
                    status: 1 // 1 = active, 0 = broken
                });
            }
        }
    }

    resetBall() {
        this.balls = [];
        this.powerups = []; // Clear powerups on board
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
                // Launch at a random upward angle
                const angle = -Math.PI / 2 + (Math.random() - 0.5); // Slightly random vertical
                ball.vel = new Vector2(Math.cos(angle), Math.sin(angle)).scale(ball.speed);
            }
        });
        this.playSound('serve');
    }

    update(dt) {
        if (!this.isRunning) return;

        // 1. Paddle Movement (Clamped)
        this.paddle.x = this.mouseX - this.paddle.width / 2;
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));

        // Iterate backwards to allow removal
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            if (!ball.active) {
                // Ball stuck to paddle
                ball.pos.x = this.paddle.x + this.paddle.width / 2;
                ball.pos.y = this.paddle.y - this.BALL_RADIUS - 2;
                continue;
            }

            // 2. Ball Movement
            const nextPos = ball.pos.add(ball.vel.scale(dt));

            // 3. Wall Collisions
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
                // Ball lost
                this.balls.splice(i, 1);
                this.playSound('die'); // Maybe softer sound if lives remain?
                continue;
            }

            // 4. Paddle Collision (The "English" Mechanic)
            if (this.checkAABB(nextPos, this.paddle)) {
                // Simple vertical flip for now
                nextPos.y = this.paddle.y - this.BALL_RADIUS; // Push out

                // Calculate hit offset (-1 to 1) relative to paddle center
                const paddleCenter = this.paddle.x + this.paddle.width / 2;
                const hitOffset = (nextPos.x - paddleCenter) / (this.paddle.width / 2);

                // Deflect angle based on offset (English)
                // Max angle: 60 degrees (approx 1 rad)
                const maxAngle = Math.PI / 3;
                const newAngle = -Math.PI / 2 + hitOffset * maxAngle; // -90 deg + offset

                // Apply new velocity, maintaining speed
                ball.vel = new Vector2(Math.cos(newAngle), Math.sin(newAngle)).scale(ball.speed);

                this.playSound('paddle_hit');
            }

            // 5. Brick Collisions
            let hitBrick = false;
            for (const brick of this.bricks) {
                if (brick.status === 1 && this.checkAABB(nextPos, brick)) {
                    brick.hp--;
                    this.score += 10; // 10 points for every hit

                    if (brick.hp <= 0) {
                        brick.status = 0;
                        this.score += brick.scoreValue; // Bonus for destroying
                        this.playSound('brick_break');
                        this.createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                        this.shake = 5; // Pixels of shake

                        // 15% Chance to drop PowerUp
                        if (Math.random() < 0.15) {
                            this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                        }
                    } else {
                        this.playSound('brick_hit');
                    }

                    hitBrick = true;

                    const dx = Math.abs(ball.pos.x - (brick.x + brick.width / 2));
                    const dy = Math.abs(ball.pos.y - (brick.y + brick.height / 2));
                    const halfW = brick.width / 2;
                    const halfH = brick.height / 2;

                    if (dx / halfW > dy / halfH) {
                        ball.vel.x *= -1; // Side hit
                    } else {
                        ball.vel.y *= -1; // Top/Bottom hit
                    }

                    // Speed ramp
                    this.increaseSpeed(ball);
                    // Sound played above based on damage/break
                    break; // Only hit one brick per frame
                }
            }

            // Apply movement
            ball.pos = nextPos;
        }

        // Check for Life Loss (No balls left)
        if (this.balls.length === 0) {
            this.loseLife();
        }

        // Update PowerUps
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.y += p.dy * dt;

            // Collision with Paddle
            if (this.checkAABB({ x: p.x, y: p.y + p.height / 2 }, this.paddle)) {
                this.activatePowerUp(p.type);
                this.powerups.splice(i, 1);
                this.playSound('powerup');
                continue;
            }

            // Remove if off screen
            if (p.y > this.height) {
                this.powerups.splice(i, 1);
            }
        }

        // Check Level Clear
        if (this.bricks.every(b => b.status === 0)) {
            this.levelComplete();
        }

        // 6. Visual Effects Update
        if (this.shake > 0) {
            this.shake -= dt * 50; // Decay
            if (this.shake < 0) this.shake = 0;
        }

        // Update Particles
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
            x: x,
            y: y,
            width: 30,
            height: 15,
            dy: 150, // Fall speed
            type: typeKey,
            color: type.color,
            symbol: type.symbol,
            active: true
        });
    }

    activatePowerUp(type) {
        switch (type) {
            case 'MULTI':
                // Duplicate every active ball
                const currentBalls = [...this.balls];
                currentBalls.forEach(ball => {
                    if (ball.active) {
                        // Spawn 2 new balls from this position
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
            case 'WIDE':
                this.paddle.width = this.BASE_PADDLE_WIDTH * 1.5;
                this.paddle.color = this.POWERUP_TYPES.WIDE.color;
                break;
            case 'LIFE':
                this.lives++;
                this.playSound('levelup'); // Re-use nice sound
                break;
        }
        this.score += 100;
    }

    createExplosion(x, y, color) {
        // Create 10-15 particles
        const count = 10 + Math.random() * 5;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
                color: color,
                size: 2 + Math.random() * 3
            });
        }
    }

    checkAABB(circlePos, rect) {
        // Treat circle as a square for simple AABB first, or do proper circle-rect
        // Proper Circle-Rect:
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
        // Reset Paddle
        this.paddle.width = this.BASE_PADDLE_WIDTH;
        this.paddle.color = '#00f3ff';

        if (this.lives <= 0) {
            this.isRunning = false;
            this.storage.saveHighScore('cosmic-breaker', this.score);
            this.onGameOver();
        } else {
            this.resetBall();
        }
    }

    levelComplete() {
        this.playSound('levelup');
        this.resetBall();
        this.createLevel();
        // Maybe increase base speed?
    }

    playSound(id) {
        switch (id) {
            case 'paddle_hit':
                this.audio.playTone(440, 'square', 0.1); // A4
                break;
            case 'brick_hit':
                this.audio.playTone(880, 'square', 0.05); // A5 High Pitch
                break;
            case 'brick_break':
                this.audio.playTone(440, 'sawtooth', 0.1); // Break sound
                this.audio.playTone(880, 'square', 0.05);  // Layered
                break;
            case 'wall_hit':
                this.audio.playTone(220, 'triangle', 0.05); // Low Thud
                break;
            case 'die':
                this.audio.playTone(110, 'sawtooth', 0.5); // Death sound
                break;
            case 'serve':
                this.audio.playTone(660, 'sine', 0.2);
                break;
            case 'levelup':
                // Arpeggio? For now, just a distinct sound
                this.audio.playTone(1320, 'square', 0.4);
                break;
            case 'powerup':
                this.audio.playTone(550, 'sine', 0.1);
                this.audio.playTone(1100, 'sine', 0.1);
                break;
        }
    }

    render() {
        // Clear (Handle shake)
        this.ctx.save();

        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
        }

        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Bricks
        this.bricks.forEach(brick => {
            if (brick.status === 1) {
                this.ctx.fillStyle = brick.color;

                // Dim damaged bricks
                if (brick.hp < brick.maxHp) {
                    this.ctx.globalAlpha = 0.5 + (0.5 * (brick.hp / brick.maxHp));
                }

                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

                // Bevel/Shine effect
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 2);

                this.ctx.globalAlpha = 1.0; // Reset alpha
            }
        });

        // Draw Paddle
        this.ctx.fillStyle = this.paddle.color;
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 10);
        this.ctx.fill();
        // Paddle Glow
        this.ctx.shadowColor = this.paddle.color;
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw PowerUps
        this.powerups.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.roundRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height, 5);
            this.ctx.fill();

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.symbol, p.x, p.y + 3);
        });

        // Draw Balls
        this.balls.forEach(ball => {
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.pos.x, ball.pos.y, this.BALL_RADIUS, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px "Courier New"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 30);

        this.ctx.textAlign = 'center';
        this.ctx.fillText(`HI: ${Math.max(this.score, this.highScore)}`, this.width / 2, 30);

        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LIVES: ${this.lives}`, this.width - 20, 30);

        // "Click to Start" Hint
        // "Click to Start" Hint
        if (this.balls.some(b => !b.active) && this.isRunning) {
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.fillText("CLICK TO LAUNCH", this.width / 2, this.height / 2 + 50);
        }

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore(); // Restore shake transform
    }
}
