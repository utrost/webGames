/** Unified keyboard + touch input manager for Canvas games. */
export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.justPressedKeys = {};

        // Touch gesture state
        this.touch = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            startTime: 0,
        };
        this.lastGesture = null;

        this._handlers = [];
        this._bind();
    }

    _on(target, event, handler, opts) {
        target.addEventListener(event, handler, opts);
        this._handlers.push({ target, event, handler, opts });
    }

    _bind() {
        this._on(globalThis, 'keydown', (e) => {
            if (!this.keys[e.code]) this.justPressedKeys[e.code] = true;
            this.keys[e.code] = true;
        });
        this._on(globalThis, 'keyup', (e) => {
            this.keys[e.code] = false;
        });

        this._on(this.canvas, 'touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.touch.active = true;
            this.touch.startX = t.clientX;
            this.touch.startY = t.clientY;
            this.touch.currentX = t.clientX;
            this.touch.currentY = t.clientY;
            this.touch.startTime = Date.now();
            this.lastGesture = null;
        }, { passive: false });

        this._on(this.canvas, 'touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.touch.currentX = t.clientX;
            this.touch.currentY = t.clientY;
        }, { passive: false });

        this._on(this.canvas, 'touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
            const dx = this.touch.currentX - this.touch.startX;
            const dy = this.touch.currentY - this.touch.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const elapsed = Date.now() - this.touch.startTime;

            if (dist < 15 && elapsed < 300) {
                this.lastGesture = 'tap';
            } else if (dist >= 30) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.lastGesture = dx > 0 ? 'swipe-right' : 'swipe-left';
                } else {
                    this.lastGesture = dy > 0 ? 'swipe-down' : 'swipe-up';
                }
            }
        }, { passive: false });
    }

    /** Check if key is held. */
    isDown(code) {
        return !!this.keys[code];
    }

    /** Check and consume a just-pressed key (rising edge). */
    wasPressed(code) {
        if (this.justPressedKeys[code]) {
            this.justPressedKeys[code] = false;
            return true;
        }
        return false;
    }

    /** Consume and return the last touch gesture ('tap', 'swipe-left', etc.) or null. */
    consumeGesture() {
        const g = this.lastGesture;
        this.lastGesture = null;
        return g;
    }

    /** Whether touch input is available on this device. */
    get isTouchDevice() {
        return 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
    }

    /** Clean up all listeners. */
    destroy() {
        for (const { target, event, handler, opts } of this._handlers) {
            target.removeEventListener(event, handler, opts);
        }
        this._handlers = [];
        this.keys = {};
        this.justPressedKeys = {};
    }
}
