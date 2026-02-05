import { Vector2 } from '../../core/Vector2.js';

export class Body {
    constructor(x, y, mass, radius, color) {
        this.pos = new Vector2(x, y);
        this.oldPos = new Vector2(x, y); // For Verlet
        this.acc = new Vector2(0, 0);
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.isStatic = false;
        this.toBeRemoved = false;
    }

    setVelocity(v) {
        // Verlet initialization: oldPos = pos - v * dt
        // We'll calculate oldPos assuming a standard 60fps dt (0.016) for setup
        // OR we just store explicit velocity for the very first frame?
        // Let's store explicit vel and handle it in the first integration step
        this.vel = v;
    }

    clone() {
        const copy = new Body(this.pos.x, this.pos.y, this.mass, this.radius, this.color);
        copy.pos = this.pos.clone();
        copy.oldPos = this.oldPos.clone();
        copy.acc = this.acc.clone();
        copy.isStatic = this.isStatic;
        return copy;
    }
}

export class Sun extends Body {
    constructor(x, y) {
        super(x, y, 10000, 30, '#ffffff'); // Massive, fixed
        this.isStatic = true;
        this.hp = 100;
    }
}

export class Planet extends Body {
    constructor(x, y) {
        super(x, y, 10, 8, '#2ecc71'); // Green
    }
}

export class Comet extends Body {
    constructor(x, y) {
        super(x, y, 5, 5, '#e74c3c'); // Red
    }
}

export class Projectile extends Body {
    constructor(x, y) {
        super(x, y, 20, 4, '#ffffff'); // Dense, small
        this.life = 0;
    }
}
