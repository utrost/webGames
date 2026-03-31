import { Vector2 } from '../../core/Vector2.js';

export class Entity {
    constructor(x, y, radius, color) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.radius = radius;
        this.color = color;
        this.rotation = 0; // Radians
        this.toBeRemoved = false;
    }

    update(dt) {
        this.pos.add(this.vel.clone().scale(dt));
    }

    render(ctx) {
        // Override
    }

    wrap(width, height) {
        if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
        if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
        if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
        if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
    }
}

export class Ship extends Entity {
    constructor(x, y) {
        super(x, y, 15, '#0ff'); // Cyan
        this.rotation = -Math.PI / 2; // Point up
    }

    render(ctx) {
        // Blink during invincibility (visible every other 0.1s)
        if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.7);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}

export class Asteroid extends Entity {
    constructor(x, y, size) {
        // Size: 3 = Large, 2 = Medium, 1 = Small
        const radius = size * 15;
        super(x, y, radius, '#f0f'); // Magenta
        this.size = size;

        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = (4 - size) * 30; // Smaller = faster
        this.vel = new Vector2(Math.cos(angle), Math.sin(angle)).scale(speed);

        // Generate Jagged Shape
        this.points = [];
        const segments = 8 + size * 2;
        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            const r = this.radius * (0.8 + Math.random() * 0.4);
            this.points.push(new Vector2(Math.cos(a) * r, Math.sin(a) * r));
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        if (this.points.length > 0) {
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            if (this.points.length > 0) ctx.lineTo(this.points[0].x, this.points[0].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}

export class Bullet extends Entity {
    constructor(x, y, rotation) {
        super(x, y, 2, '#fff');
        const speed = 400;
        this.vel = new Vector2(Math.cos(rotation), Math.sin(rotation)).scale(speed);
        this.life = 1.5; // seconds
    }

    update(dt) {
        super.update(dt);
        this.life -= dt;
        if (this.life <= 0) this.toBeRemoved = true;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y, Math.random() * 2, color);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100;
        this.vel = new Vector2(Math.cos(angle), Math.sin(angle)).scale(speed);
        this.life = 0.5 + Math.random() * 0.5;
    }

    update(dt) {
        super.update(dt);
        this.life -= dt;
        if (this.life <= 0) this.toBeRemoved = true;
    }

    render(ctx) {
        ctx.globalAlpha = this.life; // Fade out
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
