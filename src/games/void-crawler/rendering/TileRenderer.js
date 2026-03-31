import { Item } from '../entities/Item.js';

/**
 * 16×16 pixel tile renderer on Canvas.
 * Uses the neon color palette from DESIGN.md.
 */

const COLORS = {
  floorVisible: '#1a1a2e',
  floorRemembered: '#0f0f1a',
  wall: '#00fff5',
  wallRemembered: '#005555',
  player: '#39ff14',
  elevator: '#ffffff',
  door: '#00fff5',
  doorRemembered: '#004444',
  ventilation: '#00bfff',
  item: '#ffe100',
  unexplored: '#000000',
  background: '#000000'
};

export class TileRenderer {
  constructor(ctx, camera, tileSize) {
    this.ctx = ctx;
    this.camera = camera;
    this.tileSize = tileSize;
  }

  render(game) {
    const { ctx, camera, tileSize } = this;
    const { map, player, monsters, items, fovSystem } = game;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw tiles
    for (let screenY = 0; screenY < camera.tilesY + 1; screenY++) {
      for (let screenX = 0; screenX < camera.tilesX + 1; screenX++) {
        const worldX = camera.x + screenX;
        const worldY = camera.y + screenY;
        const key = `${worldX},${worldY}`;
        const tile = map.get(key);
        const state = fovSystem.getState(worldX, worldY);

        if (state === 'unexplored') continue;

        const px = screenX * tileSize;
        const py = screenY * tileSize;
        const visible = state === 'visible';

        this.drawTile(px, py, tile, visible);
      }
    }

    // Draw items on map
    for (const item of items) {
      if (!item.onMap) continue;
      if (!fovSystem.isVisible(item.x, item.y)) continue;
      if (!camera.isVisible(item.x, item.y)) continue;

      const { x: px, y: py } = camera.toScreen(item.x, item.y);
      this.drawItem(px, py, item);
    }

    // Draw monsters
    for (const monster of monsters) {
      if (!monster.alive) continue;
      if (!fovSystem.isVisible(monster.x, monster.y)) continue;
      if (!camera.isVisible(monster.x, monster.y)) continue;

      const { x: px, y: py } = camera.toScreen(monster.x, monster.y);
      this.drawMonster(px, py, monster);
    }

    // Draw player
    if (camera.isVisible(player.x, player.y)) {
      const { x: px, y: py } = camera.toScreen(player.x, player.y);
      this.drawPlayer(px, py, player);
    }
  }

