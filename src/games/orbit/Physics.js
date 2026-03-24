import { Vector2 } from '../../core/Vector2.js';

export class Physics {
    constructor() {
        this.G = 0.5; // Gravitational Constant
        this.damping = 1.0; // In space, no drag
    }

    update(bodies, dt) {
        this.applyGravity(bodies);
        this.integrate(bodies, dt);
        this.resolveCollisions(bodies);
    }

    applyGravity(bodies) {
        // Reset forces/acceleration
        bodies.forEach(b => b.acc = new Vector2(0, 0));

        // N-Body O(N^2)
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const a = bodies[i];
                const b = bodies[j];

                const diff = b.pos.clone().subtract(a.pos);
                let distSq = diff.magSq();

                // Clamp distance to avoid divide-by-zero or extreme slingsshots
                distSq = Math.max(distSq, 100);

                const dist = Math.sqrt(distSq);
                const forceMag = (this.G * a.mass * b.mass) / distSq;

                const force = diff.normalize().scale(forceMag);

                if (!a.isStatic) a.acc.add(force.clone().scale(1 / a.mass));
                if (!b.isStatic) b.acc.subtract(force.clone().scale(1 / b.mass));
            }
        }
    }

    integrate(bodies, dt) {
        bodies.forEach(b => {
            if (b.isStatic) return;

            // Initialize Verlet if vel is set manually
            if (b.vel) {
                b.oldPos = b.pos.clone().subtract(b.vel.clone().scale(dt));
                b.vel = null; // Consume explicit velocity
            }

            const vel = b.pos.clone().subtract(b.oldPos).scale(this.damping);
            b.oldPos = b.pos.clone();

            // Verlet: pos = pos + vel + acc * dt * dt
            const delta = vel.add(b.acc.scale(dt * dt));
            b.pos.add(delta);
        });
    }

    resolveCollisions(bodies) {
        // Iterate backwards to allow safe removal
        // Note: Actual removal happens in GameLoop, here we mark or set flags
        // For this simple engine, we can check n^2 and mark `toBeRemoved`

        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const a = bodies[i];
                const b = bodies[j];

                if (a.toBeRemoved || b.toBeRemoved) continue;

                const distSq = a.pos.distSq(b.pos);
                const radii = a.radius + b.radius;

                if (distSq < radii * radii) {
                    this.handleCollision(a, b);
                }
            }
        }
    }

    handleCollision(a, b) {
        const typeA = a.type;
        const typeB = b.type;

        // Helper to identify specific pair types
        const is = (t1, t2) => (typeA === t1 && typeB === t2) || (typeA === t2 && typeB === t1);

        // 1. Comet vs Projectile/Planet -> Both Die
        if (is('Comet', 'Projectile') || is('Comet', 'Planet')) {
            a.toBeRemoved = true;
            b.toBeRemoved = true;
            // Return validation? No, logic handled in checking loop
            // Actually, we should ideally trigger an event (score, particles)
            // But physics engine should remain pure-ish.
            // We can attach a `onCollision` callback to bodies?
            if (a.onCollision) a.onCollision(b);
            if (b.onCollision) b.onCollision(a);
        }

        // 2. Comet vs Sun -> Comet dies, Sun takes damage
        else if (is('Sun', 'Comet')) {
            const comet = typeA === 'Comet' ? a : b;
            const sun = typeA === 'Sun' ? a : b;

            comet.toBeRemoved = true;
            sun.hp -= 10;
            if (sun.onDamage) sun.onDamage(10);
        }
    }

    predict(bodies, subject, velocity, steps, dt) {
        // 1. Deep clone the world state
        const simBodies = bodies.map(b => b.clone());

        // 2. Add the hypothetical projectile
        // We need to create it in the sim world
        // Assuming subject is a template or new instance
        const simSubject = subject.clone();
        simSubject.pos = subject.pos.clone(); // Ensure position matches start
        simSubject.setVelocity(velocity);
        simBodies.push(simSubject);

        const trajectory = [];

        // 3. Fast-forward simulation
        for (let i = 0; i < steps; i++) {
            this.update(simBodies, dt);

            // Record position every N steps to save perf/memory? 
            // Or every step for smoothness. Canvas handles paths well.
            trajectory.push({ x: simSubject.pos.x, y: simSubject.pos.y });
        }

        return trajectory;
    }
}
