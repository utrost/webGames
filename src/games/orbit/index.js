import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { StorageManager } from '../../core/StorageManager.js';
import { Physics } from './Physics.js';
import { Sun, Planet, Comet, Projectile } from './Entities.js';
import { Vector2 } from '../../core/Vector2.js';

export class Orbit {
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
        this.physics = new Physics();
        this.bodies = [];
        this.paused = false;
        this.highScore = this.storage.getHighScore('orbit');
    }

    init() {
        this.score = 0;
        this.gameOver = false;
        this.waveTimer = 0;
        this.waveDifficulty = 1;
        this.paused = false;

        this.bodies = [];
        this.sun = new Sun(this.width / 2, this.height / 2);
        this.sun.onDamage = () => {
            this.audio.playTone(100, 'square', 0.5);
        };
        this.bodies.push(this.sun);

        const planet = new Planet(this.width / 2 + 200, this.height / 2);
        planet.setVelocity(new Vector2(0, 5));
        this.bodies.push(planet);

        this.setupInput();

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
    }

    update(dt) {
        if (this.gameOver || this.paused) return;

        const timeScale = this.isDragging ? 0.2 : 1.0;
        const simDt = dt * timeScale;

        this.waveTimer += simDt;
        if (this.waveTimer > 3.0 / this.waveDifficulty) {
            this.waveTimer = 0;
            this.spawnComet();
        }

        if (this.waveDifficulty < 5) {
            this.waveDifficulty += dt * 0.01;
        }

        this.physics.update(this.bodies, simDt);

        for (let i = this.bodies.length - 1; i >= 0; i--) {
            const b = this.bodies[i];
            const dist = b.pos.dist(this.sun.pos);
            if (dist > 1500) b.toBeRemoved = true;
            if (b.toBeRemoved) {
                this.bodies.splice(i, 1);
            }
        }

        if (this.sun.hp <= 0) {
            this.gameOver = true;
            this.storage.saveHighScore('orbit', this.score);
        }
    }

    render() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.bodies.forEach(b => {
            if (b === this.sun) {
                const intensity = Math.max(0.1, b.hp / 100);
                this.ctx.shadowBlur = 20 * intensity + 10;
                this.ctx.shadowColor = `rgba(255, 255, 255, ${intensity})`;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
            } else {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = b.color;
                this.ctx.fillStyle = b.color;
            }

            this.ctx.beginPath();
            this.ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        if (this.isDragging) {
            const diff = this.dragStart.clone().subtract(this.dragCurrent);
            const launchVel = diff.scale(0.05);

            const dummy = new Projectile(this.dragStart.x, this.dragStart.y);
            const path = this.physics.predict(this.bodies, dummy, launchVel, 60, 0.016);

            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
            path.forEach(p => this.ctx.lineTo(p.x, p.y));
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            this.ctx.strokeStyle = '#666';
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
            this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
            this.ctx.stroke();
        }

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 30);
        this.ctx.fillText(`HI: ${Math.max(this.score, this.highScore)}`, 20, 55);
        this.ctx.fillText(`SUN INTEGRITY: ${Math.max(0, this.sun.hp)}%`, 20, 80);

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
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CRITICAL FAILURE', this.width / 2, this.height / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
            if (this.score >= this.highScore) {
                this.ctx.fillStyle = '#ff0';
                this.ctx.fillText('NEW HIGH SCORE!', this.width / 2, this.height / 2 + 70);
            }
        }
    }

    setupInput() {
        this.isDragging = false;
        this.dragStart = null;
        this.dragCurrent = null;

        this.handleDown = (e) => {
            if (this.gameOver || this.paused) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.width / rect.width);
            const y = (e.clientY - rect.top) * (this.height / rect.height);
            this.isDragging = true;
            this.dragStart = new Vector2(x, y);
            this.dragCurrent = new Vector2(x, y);
        };

        this.handleMove = (e) => {
            if (!this.isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.width / rect.width);
            const y = (e.clientY - rect.top) * (this.height / rect.height);
            this.dragCurrent.x = x;
            this.dragCurrent.y = y;
        };

        this.handleUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            const diff = this.dragStart.clone().subtract(this.dragCurrent);
            const launchVel = diff.scale(0.05);

            const p = new Projectile(this.dragStart.x, this.dragStart.y);
            p.setVelocity(launchVel);

            p.onCollision = (other) => {
                if (other.constructor.name === 'Comet') {
                    this.score += 100;
                    this.audio.playTone(800 + Math.random() * 400, 'sine', 0.1);
                }
            };

            this.bodies.push(p);
            this.audio.playTone(600, 'sawtooth', 0.1);
        };

        this.handleKey = (e) => {
            if (e.code === 'Escape') {
                this.paused = !this.paused;
            }
        };

        // Touch support
        this.handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleDown({ clientX: touch.clientX, clientY: touch.clientY });
        };
        this.handleTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMove({ clientX: touch.clientX, clientY: touch.clientY });
        };
        this.handleTouchEnd = (e) => {
            e.preventDefault();
            this.handleUp();
        };

        this.canvas.addEventListener('mousedown', this.handleDown);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('mouseup', this.handleUp);
        window.addEventListener('keydown', this.handleKey);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    stop() {
        this.loop.stop();
        this.canvas.remove();
        this.canvas.removeEventListener('mousedown', this.handleDown);
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('mouseup', this.handleUp);
        window.removeEventListener('keydown', this.handleKey);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }

    spawnComet() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 600;
        const spawnPos = new Vector2(
            this.width / 2 + Math.cos(angle) * dist,
            this.height / 2 + Math.sin(angle) * dist
        );

        const comet = new Comet(spawnPos.x, spawnPos.y);

        const target = this.sun.pos.clone();
        const dir = target.subtract(spawnPos).normalize();
        const speed = 100 + Math.random() * 50;
        comet.setVelocity(dir.scale(speed));

        this.bodies.push(comet);
    }
}
