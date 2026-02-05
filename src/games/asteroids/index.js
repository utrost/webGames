import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { Vector2 } from '../../core/Vector2.js';
import { Ship, Asteroid, Bullet, Particle } from './Entities.js';

export class Asteroids {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;
        this.audio = new AudioManager();

        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        console.log('Asteroids Initialized');

        this.score = 0;
        this.lives = 3;
        this.gameOver = false;

        this.entities = [];
        this.asteroids = []; // Track explicitly for wave logic

        // Spawn Ship
        this.spawnShip();

        // Spawn Wave 1
        this.nextWave(3);

        // Input
        this.keys = {};
        this.binds = {
            down: e => this.keys[e.code] = true,
            up: e => this.keys[e.code] = false
        };
        window.addEventListener('keydown', this.binds.down);
        window.addEventListener('keyup', this.binds.up);

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
    }

    nextWave(count) {
        this.audio.playTone(600, 'sine', 0.5);
        for (let i = 0; i < count; i++) {
            this.spawnAsteroid();
        }
    }

    spawnShip() {
        this.ship = new Ship(this.width / 2, this.height / 2);
        this.entities.push(this.ship);
    }

    spawnAsteroid(x, y, size = 3) {
        if (!x) {
            // Random spawn logic
            do {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
            } while (new Vector2(x, y).dist(this.ship ? this.ship.pos : new Vector2(this.width / 2, this.height / 2)) < 200);
        }
        const a = new Asteroid(x, y, size);
        this.entities.push(a);
        this.asteroids.push(a);
    }

    spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.entities.push(new Particle(x, y, color));
        }
    }

    stop() {
        this.loop.stop();
        this.canvas.remove();
        window.removeEventListener('keydown', this.binds.down);
        window.removeEventListener('keyup', this.binds.up);
    }

    update(dt) {
        if (this.gameOver && this.keys['KeyR']) {
            this.stop(); // Clean up listeners
            this.init(); // Restart
            return;
        }
        if (this.gameOver) return;

        // Ship Control
        if (this.ship && !this.ship.toBeRemoved) {
            const rotSpeed = 4;
            if (this.keys['ArrowLeft']) this.ship.rotation -= rotSpeed * dt;
            if (this.keys['ArrowRight']) this.ship.rotation += rotSpeed * dt;

            if (this.keys['ArrowUp']) {
                const thrust = 200;
                const force = new Vector2(Math.cos(this.ship.rotation), Math.sin(this.ship.rotation)).scale(thrust * dt);
                this.ship.vel.add(force);
                // Thrust particles
                if (Math.random() > 0.5) {
                    const offset = new Vector2(Math.cos(this.ship.rotation), Math.sin(this.ship.rotation)).scale(-15);
                    this.spawnParticles(this.ship.pos.x + offset.x, this.ship.pos.y + offset.y, '#0ff', 1);
                }
            }

            this.ship.vel.scale(0.99); // Drag

            if (this.keys['Space'] && !this.shootCooldown) {
                this.shoot();
                this.shootCooldown = 0.2;
            }
        } else if (this.lives > 0 && !this.respawnTimer) {
            // Respawn logic
            this.respawnTimer = 2.0;
        }

        if (this.respawnTimer > 0) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.spawnShip();
                this.respawnTimer = 0;
            }
        }

        if (this.shootCooldown > 0) this.shootCooldown -= dt;

        // Update Entities & Collisions
        const asteroids = [];
        const bullets = [];

        // 1. Update & Wrap
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.update(dt);
            e.wrap(this.width, this.height);

            if (e.toBeRemoved) {
                this.entities.splice(i, 1);
                continue;
            }

            if (e instanceof Asteroid) asteroids.push(e);
            if (e instanceof Bullet) bullets.push(e);
        }

        // 2. Collisions
        // Bullet vs Asteroid
        for (const b of bullets) {
            for (const a of asteroids) {
                if (b.pos.distSq(a.pos) < (b.radius + a.radius) ** 2) {
                    this.destroyAsteroid(a);
                    b.toBeRemoved = true;
                    break;
                }
            }
        }

        // Ship vs Asteroid
        if (this.ship && !this.ship.toBeRemoved) {
            for (const a of asteroids) {
                if (this.ship.pos.distSq(a.pos) < (this.ship.radius + a.radius) ** 2) {
                    this.killShip();
                    break;
                }
            }
        }

        // Check Wave
        if (asteroids.length === 0 && this.lives > 0 && !this.gameOver) {
            // Delay slightly so it doesn't pop instantly
            if (!this.waveDelay) this.waveDelay = 1.0;
            this.waveDelay -= dt;
            if (this.waveDelay <= 0) {
                this.nextWave(5 + Math.floor(this.score / 1000));
                this.waveDelay = 0;
            }
        }
    }

    shoot() {
        const b = new Bullet(
            this.ship.pos.x + Math.cos(this.ship.rotation) * this.ship.radius,
            this.ship.pos.y + Math.sin(this.ship.rotation) * this.ship.radius,
            this.ship.rotation
        );
        this.entities.push(b);
        this.audio.playTone(800, 'triangle', 0.05);
    }

    destroyAsteroid(a) {
        if (a.toBeRemoved) return;
        a.toBeRemoved = true;
        this.score += 100 * (4 - a.size);
        this.audio.playTone(400 - a.size * 50, 'square', 0.1);

        this.spawnParticles(a.pos.x, a.pos.y, '#f0f', 5 * a.size);

        if (a.size > 1) {
            const newSize = a.size - 1;
            for (let i = 0; i < 2; i++) {
                const newA = new Asteroid(a.pos.x, a.pos.y, newSize);
                const angle = Math.random() * Math.PI * 2;
                newA.vel = a.vel.clone().add(new Vector2(Math.cos(angle), Math.sin(angle)).scale(50));
                this.entities.push(newA);
            }
        }
    }

    killShip() {
        this.ship.toBeRemoved = true;
        this.audio.playTone(100, 'sawtooth', 0.5);
        this.spawnParticles(this.ship.pos.x, this.ship.pos.y, '#0ff', 20);
        this.lives--;

        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render Entities
        this.entities.forEach(e => e.render(this.ctx));

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 30);
        this.ctx.fillText(`LIVES: ${this.lives}`, 20, 60);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('MISSION FAILED', this.width / 2, this.height / 2);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
            this.ctx.fillText('Press R to Restart', this.width / 2, this.height / 2 + 80);
        }
    }
}
