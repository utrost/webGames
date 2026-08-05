import { describe, it, expect, vi } from 'vitest';
import { Physics } from '../Physics.js';
import { Body, Sun, Planet, Comet, Projectile } from '../Entities.js';
import { Orbit } from '../index.js';
import { CONFIG } from '../config.js';

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

describe('Orbit cloning and lifecycle contracts', () => {
    function withBrowserStubs(run) {
        const originalWindow = globalThis.window;
        const originalDocument = globalThis.document;
        const originalLocalStorage = globalThis.localStorage;
        const container = { appendChild: vi.fn(), clientWidth: 800, clientHeight: 600 };
        globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn(), innerWidth: 800, innerHeight: 600 };
        globalThis.document = {
            createElement: vi.fn(() => ({
                getContext: vi.fn(() => new Proxy({}, { get: () => vi.fn() })),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                remove: vi.fn(),
                style: {},
            })),
        };
        globalThis.localStorage = { getItem: vi.fn(() => '0'), setItem: vi.fn() };
        try {
            return run(container);
        } finally {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
            globalThis.localStorage = originalLocalStorage;
        }
    }

    it('clones subclass-specific simulation state', () => {
        const sun = new Sun(1, 2);
        sun.hp = 42;
        const projectile = new Projectile(3, 4);
        projectile.life = 5;
        projectile.toBeRemoved = true;
        projectile.setVelocity({ x: 7, y: 8, clone: () => ({ x: 7, y: 8 }) });

        const sunCopy = sun.clone();
        const projectileCopy = projectile.clone();

        expect(sunCopy).toBeInstanceOf(Sun);
        expect(sunCopy.hp).toBe(42);
        expect(projectileCopy).toBeInstanceOf(Projectile);
        expect(projectileCopy.life).toBe(5);
        expect(projectileCopy.toBeRemoved).toBe(true);
        expect(projectileCopy.vel).toEqual({ x: 7, y: 8 });
    });

    it('uses configured launch scale for drag launch velocity', () => withBrowserStubs((container) => {
        const game = new Orbit(container, vi.fn());
        game.setupInput();
        game.launchProjectile = vi.fn();
        game.isDragging = true;
        game.dragStart = {
            x: 100,
            y: 100,
            clone: () => ({ subtract: () => ({ scale: (factor) => ({ x: 40 * factor, y: 20 * factor }) }) }),
        };
        game.dragCurrent = { x: 60, y: 80 };

        game.handleUp();

        expect(game.launchProjectile).toHaveBeenCalledWith(game.dragStart, { x: 40 * CONFIG.LAUNCH_SCALE, y: 20 * CONFIG.LAUNCH_SCALE });
    }));

    it('invokes game-over callback once when the sun fails', () => withBrowserStubs((container) => {
        const onGameOver = vi.fn();
        const game = new Orbit(container, onGameOver);
        game.resetGameState();
        game.physics.update = vi.fn();
        game.sun.hp = 0;

        game.update(0.016);
        game.update(0.016);

        expect(game.gameOver).toBe(true);
        expect(onGameOver).toHaveBeenCalledTimes(1);
    }));
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
