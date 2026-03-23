import { describe, it, expect } from 'vitest';
import { Entity, Ship, Asteroid, Bullet, Particle } from '../Entities.js';

describe('Entity', () => {
    it('constructs with position, radius, and color', () => {
        const e = new Entity(10, 20, 5, '#fff');
        expect(e.pos.x).toBe(10);
        expect(e.pos.y).toBe(20);
        expect(e.radius).toBe(5);
        expect(e.color).toBe('#fff');
        expect(e.toBeRemoved).toBe(false);
    });

    it('initializes velocity to zero', () => {
        const e = new Entity(0, 0, 1, '#fff');
        expect(e.vel.x).toBe(0);
        expect(e.vel.y).toBe(0);
    });

    it('update moves entity by velocity * dt', () => {
        const e = new Entity(0, 0, 1, '#fff');
        e.vel.x = 100;
        e.vel.y = 50;
        e.update(0.5);
        expect(e.pos.x).toBeCloseTo(50);
        expect(e.pos.y).toBeCloseTo(25);
    });

    it('wrap teleports entity across screen edges', () => {
        const e = new Entity(-20, -20, 10, '#fff');
        e.wrap(800, 600);
        expect(e.pos.x).toBe(810);
        expect(e.pos.y).toBe(610);
    });

    it('wrap works for right/bottom edges', () => {
        const e = new Entity(820, 620, 10, '#fff');
        e.wrap(800, 600);
        expect(e.pos.x).toBe(-10);
        expect(e.pos.y).toBe(-10);
    });
});

describe('Ship', () => {
    it('creates ship at given position', () => {
        const ship = new Ship(400, 300);
        expect(ship.pos.x).toBe(400);
        expect(ship.pos.y).toBe(300);
        expect(ship.radius).toBe(15);
        expect(ship.color).toBe('#0ff');
    });

    it('points upward initially', () => {
        const ship = new Ship(0, 0);
        expect(ship.rotation).toBeCloseTo(-Math.PI / 2);
    });
});

describe('Asteroid', () => {
    it('creates asteroid with size-based radius', () => {
        const large = new Asteroid(0, 0, 3);
        expect(large.radius).toBe(45);
        expect(large.size).toBe(3);

        const medium = new Asteroid(0, 0, 2);
        expect(medium.radius).toBe(30);

        const small = new Asteroid(0, 0, 1);
        expect(small.radius).toBe(15);
    });

    it('has random velocity', () => {
        const a = new Asteroid(0, 0, 2);
        const speed = Math.sqrt(a.vel.x ** 2 + a.vel.y ** 2);
        expect(speed).toBeGreaterThan(0);
    });

    it('smaller asteroids are faster', () => {
        // Speed formula: (4 - size) * 30
        // Size 1: 90, Size 2: 60, Size 3: 30
        const small = new Asteroid(0, 0, 1);
        const large = new Asteroid(0, 0, 3);
        const smallSpeed = Math.sqrt(small.vel.x ** 2 + small.vel.y ** 2);
        const largeSpeed = Math.sqrt(large.vel.x ** 2 + large.vel.y ** 2);
        expect(smallSpeed).toBeCloseTo(90);
        expect(largeSpeed).toBeCloseTo(30);
    });

    it('generates jagged shape points', () => {
        const a = new Asteroid(0, 0, 2);
        expect(a.points.length).toBeGreaterThan(0);
        // segments = 8 + size * 2 = 12 for size 2
        expect(a.points.length).toBe(12);
    });
});

describe('Bullet', () => {
    it('creates bullet traveling in given direction', () => {
        const b = new Bullet(100, 200, 0); // pointing right
        expect(b.pos.x).toBe(100);
        expect(b.pos.y).toBe(200);
        expect(b.vel.x).toBeCloseTo(400);
        expect(b.vel.y).toBeCloseTo(0);
    });

    it('has limited lifetime', () => {
        const b = new Bullet(0, 0, 0);
        expect(b.life).toBe(1.5);
    });

    it('marks for removal after life expires', () => {
        const b = new Bullet(0, 0, 0);
        b.update(1.0);
        expect(b.toBeRemoved).toBe(false);
        b.update(0.6);
        expect(b.toBeRemoved).toBe(true);
    });
});

describe('Particle', () => {
    it('marks for removal after life expires', () => {
        const p = new Particle(0, 0, '#f0f');
        // Life is random but 0.5-1.0 seconds
        expect(p.life).toBeGreaterThan(0);
        expect(p.life).toBeLessThanOrEqual(1.0);

        // Advance past max life
        p.update(2.0);
        expect(p.toBeRemoved).toBe(true);
    });
});
