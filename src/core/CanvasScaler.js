export class CanvasScaler {
    constructor(canvas, designWidth, designHeight, options = {}) {
        this.canvas = canvas;
        this.designWidth = designWidth;
        this.designHeight = designHeight;
        this.gutter = options.gutter ?? 0;

        this._onResize = () => this.resize();
        window.addEventListener('resize', this._onResize);
        window.visualViewport?.addEventListener?.('resize', this._onResize);
        this.resize();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const viewportWidth = window.visualViewport?.width || window.innerWidth || parent.clientWidth;
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const maxW = Math.max(0, Math.min(parent.clientWidth || viewportWidth, viewportWidth) - (this.gutter * 2));
        const maxH = parent.clientHeight || viewportHeight;
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
        window.visualViewport?.removeEventListener?.('resize', this._onResize);
    }
}
