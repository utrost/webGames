export class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        const angle = options.angle ?? Math.random() * Math.PI * 2;
        const speed = options.speed ?? (50 + Math.random() * 100);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = options.life ?? (0.5 + Math.random() * 0.5);
        this.maxLife = this.life;
        this.color = options.color ?? '#fff';
        this.size = options.size ?? (2 + Math.random() * 3);
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, options = {}) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, options));
        }
    }

    update(dt) {
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

    render(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
    }

    clear() {
        this.particles.length = 0;
    }

    get count() {
        return this.particles.length;
    }
}
