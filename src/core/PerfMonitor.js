export class PerfMonitor {
    constructor() {
        this.frames = [];
        this.fps = 0;
        this.visible = false;
        this._lastUpdate = 0;
    }

    tick(timestamp) {
        this.frames.push(timestamp);
        // Keep only the last second of frames
        const cutoff = timestamp - 1000;
        while (this.frames.length > 0 && this.frames[0] < cutoff) {
            this.frames.shift();
        }

        // Update FPS every 500ms
        if (timestamp - this._lastUpdate > 500) {
            this.fps = this.frames.length;
            this._lastUpdate = timestamp;
        }
    }

    toggle() {
        this.visible = !this.visible;
    }

    render(ctx) {
        if (!this.visible) return;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, 80, 24);
        ctx.fillStyle = this.fps >= 50 ? '#0f0' : this.fps >= 30 ? '#ff0' : '#f00';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${this.fps}`, 6, 17);
        ctx.restore();
    }
}
