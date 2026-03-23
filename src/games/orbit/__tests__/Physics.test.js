import { describe, it, expect } from 'vitest';
import { Physics } from '../Physics.js';
import { Body, Sun, Planet, Comet, Projectile } from '../Entities.js';

describe('Body', () => {
    it('constructs with position, mass, radius, color', () => {
        const b = new Body(10, 20, 100, 5, '#fff');
        expect(b.pos.x).toBe(10);
        expect(b.pos.y).toBe(20);
        expect(b.mass).toBe(100);
        expect(b.radius).toBe(5);
        expect(b.color).toBe('#fff');
        expect(b.isStatic).toBe(false);
        expect(b.toBeRemoved).toBe(false);
    });

    it('initializes oldPos to same as pos', () => {
        const b = new Body(10, 20, 100, 5, '#fff');
        expect(b.oldPos.x).toBe(10);
        expect(b.oldPos.y).toBe(20);
    });

    it('clone creates independent copy', () => {
        const b = new Body(10, 20, 100, 5, '#fff');
        b.isStatic = true;
        const c = b.clone();
        expect(c.pos.x).toBe(10);
        expect(c.mass).toBe(100);
        expect(c.isStatic).toBe(true);
        c.pos.x = 999;
        expect(b.pos.x).toBe(10);
    });

    it('setVelocity stores explicit velocity', () => {
        const b = new Body(0, 0, 1, 1, '#fff');
        const v = { x: 10, y: 20, clone: () => ({ x: 10, y: 20, scale: () => ({ x: 10, y: 20 }) }) };
        b.setVelocity(v);
        expect(b.vel).toBe(v);
    });
});

describe('Sun', () => {
    it('is static with high mass', () => {
        const sun = new Sun(400, 300);
        expect(sun.isStatic).toBe(true);
        expect(sun.mass).toBe(10000);
        expect(sun.hp).toBe(100);
    });
});

describe('Planet', () => {
    it('has correct mass and radius', () => {
        const p = new Planet(100, 200);
        expect(p.mass).toBe(10);
        expect(p.radius).toBe(8);
    });
});

describe('Comet', () => {
    it('has correct properties', () => {
        const c = new Comet(100, 200);
        expect(c.mass).toBe(5);
        expect(c.radius).toBe(5);
        expect(c.color).toBe('#e74c3c');
    });
});

describe('Projectile', () => {
    it('has correct properties', () => {
        const p = new Projectile(50, 60);
        expect(p.mass).toBe(20);
        expect(p.radius).toBe(4);
        expect(p.life).toBe(0);
    });
});

describe('Physics', () => {
    it('constructs with default gravitational constant', () => {
        const phys = new Physics();
        expect(phys.G).toBe(0.5);
    });

    it('applyGravity resets acceleration', () => {
        const phys = new Physics();
        const b1 = new Body(0, 0, 100, 5, '#fff');
        b1.acc.x = 999;
        phys.applyGravity([b1]);
        expect(b1.acc.x).toBe(0);
        expect(b1.acc.y).toBe(0);
    });

    it('applyGravity creates attraction between bodies', () => {
        const phys = new Physics();
        const b1 = new Body(0, 0, 100, 5, '#fff');
        const b2 = new Body(100, 0, 100, 5, '#fff');
        phys.applyGravity([b1, b2]);
        // b1 should be attracted toward b2 (positive x direction)
        expect(b1.acc.x).toBeGreaterThan(0);
        // b2 should be attracted toward b1 (negative x direction)
        expect(b2.acc.x).toBeLessThan(0);
    });

    it('static bodies are not accelerated', () => {
        const phys = new Physics();
        const sun = new Sun(0, 0);
        const planet = new Body(100, 0, 10, 5, '#fff');
        phys.applyGravity([sun, planet]);
        expect(sun.acc.x).toBe(0);
        expect(sun.acc.y).toBe(0);
        expect(planet.acc.x).not.toBe(0);
    });

    it('handleCollision marks comet and projectile for removal', () => {
        const phys = new Physics();
        const comet = new Comet(0, 0);
        const proj = new Projectile(0, 0);
        phys.handleCollision(comet, proj);
        expect(comet.toBeRemoved).toBe(true);
        expect(proj.toBeRemoved).toBe(true);
    });

    it('handleCollision damages sun on comet hit', () => {
        const phys = new Physics();
        const sun = new Sun(0, 0);
        const comet = new Comet(0, 0);
        phys.handleCollision(sun, comet);
        expect(comet.toBeRemoved).toBe(true);
        expect(sun.hp).toBe(90);
    });

    it('resolveCollisions detects overlapping bodies', () => {
        const phys = new Physics();
        const comet = new Comet(0, 0);
        const proj = new Projectile(1, 0); // within combined radii (5 + 4 = 9)
        phys.resolveCollisions([comet, proj]);
        expect(comet.toBeRemoved).toBe(true);
        expect(proj.toBeRemoved).toBe(true);
    });

    it('resolveCollisions ignores non-overlapping bodies', () => {
        const phys = new Physics();
        const comet = new Comet(0, 0);
        const proj = new Projectile(100, 0);
        phys.resolveCollisions([comet, proj]);
        expect(comet.toBeRemoved).toBe(false);
        expect(proj.toBeRemoved).toBe(false);
    });
});
