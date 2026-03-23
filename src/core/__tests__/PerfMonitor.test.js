import { describe, it, expect } from 'vitest';
import { PerfMonitor } from '../PerfMonitor.js';

describe('PerfMonitor', () => {
    it('initializes with zero fps and not visible', () => {
        const pm = new PerfMonitor();
        expect(pm.fps).toBe(0);
        expect(pm.visible).toBe(false);
    });

    it('toggle switches visibility', () => {
        const pm = new PerfMonitor();
        pm.toggle();
        expect(pm.visible).toBe(true);
        pm.toggle();
        expect(pm.visible).toBe(false);
    });

    it('tick records frames', () => {
        const pm = new PerfMonitor();
        pm.tick(0);
        pm.tick(16);
        pm.tick(32);
        expect(pm.frames.length).toBe(3);
    });

    it('tick prunes frames older than 1 second', () => {
        const pm = new PerfMonitor();
        pm.tick(0);
        pm.tick(500);
        pm.tick(1001);
        // Frame at 0 should be pruned (1001 - 1000 = 1)
        expect(pm.frames).not.toContain(0);
    });

    it('updates fps every 500ms', () => {
        const pm = new PerfMonitor();
        // Simulate 60 frames over ~1 second
        for (let i = 0; i < 60; i++) {
            pm.tick(i * 16.67);
        }
        // After 500ms worth of ticks, fps should be updated
        expect(pm.fps).toBeGreaterThan(0);
    });

    it('does not render when not visible', () => {
        const pm = new PerfMonitor();
        const ctx = { save: () => {}, restore: () => {}, fillRect: () => {}, fillText: () => {} };
        // Should not throw
        pm.render(ctx);
    });
});
