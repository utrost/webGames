export class GameLoop {
    /** @param {(dt: number) => void} update @param {() => void} render */
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.lastTime = 0;
        this.animationFrameId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop = (time) => {
            const deltaTime = (time - this.lastTime) / 1000; // in seconds
            this.lastTime = time;

            this.update(deltaTime);
            this.render();

            if (this.isRunning) {
                this.animationFrameId = requestAnimationFrame(this.loop);
            }
        };
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
    }
}
