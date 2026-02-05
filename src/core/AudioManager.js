export class AudioManager {
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
        source.connect(this.context.destination);
        source.start(0);
    }

    playTone(frequency, type = 'sine', duration = 0.1) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.context.currentTime);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start();
        osc.stop(this.context.currentTime + duration);
    }
}
