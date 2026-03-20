export class GamepadManager {
    constructor() {
        this.gamepads = {};
        this.prevButtons = {};

        this._onConnect = (e) => {
            this.gamepads[e.gamepad.index] = e.gamepad;
        };
        this._onDisconnect = (e) => {
            delete this.gamepads[e.gamepad.index];
            delete this.prevButtons[e.gamepad.index];
        };

        window.addEventListener('gamepadconnected', this._onConnect);
        window.addEventListener('gamepaddisconnected', this._onDisconnect);
    }

    poll() {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of pads) {
            if (gp) this.gamepads[gp.index] = gp;
        }
    }

    // Returns the first connected gamepad's state, or null
    getState() {
        this.poll();

        for (const idx in this.gamepads) {
            const gp = this.gamepads[idx];
            if (!gp || !gp.connected) continue;

            const prev = this.prevButtons[idx] || [];
            const state = {
                // Standard mapping: left stick
                leftX: Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0,
                leftY: Math.abs(gp.axes[1]) > 0.15 ? gp.axes[1] : 0,
                // D-pad
                dpadUp: gp.buttons[12]?.pressed ?? false,
                dpadDown: gp.buttons[13]?.pressed ?? false,
                dpadLeft: gp.buttons[14]?.pressed ?? false,
                dpadRight: gp.buttons[15]?.pressed ?? false,
                // Face buttons (standard mapping)
                a: gp.buttons[0]?.pressed ?? false,
                b: gp.buttons[1]?.pressed ?? false,
                x: gp.buttons[2]?.pressed ?? false,
                y: gp.buttons[3]?.pressed ?? false,
                // Triggers
                lb: gp.buttons[4]?.pressed ?? false,
                rb: gp.buttons[5]?.pressed ?? false,
                // Start/Select
                start: gp.buttons[9]?.pressed ?? false,
                select: gp.buttons[8]?.pressed ?? false,
                // "Just pressed" helpers (rising edge)
                justPressed: {}
            };

            for (let i = 0; i < gp.buttons.length; i++) {
                const nowPressed = gp.buttons[i]?.pressed ?? false;
                const wasPressed = prev[i] ?? false;
                if (nowPressed && !wasPressed) {
                    state.justPressed[i] = true;
                }
            }

            // Save current button states for next frame
            this.prevButtons[idx] = gp.buttons.map(b => b.pressed);

            return state;
        }
        return null;
    }

    get connected() {
        this.poll();
        return Object.values(this.gamepads).some(g => g && g.connected);
    }

    destroy() {
        window.removeEventListener('gamepadconnected', this._onConnect);
        window.removeEventListener('gamepaddisconnected', this._onDisconnect);
    }
}
