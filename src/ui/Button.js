export class Button {
    constructor(text, x, y, callback) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 50;
        this.callback = callback;
        this.isHovered = false;
    }

    update(mouse) {
        // AABB collision detection for mouse hover
        if (mouse.x > this.x && mouse.x < this.x + this.width &&
            mouse.y > this.y && mouse.y < this.y + this.height) {
            this.isHovered = true;
            if (mouse.isDown && this.callback) {
                this.callback();
            }
        } else {
            this.isHovered = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isHovered ? '#ff00ff' : '#00f3ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#000';
        ctx.font = '20px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}
