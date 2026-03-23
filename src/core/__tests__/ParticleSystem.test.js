import { describe, it, expect } from 'vitest';
import { Particle, ParticleSystem } from '../ParticleSystem.js';

describe('Particle', () => {
    it('constructs with position', () => {
        const p = new Particle(10, 20);
        expect(p.x).toBe(10);
        expect(p.y).toBe(20);
    });

    it('uses default options when none provided', () => {
        const p = new Particle(0, 0);
        expect(p.life).toBeGreaterThan(0);
        expect(p.maxLife).toBe(p.life);
        expect(p.color).toBe('#fff');
        expect(p.size).toBeGreaterThan(0);
    });

    it('accepts custom options', () => {
        const p = new Particle(0, 0, {
            angle: 0,
            speed: 100,
            life: 2.0,
            color: '#f00',
            size: 5
        });
        expect(p.vx).toBeCloseTo(100);
        expect(p.vy).toBeCloseTo(0);
        expect(p.life).toBe(2.0);
        expect(p.color).toBe('#f00');
        expect(p.size).toBe(5);
    });

    it('calculates velocity from angle and speed', () => {
        const p = new Particle(0, 0, { angle: Math.PI / 2, speed: 50 });
        expect(p.vx).toBeCloseTo(0);
        expect(p.vy).toBeCloseTo(50);
    });
});

describe('ParticleSystem', () => {
    it('starts with no particles', () => {
        const ps = new ParticleSystem();
        expect(ps.count).toBe(0);
        expect(ps.particles).toEqual([]);
    });

    it('emits particles', () => {
        const ps = new ParticleSystem();
        ps.emit(100, 200, 5);
        expect(ps.count).toBe(5);
    });

    it('emits particles at specified position', () => {
        const ps = new ParticleSystem();
        ps.emit(50, 75, 1, { angle: 0, speed: 0 });
        expect(ps.particles[0].x).toBe(50);
        expect(ps.particles[0].y).toBe(75);
    });

    it('passes options to emitted particles', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 1, { color: '#0f0', size: 10, life: 3.0 });
        expect(ps.particles[0].color).toBe('#0f0');
        expect(ps.particles[0].size).toBe(10);
        expect(ps.particles[0].life).toBe(3.0);
    });

    it('update moves particles by velocity * dt', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 1, { angle: 0, speed: 100, life: 5.0 });
        ps.update(0.5);
        expect(ps.particles[0].x).toBeCloseTo(50);
    });

    it('update decreases particle life', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 1, { life: 1.0 });
        ps.update(0.3);
        expect(ps.particles[0].life).toBeCloseTo(0.7);
    });

    it('removes particles when life reaches zero', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 1, { life: 0.5 });
        ps.update(0.6);
        expect(ps.count).toBe(0);
    });

    it('clear removes all particles', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 10);
        expect(ps.count).toBe(10);
        ps.clear();
        expect(ps.count).toBe(0);
    });

    it('handles multiple emit calls', () => {
        const ps = new ParticleSystem();
        ps.emit(0, 0, 3);
        ps.emit(10, 10, 2);
        expect(ps.count).toBe(5);
    });
});
