import { Item } from '../entities/Item.js';

const ELEMENT_COLORS = {
  kinetic: '#cccccc', thermal: '#ff6600', cryo: '#00bfff',
  shock: '#ffe100', acid: '#00ff00'
};

/**
 * Heads-up display: HP bar, O2 bar, weapon, deck number, status effects.
 */
export class HUD {
  constructor() {
    this.barWidth = 120;
    this.barHeight = 10;
    this.padding = 8;
  }

  render(ctx, game) {
    const { player, o2System, deckNumber, deckName } = game;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    let y = this.padding;

    // Deck info (top center)
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00fff5';
    ctx.fillText(deckName || `Deck ${deckNumber}`, w / 2, y + 10);
    ctx.textAlign = 'left';

    // HP Bar (top left)
    y = this.padding;
    this.drawBar(ctx, this.padding, y, 'HP', player.stats.hp, player.stats.maxHP, '#39ff14', '#ff0040');
    y += this.barHeight + 4;

    // O2 Bar
    this.drawBar(ctx, this.padding, y, 'O2', Math.floor(o2System.current), o2System.maxO2, '#00bfff', '#004466');
    y += this.barHeight + 4;

    // O2 warning flash
    if (o2System.isCritical()) {
      ctx.fillStyle = '#ff0040';
      ctx.font = 'bold 11px monospace';
      const blink = Math.sin(Date.now() / 150) > 0;
      if (blink) ctx.fillText('! O2 CRITICAL !', this.padding, y + 10);
      y += 14;
    } else if (o2System.isLow()) {
      ctx.fillStyle = '#ffe100';
      ctx.font = '11px monospace';
      ctx.fillText('O2 LOW', this.padding, y + 10);
      y += 14;
    }

    // Current weapon (top left, below bars)
    y += 4;
    const weapon = player.weapon;
    ctx.font = '11px monospace';
    const elemColor = ELEMENT_COLORS[weapon.element] || '#cccccc';
    ctx.fillStyle = Item.getRarityColor(weapon.rarity);
    ctx.fillText(weapon.name, this.padding, y + 10);
    y += 14;
    ctx.fillStyle = elemColor;
    ctx.fillText(`ATK:${weapon.atk} ${weapon.element !== 'kinetic' ? weapon.element : ''}`, this.padding, y + 10);
    if (!weapon.isDefault) {
      y += 14;
      ctx.fillStyle = weapon.durability < 5 ? '#ff0040' : '#888888';
      ctx.fillText(`DUR:${weapon.durability}/${weapon.maxDurability}`, this.padding, y + 10);
    }

    // Armor (if equipped)
    if (player.armor) {
      y += 16;
      ctx.fillStyle = Item.getRarityColor(player.armor.rarity);
      ctx.fillText(player.armor.name, this.padding, y + 10);
      y += 14;
      ctx.fillStyle = '#888888';
      ctx.fillText(`DEF:${player.armor.def}`, this.padding, y + 10);
    }

    // Status effects (top right)
    this.drawStatusEffects(ctx, w - this.padding, this.padding + 20, player);

    // Turn counter (bottom left)
    ctx.font = '10px monospace';
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'left';
    ctx.fillText(`Turn ${game.turnNumber}`, this.padding, h - this.padding);

    // Credits (bottom right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Credits: ${game.progression?.credits || 0}`, w - this.padding, h - this.padding);
    ctx.textAlign = 'left';
  }

  drawBar(ctx, x, y, label, current, max, fillColor, bgColor) {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y, this.barWidth + 50, this.barHeight + 2);

    // Label
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = fillColor;
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 2, y + 1);

    // Bar background
    const barX = x + 24;
    ctx.fillStyle = bgColor;
    ctx.fillRect(barX, y + 1, this.barWidth, this.barHeight);

    // Bar fill
    const ratio = Math.max(0, current / max);
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, y + 1, this.barWidth * ratio, this.barHeight);

    // Value text
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText(`${current}/${max}`, barX + this.barWidth + 4, y + 2);
  }

  drawStatusEffects(ctx, x, y, player) {
    if (!player.statusEffects || player.statusEffects.size === 0) return;

    ctx.textAlign = 'right';
    ctx.font = '10px monospace';
    let offsetY = 0;

    for (const [key, effect] of player.statusEffects) {
      const colors = {
        burn: '#ff6600', chill: '#00bfff', freeze: '#00bfff',
        overload: '#ffe100', corrode: '#00ff00'
      };
      ctx.fillStyle = colors[key] || '#ffffff';
      ctx.fillText(`${effect.name} (${effect.turnsLeft})`, x, y + offsetY);
      offsetY += 12;
    }
    ctx.textAlign = 'left';
  }
}
