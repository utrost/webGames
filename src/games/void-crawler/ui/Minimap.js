/**
 * Minimap showing explored areas, player position, and elevator.
 */
export class Minimap {
  constructor() {
    this.visible = false;
    this.scale = 2; // pixels per tile
    this.padding = 8;
  }

  toggle() {
    this.visible = !this.visible;
  }

  render(ctx, game) {
    if (!this.visible) return;

    const { map, player, fovSystem, elevatorX, elevatorY } = game;
    const scale = this.scale;
    const w = game.mapWidth * scale;
    const h = game.mapHeight * scale;
    const x = ctx.canvas.width - w - this.padding;
    const y = this.padding + 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

    // Draw tiles
    for (const [key, tile] of map) {
      const [tx, ty] = key.split(',').map(Number);
      const state = fovSystem.getState(tx, ty);
      if (state === 'unexplored') continue;

      const px = x + tx * scale;
      const py = y + ty * scale;

      if (tile === 'wall') {
        ctx.fillStyle = state === 'visible' ? '#004444' : '#002222';
      } else if (tile === 'elevator') {
        ctx.fillStyle = '#ffffff';
      } else if (tile === 'ventilation') {
        ctx.fillStyle = '#004466';
      } else {
        ctx.fillStyle = state === 'visible' ? '#111122' : '#080810';
      }
      ctx.fillRect(px, py, scale, scale);
    }

    // Draw monsters (only visible)
    if (game.monsters) {
      for (const monster of game.monsters) {
        if (!monster.alive || !fovSystem.isVisible(monster.x, monster.y)) continue;
        ctx.fillStyle = monster.color;
        ctx.fillRect(x + monster.x * scale, y + monster.y * scale, scale, scale);
      }
    }

    // Draw player
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(x + player.x * scale, y + player.y * scale, scale + 1, scale + 1);

    // Label
    ctx.font = '9px monospace';
    ctx.fillStyle = '#555';
    ctx.fillText('[M] Map', x, y - 4);
  }
}
