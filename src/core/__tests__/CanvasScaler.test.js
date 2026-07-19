import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasScaler } from '../CanvasScaler.js';

function installWindowStub(overrides = {}) {
    globalThis.window = {
        innerHeight: 800,
        innerWidth: 400,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        ...overrides,
    };
}

function makeCanvas(parentWidth = 360, parentHeight = 640) {
    const parent = { clientWidth: parentWidth, clientHeight: parentHeight };
    const canvas = { parentElement: parent, style: {} };
    return { canvas, parent };
}

describe('CanvasScaler responsive behavior', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        globalThis.window = undefined;
    });

    it('fits a landscape canvas inside a narrow mobile viewport without horizontal overflow', () => {
        installWindowStub();
        const { canvas } = makeCanvas(360, 640);
        const scaler = new CanvasScaler(canvas, 800, 600);

        expect(canvas.style.width).toBe('360px');
        expect(canvas.style.height).toBe('270px');

        scaler.destroy();
    });

    it('uses visualViewport height when browser chrome reduces available mobile space', () => {
        installWindowStub({ visualViewport: { width: 390, height: 520 } });
        const { canvas } = makeCanvas(390, 0);
        const scaler = new CanvasScaler(canvas, 800, 600);

        expect(canvas.style.width).toBe('390px');
        expect(canvas.style.height).toBe('292.5px');

        scaler.destroy();
    });

    it('accounts for a configurable edge gutter on very small screens', () => {
        installWindowStub();
        const { canvas } = makeCanvas(320, 600);
        const scaler = new CanvasScaler(canvas, 800, 600, { gutter: 16 });

        expect(canvas.style.width).toBe('288px');
        expect(canvas.style.height).toBe('216px');

        scaler.destroy();
    });
});
