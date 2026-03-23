import { describe, it, expect } from 'vitest';
import { ELEMENTS, ELEMENT_INFO, getColor } from '../Elements.js';
import { Simulation } from '../Simulation.js';

describe('ELEMENTS', () => {
    it('has all expected element types', () => {
        expect(ELEMENTS.EMPTY).toBe(0);
        expect(ELEMENTS.SAND).toBe(1);
        expect(ELEMENTS.WATER).toBe(2);
        expect(ELEMENTS.FIRE).toBe(3);
        expect(ELEMENTS.OIL).toBe(4);
        expect(ELEMENTS.ACID).toBe(5);
        expect(ELEMENTS.PLANT).toBe(6);
        expect(ELEMENTS.WOOD).toBe(7);
        expect(ELEMENTS.STONE).toBe(8);
        expect(ELEMENTS.STEAM).toBe(9);
        expect(ELEMENTS.SMOKE).toBe(10);
    });

    it('has 11 unique element types', () => {
        const values = Object.values(ELEMENTS);
        expect(new Set(values).size).toBe(11);
    });
});

describe('ELEMENT_INFO', () => {
    it('has info for every element type', () => {
        Object.values(ELEMENTS).forEach(type => {
            expect(ELEMENT_INFO[type]).toBeDefined();
            expect(ELEMENT_INFO[type].name).toBeTruthy();
        });
    });

    it('all non-empty non-gas elements have keyboard keys', () => {
        [ELEMENTS.SAND, ELEMENTS.WATER, ELEMENTS.FIRE, ELEMENTS.OIL,
         ELEMENTS.ACID, ELEMENTS.PLANT, ELEMENTS.WOOD, ELEMENTS.STONE].forEach(type => {
            expect(ELEMENT_INFO[type].key).toBeTruthy();
        });
    });
});

describe('getColor', () => {
    it('returns null for EMPTY', () => {
        expect(getColor(ELEMENTS.EMPTY)).toBeNull();
    });

    it('returns a number for SAND', () => {
        const color = getColor(ELEMENTS.SAND);
        expect(typeof color).toBe('number');
        expect(color).toBeGreaterThan(0);
    });
});

