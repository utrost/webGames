import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { Physics } from './Physics.js';
import { Sun, Planet, Comet, Projectile } from './Entities.js';
import { Vector2 } from '../../core/Vector2.js';

export class Orbit {
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
        this.physics = new Physics();
        this.bodies = [];
        this.hasRendered = false; // DEBUG FLAG
    }

    init() {
        console.log('Orbit Initialized');

        // Game State
        this.score = 0;
        this.gameOver = false;
        this.waveTimer = 0;
        this.waveDifficulty = 1;

        // Entities
        this.bodies = [];
        this.sun = new Sun(this.width / 2, this.height / 2);
        this.sun.onDamage = (dmg) => {
            this.audio.playTone(100, 'square', 0.5);
        };
        this.bodies.push(this.sun);

        // Spawn Test Planet
        const planet = new Planet(this.width / 2 + 200, this.height / 2);
        planet.setVelocity(new Vector2(0, 5));
        this.bodies.push(planet);

        // Input
        this.setupInput();

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
    }

    // ... (rest of methods)

    update(dt) {
        if (this.gameOver) return;

        const timeScale = this.isDragging ? 0.2 : 1.0;
        const simDt = dt * timeScale;

        // Spawning
        this.waveTimer += simDt;
        if (this.waveTimer > 3.0 / this.waveDifficulty) {
            this.waveTimer = 0;
            this.spawnComet();
        }

        if (this.waveDifficulty < 5) {
            this.waveDifficulty += dt * 0.01;
        }

        this.physics.update(this.bodies, simDt);

        // Cleanup
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
        }
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Bodies
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

        // Prediction
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
        this.ctx.fillText(`SUN INTEGRITY: ${Math.max(0, this.sun.hp)}%`, 20, 55);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CRITICAL FAILURE', this.width / 2, this.height / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`Final Data: ${this.score}`, this.width / 2, this.height / 2 + 40);
        }
    }

    setupInput() {
        // Input State
        this.isDragging = false;
        this.dragStart = null;
        this.dragCurrent = null;

        // Handlers
        this.handleDown = (e) => {
            if (this.gameOver) return;
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

        this.handleUp = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;

            // Launch!
            const diff = this.dragStart.clone().subtract(this.dragCurrent);
            const launchVel = diff.scale(0.05);

            // Create Projectile
            const p = new Projectile(this.dragStart.x, this.dragStart.y);
            p.setVelocity(launchVel);

            // Callback for score
            p.onCollision = (other) => {
                if (other.constructor.name === 'Comet') {
                    this.score += 100;
                    this.audio.playTone(800 + Math.random() * 400, 'sine', 0.1);
                }
            };

            this.bodies.push(p);
            this.audio.playTone(600, 'sawtooth', 0.1);
        };

        this.canvas.addEventListener('mousedown', this.handleDown);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('mouseup', this.handleUp);
    }

    stop() {
        this.loop.stop();
        this.canvas.remove();
        // Remove listeners
        this.canvas.removeEventListener('mousedown', this.handleDown);
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('mouseup', this.handleUp);
    }

    update(dt) {
        try {
            if (this.gameOver) return;

            // Slowmo if dragging
            const timeScale = this.isDragging ? 0.2 : 1.0;
            const simDt = dt * timeScale;

            // Spawning
            this.waveTimer += simDt;
            if (this.waveTimer > 3.0 / this.waveDifficulty) {
                this.waveTimer = 0;
                this.spawnComet();
            }

            // Increase difficulty slowly
            if (this.waveDifficulty < 5) {
                this.waveDifficulty += dt * 0.01;
            }

            this.physics.update(this.bodies, simDt);

            // Cleanup Dead Bodies
            for (let i = this.bodies.length - 1; i >= 0; i--) {
                const b = this.bodies[i];

                // Check Bounds
                const dist = b.pos.dist(this.sun.pos);
                if (dist > 1500) b.toBeRemoved = true;

                if (b.toBeRemoved) {
                    this.bodies.splice(i, 1);
                }
            }

            // Check Game Over
            if (this.sun.hp <= 0) {
                this.gameOver = true;
            }
        } catch (e) {
            this.loop.stop();
            console.error(e);
            alert('Orbit Update Error: ' + e.message);
        }
    }

    spawnComet() {
        // Spawn on edge of circle
        const angle = Math.random() * Math.PI * 2;
        const dist = 600;
        const spawnPos = new Vector2(
            this.width / 2 + Math.cos(angle) * dist,
            this.height / 2 + Math.sin(angle) * dist
        );

        const comet = new Comet(spawnPos.x, spawnPos.y);

        // Velocity towards sun (with slight noise)
        const target = this.sun.pos.clone();
        const dir = target.subtract(spawnPos).normalize();
        const speed = 100 + Math.random() * 50;
        comet.setVelocity(dir.scale(speed));

        this.bodies.push(comet);
    }

    render() {
        try {
            // DEBUG CHECK
            if (!this.hasRendered) {
                this.hasRendered = true;
                if (this.bodies.length === 0) alert('Orbit Warning: No Bodies Found!');
                // We don't alert "Success" to avoid spam if it works, 
                // but user said "Black Screen", so if this runs, it SHOULD show something.
                // If this is called, and we see black, then drawing is broken.
                // If this is NOT called, loop is broken.
                alert('Orbit First Render: Active Bodies = ' + this.bodies.length);
            }

            // Clear (Deep Space Black)
            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Render Bodies
            this.bodies.forEach(b => {
                // Sun glow varies with HP
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

            // Render Prediction
            if (this.isDragging) {
                const diff = this.dragStart.clone().subtract(this.dragCurrent);
                const launchVel = diff.scale(0.05);

                const dummy = new Projectile(this.dragStart.x, this.dragStart.y);

                // Predict!
                const path = this.physics.predict(this.bodies, dummy, launchVel, 60, 0.016);

                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
                path.forEach(p => this.ctx.lineTo(p.x, p.y));
                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Draw Drag Line
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
            this.ctx.fillText(`SUN INTEGRITY: ${Math.max(0, this.sun.hp)}%`, 20, 55);

            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#f00';
                this.ctx.font = '40px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('CRITICAL FAILURE', this.width / 2, this.height / 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '20px monospace';
                this.ctx.fillText(`Final Data: ${this.score}`, this.width / 2, this.height / 2 + 40);
            }
        } catch (e) {
            this.loop.stop();
            console.error(e);
            alert('Orbit Render Error: ' + e.message);
        }
    }
}