  drawTile(px, py, tile, visible) {
    const { ctx, tileSize } = this;
    const ts = tileSize;

    switch (tile) {
      case 'floor':
        ctx.fillStyle = visible ? COLORS.floorVisible : COLORS.floorRemembered;
        ctx.fillRect(px, py, ts, ts);
        // Floor detail
        if (visible) {
          ctx.fillStyle = '#1e1e36';
          ctx.fillRect(px + ts / 2 - 1, py + ts / 2 - 1, 2, 2);
        }
        break;

      case 'wall':
        ctx.fillStyle = visible ? COLORS.wall : COLORS.wallRemembered;
        ctx.fillRect(px, py, ts, ts);
        // Wall detail - inner shadow
        ctx.fillStyle = visible ? '#009999' : '#003333';
        ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        ctx.fillStyle = visible ? COLORS.wall : COLORS.wallRemembered;
        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
        break;

      case 'door':
        ctx.fillStyle = visible ? COLORS.floorVisible : COLORS.floorRemembered;
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = visible ? COLORS.door : COLORS.doorRemembered;
        ctx.fillRect(px + 2, py + ts / 2 - 1, ts - 4, 3);
        break;

      case 'elevator':
        ctx.fillStyle = COLORS.floorVisible;
        ctx.fillRect(px, py, ts, ts);
        // Pulsing white elevator
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillStyle = COLORS.elevator;
        ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        // Arrow down
        ctx.fillRect(px + ts / 2 - 1, py + 4, 2, ts - 8);
        ctx.fillRect(px + 3, py + ts - 6, ts - 6, 2);
        ctx.globalAlpha = 1;
        break;

      case 'ventilation':
        ctx.fillStyle = COLORS.floorVisible;
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = COLORS.ventilation;
        ctx.globalAlpha = visible ? 0.8 : 0.3;
        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
        // Vent lines
        ctx.fillStyle = '#006688';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(px + 4, py + 5 + i * 3, ts - 8, 1);
        }
        ctx.globalAlpha = 1;
        break;

      default:
        if (tile) {
          ctx.fillStyle = visible ? COLORS.floorVisible : COLORS.floorRemembered;
          ctx.fillRect(px, py, ts, ts);
        }
    }
  }

  drawPlayer(px, py, player) {
    const { ctx, tileSize: ts } = this;

    // Glow effect
    ctx.shadowColor = COLORS.player;
    ctx.shadowBlur = 8;

    // Player body (triangle pointing up)
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(px + ts / 2, py + 2);
    ctx.lineTo(px + ts - 3, py + ts - 3);
    ctx.lineTo(px + 3, py + ts - 3);
    ctx.closePath();
    ctx.fill();

    // Helmet visor
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(px + ts / 2 - 2, py + 5, 4, 2);

    ctx.shadowBlur = 0;
  }

  drawMonster(px, py, monster) {
    const { ctx, tileSize: ts } = this;

    // Glow
    ctx.shadowColor = monster.color;
    ctx.shadowBlur = monster.isElite ? 12 : monster.isChampion ? 16 : 4;

    ctx.fillStyle = monster.color;

    // Different shapes per body type
    switch (monster.bodyType) {
      case 'insectoid':
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(px + ts / 2, py + 2);
        ctx.lineTo(px + ts - 3, py + ts / 2);
        ctx.lineTo(px + ts / 2, py + ts - 2);
        ctx.lineTo(px + 3, py + ts / 2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'humanoid':
        // Rounded rectangle
        ctx.fillRect(px + 3, py + 2, ts - 6, ts - 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 5, py + 5, 2, 2);
        ctx.fillRect(px + ts - 7, py + 5, 2, 2);
        break;

      case 'drone':
        // Octagon
        ctx.beginPath();
        ctx.moveTo(px + 5, py + 2);
        ctx.lineTo(px + ts - 5, py + 2);
        ctx.lineTo(px + ts - 2, py + 5);
        ctx.lineTo(px + ts - 2, py + ts - 5);
        ctx.lineTo(px + ts - 5, py + ts - 2);
        ctx.lineTo(px + 5, py + ts - 2);
        ctx.lineTo(px + 2, py + ts - 5);
        ctx.lineTo(px + 2, py + 5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'amorphous':
        // Blob
        ctx.beginPath();
        ctx.arc(px + ts / 2, py + ts / 2, ts / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'parasite':
        // Small X shape
        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 5, py + 5, ts - 10, ts - 10);
        ctx.fillStyle = monster.color;
        ctx.fillRect(px + 6, py + 6, 2, 2);
        break;

      case 'swarm':
        // Dots
        for (let i = 0; i < 4; i++) {
          const sx = px + 3 + (i % 2) * (ts - 8);
          const sy = py + 3 + Math.floor(i / 2) * (ts - 8);
          ctx.fillRect(sx, sy, 3, 3);
        }
        break;

      default:
        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
    }

    // Elite/Champion indicator
    if (monster.isElite || monster.isChampion) {
      ctx.fillStyle = monster.isChampion ? '#ffd700' : '#ffffff';
      ctx.fillRect(px + ts / 2 - 1, py, 2, 3);
    }

    ctx.shadowBlur = 0;
  }

  drawItem(px, py, item) {
    const { ctx, tileSize: ts } = this;
    const color = Item.getRarityColor(item.rarity);

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;

    if (item.type === 'weapon') {
      // Sword-like shape
      ctx.fillRect(px + ts / 2 - 1, py + 3, 2, ts - 6);
      ctx.fillRect(px + 4, py + ts / 2 - 1, ts - 8, 2);
    } else if (item.type === 'armor') {
      // Shield shape
      ctx.beginPath();
      ctx.moveTo(px + ts / 2, py + ts - 3);
      ctx.lineTo(px + 3, py + 5);
      ctx.lineTo(px + 3, py + 3);
      ctx.lineTo(px + ts - 3, py + 3);
      ctx.lineTo(px + ts - 3, py + 5);
      ctx.closePath();
      ctx.fill();
    } else {
      // Consumable - small box
      ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
    }

    ctx.shadowBlur = 0;
  }
}
