/** Web Audio API manager for tone synthesis and sound playback. */
export class AudioManager {
    static masterVolume = 1.0;

    constructor() {
        this.context = null;
        this.sounds = {};
    }

    /** Lazily initialise AudioContext and resume it (handles browser autoplay policy). */
    _ensureContext() {
        if (!this.context) {
            const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
            this.context = new AC();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.context;
    }

    /** @param {string} name @param {string} url */
    async loadSound(name, url) {
        try {
            const ctx = this._ensureContext();
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const buffer = await response.arrayBuffer();
            this.sounds[name] = await ctx.decodeAudioData(buffer);
        } catch (err) {
            console.warn(`AudioManager: failed to load "${name}" from ${url}:`, err);
        }
    }

    /** @param {string} name */
    play(name) {
        if (AudioManager.masterVolume === 0) return;
        if (!this.sounds[name]) return;
        const ctx = this._ensureContext();

        const source = ctx.createBufferSource();
        source.buffer = this.sounds[name];

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(AudioManager.masterVolume, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
    }

    /** @param {number} frequency @param {OscillatorType} [type='sine'] @param {number} [duration=0.1] */
    playTone(frequency, type = 'sine', duration = 0.1) {
        if (AudioManager.masterVolume === 0) return;
        const ctx = this._ensureContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        const vol = 0.1 * AudioManager.masterVolume;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }
}
