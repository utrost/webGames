/** Web Audio API manager for tone synthesis and sound playback. */
export class AudioManager {
    static masterVolume = 1.0;

    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
    }

    async loadSound(name, url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        this.sounds[name] = await this.context.decodeAudioData(buffer);
    }

    play(name) {
        if (!this.sounds[name]) return;
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(AudioManager.masterVolume, this.context.currentTime);
        source.connect(gain);
        gain.connect(this.context.destination);
        source.start(0);
    }

    /** @param {number} frequency @param {OscillatorType} [type='sine'] @param {number} [duration=0.1] */
    playTone(frequency, type = 'sine', duration = 0.1) {
        if (AudioManager.masterVolume === 0) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.context.currentTime);

        const vol = 0.1 * AudioManager.masterVolume;
        gain.gain.setValueAtTime(vol, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start();
        osc.stop(this.context.currentTime + duration);
    }
}
