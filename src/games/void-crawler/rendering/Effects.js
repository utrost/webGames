/**
 * Visual effects: CRT overlay, screen shake, damage flash, element particles.
 */
export class Effects {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeDuration = 0;
    this.flashColor = null;
    this.flashDuration = 0;
    this.particles = [];
  }

  shake(intensity = 3, duration = 200) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  flash(color = '#ff0040', duration = 150) {
    this.flashColor = color;
    this.flashDuration = duration;
  }

  spawnParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.5 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }

  update(dt) {
    // Update shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt * 1000;
      this.shakeX = (Math.random() - 0.5) * 2 * (this.shakeIntensity || 3);
      this.shakeY = (Math.random() - 0.5) * 2 * (this.shakeIntensity || 3);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Update flash
    if (this.flashDuration > 0) {
      this.flashDuration -= dt * 1000;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const { ctx, canvas } = this;

    // Damage flash overlay
    if (this.flashDuration > 0 && this.flashColor) {
      ctx.globalAlpha = Math.min(0.3, this.flashDuration / 300);
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // CRT scanline overlay
    this.drawScanlines();
  }

  drawScanlines() {
    const { ctx, canvas } = this;
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#000';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    ctx.globalAlpha = 1;
  }

  getShakeOffset() {
    return { x: this.shakeX, y: this.shakeY };
  }
}
