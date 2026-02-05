export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    // Immutable ops (legacy support if needed, but Orbit uses mutable mostly)
    // Actually, looking at Orbit code:
    // const diff = b.pos.clone().subtract(a.pos);
    // This implies `subtract` should modify `this` and return `this`, OR return a new vector.
    // The previous implementation had `add` returning a NEW vector.
    // BUT Orbit code does: a.acc.add(force...) which implies MUTABLE.
    // Wait, let's check previous file content.
    // The previous file had: return new Vector2(...) for add/sub/scale.
    // This means they were immutable.
    // BUT Orbit code: a.acc.add(...)
    // If add returns a new vector, then `a.acc.add(...)` does NOTHING to a.acc.
    // ERROR: Physics engine assumes MUTABLE vectors (standard for game physic engines usually),
    // but Vector2.js was implementing IMMUTABLE vectors.

    // I need to switch Vector2 to be MUTABLE or update Physics to re-assign.
    // "a.acc.add(force...)" -> "a.acc = a.acc.add(force...)" if immutable.
    // Given the quantity of vector math, MUTABLE is better for memory/perf.
    // I will refactor Vector2 to be mutable chainable.

    clone() {
        return new Vector2(this.x, this.y);
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    scale(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.scale(1 / m);
        }
        return this;
    }

    dist(v) {
        return Math.sqrt(this.distSq(v));
    }

    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
}
