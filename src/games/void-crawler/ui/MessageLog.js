/**
 * Message log displaying game events.
 */
export class MessageLog {
  constructor(maxMessages = 50) {
    this.messages = [];
    this.maxMessages = maxMessages;
    this.displayCount = 5; // Messages visible on screen
  }

  add(text, color = '#888888') {
    this.messages.push({ text, color, turn: Date.now() });
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  getRecent(count = null) {
    const n = count || this.displayCount;
    return this.messages.slice(-n);
  }

  render(ctx, x, y, width) {
    const recent = this.getRecent();
    const lineHeight = 14;
    const padding = 4;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, width, recent.length * lineHeight + padding * 2);

    ctx.font = '11px monospace';
    ctx.textBaseline = 'top';

    for (let i = 0; i < recent.length; i++) {
      const msg = recent[i];
      const alpha = 0.4 + 0.6 * ((i + 1) / recent.length);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = msg.color;
      ctx.fillText(msg.text, x + padding, y + padding + i * lineHeight, width - padding * 2);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.messages = [];
  }
}
