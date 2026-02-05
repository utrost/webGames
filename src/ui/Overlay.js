export class Overlay {
    constructor(message) {
        this.message = message;
        this.visible = false;
    }

    show(message) {
        if (message) this.message = message;
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    draw(ctx, width, height) {
        if (!this.visible) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fff';
        ctx.font = '40px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.message, width / 2, height / 2);
    }
}
