export class CanvasScaler {
    constructor(canvas, designWidth, designHeight) {
        this.canvas = canvas;
        this.designWidth = designWidth;
        this.designHeight = designHeight;

        this._onResize = () => this.resize();
        window.addEventListener('resize', this._onResize);
        this.resize();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const maxW = parent.clientWidth;
        const maxH = parent.clientHeight || window.innerHeight;
        const aspect = this.designWidth / this.designHeight;

        let w = maxW;
        let h = w / aspect;

        if (h > maxH) {
            h = maxH;
            w = h * aspect;
        }

        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
    }

    destroy() {
        window.removeEventListener('resize', this._onResize);
    }
}
