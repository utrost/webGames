import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManager } from '../AudioManager.js';

// Minimal Web Audio API mock
function createMockContext() {
    return {
        state: 'running',
        currentTime: 0,
        resume: vi.fn().mockResolvedValue(undefined),
        destination: {},
        decodeAudioData: vi.fn().mockResolvedValue('decoded-buffer'),
        createBufferSource: vi.fn(() => ({
            connect: vi.fn(),
            start: vi.fn(),
            buffer: null,
        })),
        createGain: vi.fn(() => ({
            connect: vi.fn(),
            gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        })),
        createOscillator: vi.fn(() => ({
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            type: 'sine',
            frequency: { setValueAtTime: vi.fn() },
        })),
    };
}

let mockCtx;

// Use function (not arrow) so it can be called with `new`
vi.stubGlobal(
    'AudioContext',
    function MockAudioContext() {
        mockCtx = createMockContext();
        Object.assign(this, mockCtx);
        return this;
    },
);

vi.stubGlobal(
    'fetch',
    vi.fn(() =>
        Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        }),
    ),
);

describe('AudioManager', () => {
    let am;

    beforeEach(() => {
        AudioManager.masterVolume = 1.0;
        mockCtx = null;
        am = new AudioManager();
    });

    it('lazily creates AudioContext on first use', () => {
        expect(am.context).toBeNull();
        am._ensureContext();
        expect(am.context).not.toBeNull();
    });

    it('resumes a suspended AudioContext', () => {
        const ctx = am._ensureContext();
        ctx.state = 'suspended';
        am._ensureContext();
        expect(mockCtx.resume).toHaveBeenCalled();
    });

    it('loads a sound buffer', async () => {
        await am.loadSound('click', '/sounds/click.wav');
        expect(am.sounds.click).toBe('decoded-buffer');
    });

    it('handles load errors gracefully', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 });
        await am.loadSound('bad', '/nope.wav');
        expect(am.sounds.bad).toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('plays a loaded sound', async () => {
        await am.loadSound('click', '/sounds/click.wav');
        am.play('click');
        expect(mockCtx.createBufferSource).toHaveBeenCalled();
        expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it('does nothing when playing an unknown sound', () => {
        am.play('nope');
        expect(am.context).toBeNull();
    });

    it('does not play when masterVolume is 0', async () => {
        await am.loadSound('click', '/sounds/click.wav');
        const callsBefore = mockCtx.createBufferSource.mock.calls.length;
        AudioManager.masterVolume = 0;
        am.play('click');
        expect(mockCtx.createBufferSource.mock.calls.length).toBe(callsBefore);
    });

    it('plays a tone with default parameters', () => {
        am.playTone(440);
        expect(mockCtx.createOscillator).toHaveBeenCalled();
        expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it('does not play a tone when muted', () => {
        AudioManager.masterVolume = 0;
        am.playTone(440);
        expect(am.context).toBeNull();
    });

    it('has masterVolume as a static property', () => {
        expect(AudioManager.masterVolume).toBe(1.0);
        AudioManager.masterVolume = 0.5;
        expect(AudioManager.masterVolume).toBe(0.5);
    });
});
