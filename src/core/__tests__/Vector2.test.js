import { describe, it, expect } from 'vitest';
import { Vector2 } from '../Vector2.js';

describe('Vector2', () => {
    it('constructs with default values', () => {
        const v = new Vector2();
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
    });

    it('constructs with given values', () => {
        const v = new Vector2(3, 4);
        expect(v.x).toBe(3);
        expect(v.y).toBe(4);
    });

    it('add mutates and returns this', () => {
        const a = new Vector2(1, 2);
        const b = new Vector2(3, 4);
        const result = a.add(b);
        expect(result).toBe(a);
        expect(a.x).toBe(4);
        expect(a.y).toBe(6);
    });

    it('subtract mutates and returns this', () => {
        const a = new Vector2(5, 7);
        const result = a.subtract(new Vector2(2, 3));
        expect(result).toBe(a);
        expect(a.x).toBe(3);
        expect(a.y).toBe(4);
    });

    it('scale mutates and returns this', () => {
        const v = new Vector2(3, 4);
        const result = v.scale(2);
        expect(result).toBe(v);
        expect(v.x).toBe(6);
        expect(v.y).toBe(8);
    });

    it('clone creates independent copy', () => {
        const a = new Vector2(1, 2);
        const b = a.clone();
        b.x = 99;
        expect(a.x).toBe(1);
        expect(b.x).toBe(99);
    });

    it('copy overwrites values', () => {
        const a = new Vector2(1, 2);
        const b = new Vector2(5, 6);
        a.copy(b);
        expect(a.x).toBe(5);
        expect(a.y).toBe(6);
    });

    it('mag returns correct magnitude', () => {
        expect(new Vector2(3, 4).mag()).toBe(5);
        expect(new Vector2(0, 0).mag()).toBe(0);
    });

    it('magSq returns squared magnitude', () => {
        expect(new Vector2(3, 4).magSq()).toBe(25);
    });

    it('normalize produces unit vector', () => {
        const v = new Vector2(3, 4).normalize();
        expect(v.mag()).toBeCloseTo(1);
    });

    it('normalize handles zero vector', () => {
        const v = new Vector2(0, 0).normalize();
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
    });

    it('dist computes distance between two vectors', () => {
        const a = new Vector2(0, 0);
        const b = new Vector2(3, 4);
        expect(a.dist(b)).toBe(5);
    });

    it('distSq computes squared distance', () => {
        const a = new Vector2(1, 1);
        const b = new Vector2(4, 5);
        expect(a.distSq(b)).toBe(25);
    });

    it('dot computes dot product', () => {
        const a = new Vector2(1, 0);
        const b = new Vector2(0, 1);
        expect(a.dot(b)).toBe(0);
        expect(new Vector2(2, 3).dot(new Vector2(4, 5))).toBe(23);
    });

    it('angle returns correct angle', () => {
        expect(new Vector2(1, 0).angle()).toBeCloseTo(0);
        expect(new Vector2(0, 1).angle()).toBeCloseTo(Math.PI / 2);
        expect(new Vector2(-1, 0).angle()).toBeCloseTo(Math.PI);
    });

    it('rotate rotates vector correctly', () => {
        const v = new Vector2(1, 0).rotate(Math.PI / 2);
        expect(v.x).toBeCloseTo(0);
        expect(v.y).toBeCloseTo(1);
    });

    it('supports method chaining', () => {
        const v = new Vector2(1, 0)
            .scale(5)
            .add(new Vector2(0, 3))
            .normalize();
        expect(v.mag()).toBeCloseTo(1);
    });
});