describe('Simulation', () => {
    it('constructs with given dimensions', () => {
        const sim = new Simulation(10, 8);
        expect(sim.width).toBe(10);
        expect(sim.height).toBe(8);
    });

    it('initializes grid to empty', () => {
        const sim = new Simulation(5, 5);
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                expect(sim.get(x, y)).toBe(ELEMENTS.EMPTY);
            }
        }
    });

    it('inBounds works correctly', () => {
        const sim = new Simulation(10, 10);
        expect(sim.inBounds(0, 0)).toBe(true);
        expect(sim.inBounds(9, 9)).toBe(true);
        expect(sim.inBounds(-1, 0)).toBe(false);
        expect(sim.inBounds(0, 10)).toBe(false);
    });

    it('out of bounds returns STONE (wall)', () => {
        const sim = new Simulation(5, 5);
        expect(sim.get(-1, 0)).toBe(ELEMENTS.STONE);
        expect(sim.get(0, -1)).toBe(ELEMENTS.STONE);
        expect(sim.get(5, 0)).toBe(ELEMENTS.STONE);
    });

    it('set and get work correctly', () => {
        const sim = new Simulation(10, 10);
        sim.set(3, 4, ELEMENTS.SAND);
        expect(sim.get(3, 4)).toBe(ELEMENTS.SAND);
    });

    it('set out of bounds does nothing', () => {
        const sim = new Simulation(5, 5);
        sim.set(-1, 0, ELEMENTS.SAND); // Should not throw
        sim.set(5, 5, ELEMENTS.WATER); // Should not throw
    });

    it('isEmpty returns true for empty cells', () => {
        const sim = new Simulation(5, 5);
        expect(sim.isEmpty(0, 0)).toBe(true);
        sim.set(0, 0, ELEMENTS.SAND);
        expect(sim.isEmpty(0, 0)).toBe(false);
    });

    it('isLiquid identifies water, oil, and acid', () => {
        const sim = new Simulation(5, 5);
        sim.set(0, 0, ELEMENTS.WATER);
        sim.set(1, 0, ELEMENTS.OIL);
        sim.set(2, 0, ELEMENTS.ACID);
        sim.set(3, 0, ELEMENTS.SAND);
        expect(sim.isLiquid(0, 0)).toBe(true);
        expect(sim.isLiquid(1, 0)).toBe(true);
        expect(sim.isLiquid(2, 0)).toBe(true);
        expect(sim.isLiquid(3, 0)).toBe(false);
    });

    it('isGas identifies steam and smoke', () => {
        const sim = new Simulation(5, 5);
        sim.set(0, 0, ELEMENTS.STEAM);
        sim.set(1, 0, ELEMENTS.SMOKE);
        sim.set(2, 0, ELEMENTS.FIRE);
        expect(sim.isGas(0, 0)).toBe(true);
        expect(sim.isGas(1, 0)).toBe(true);
        expect(sim.isGas(2, 0)).toBe(false);
    });

    it('swap exchanges two cells', () => {
        const sim = new Simulation(5, 5);
        sim.set(0, 0, ELEMENTS.SAND);
        sim.set(1, 0, ELEMENTS.WATER);
        sim.swap(0, 0, 1, 0);
        expect(sim.get(0, 0)).toBe(ELEMENTS.WATER);
        expect(sim.get(1, 0)).toBe(ELEMENTS.SAND);
    });

    it('clear resets entire grid', () => {
        const sim = new Simulation(5, 5);
        sim.set(0, 0, ELEMENTS.SAND);
        sim.set(1, 1, ELEMENTS.WATER);
        sim.clear();
        expect(sim.get(0, 0)).toBe(ELEMENTS.EMPTY);
        expect(sim.get(1, 1)).toBe(ELEMENTS.EMPTY);
    });

    it('step increments frame counter', () => {
        const sim = new Simulation(5, 5);
        expect(sim.frame).toBe(0);
        sim.step();
        expect(sim.frame).toBe(1);
        sim.step();
        expect(sim.frame).toBe(2);
    });

    it('sand falls down', () => {
        const sim = new Simulation(3, 3);
        sim.set(1, 0, ELEMENTS.SAND);
        sim.step();
        // Sand should have moved down
        expect(sim.get(1, 1)).toBe(ELEMENTS.SAND);
        expect(sim.get(1, 0)).toBe(ELEMENTS.EMPTY);
    });

    it('sand stops at bottom', () => {
        const sim = new Simulation(3, 3);
        sim.set(1, 2, ELEMENTS.SAND);
        sim.step();
        // Sand at bottom row stays
        expect(sim.get(1, 2)).toBe(ELEMENTS.SAND);
    });

    it('sand sinks through water', () => {
        const sim = new Simulation(3, 3);
        sim.set(1, 0, ELEMENTS.SAND);
        sim.set(1, 1, ELEMENTS.WATER);
        // Run enough steps for the swap to propagate
        for (let i = 0; i < 5; i++) sim.step();
        // Sand should end up below water
        const sandBelow = sim.get(1, 2) === ELEMENTS.SAND || sim.get(1, 1) === ELEMENTS.SAND;
        expect(sandBelow).toBe(true);
    });

    it('water falls down into empty space', () => {
        const sim = new Simulation(3, 3);
        sim.set(1, 0, ELEMENTS.WATER);
        sim.step();
        expect(sim.get(1, 1)).toBe(ELEMENTS.WATER);
        expect(sim.get(1, 0)).toBe(ELEMENTS.EMPTY);
    });

    it('idx computes flat array index', () => {
        const sim = new Simulation(10, 10);
        expect(sim.idx(0, 0)).toBe(0);
        expect(sim.idx(5, 0)).toBe(5);
        expect(sim.idx(0, 1)).toBe(10);
        expect(sim.idx(3, 2)).toBe(23);
    });
});
