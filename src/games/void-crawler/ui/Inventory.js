import { Item } from '../entities/Item.js';

/**
 * Inventory UI overlay. Shown when pressing I.
 */
export class Inventory {
  constructor() {
    this.visible = false;
    this.selectedIndex = 0;
  }

  toggle() {
    this.visible = !this.visible;
    this.selectedIndex = 0;
  }

  open() {
    this.visible = true;
    this.selectedIndex = 0;
  }

  close() {
    this.visible = false;
  }

  render(ctx, player) {
    if (!this.visible) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const panelW = 280;
    const panelH = 320;
    const px = (w - panelW) / 2;
    const py = (h - panelH) / 2;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#00fff5';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    // Title
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#00fff5';
    ctx.textAlign = 'center';
    ctx.fillText('INVENTORY', px + panelW / 2, py + 20);
    ctx.textAlign = 'left';

    let y = py + 40;

    // Equipped weapon
    ctx.font = '11px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('Weapon:', px + 10, y);
    ctx.fillStyle = Item.getRarityColor(player.weapon.rarity);
    ctx.fillText(player.weapon.name, px + 70, y);
    y += 16;

    // Equipped armor
    ctx.fillStyle = '#888888';
    ctx.fillText('Armor:', px + 10, y);
    if (player.armor) {
      ctx.fillStyle = Item.getRarityColor(player.armor.rarity);
      ctx.fillText(player.armor.name, px + 70, y);
    } else {
      ctx.fillStyle = '#555555';
      ctx.fillText('(none)', px + 70, y);
    }
    y += 24;

    // Divider
    ctx.strokeStyle = '#333333';
    ctx.beginPath();
    ctx.moveTo(px + 10, y);
    ctx.lineTo(px + panelW - 10, y);
    ctx.stroke();
    y += 10;

    // Inventory slots
    ctx.fillStyle = '#888888';
    ctx.fillText(`Backpack (${player.inventory.length}/${player.maxInventory})`, px + 10, y);
    y += 18;

    for (let i = 0; i < player.maxInventory; i++) {
      const item = player.inventory[i];
      const selected = i === this.selectedIndex;

      // Highlight
      if (selected) {
        ctx.fillStyle = 'rgba(0, 255, 245, 0.15)';
        ctx.fillRect(px + 6, y - 2, panelW - 12, 18);
      }

      // Slot number
      ctx.fillStyle = '#555555';
      ctx.font = '10px monospace';
      ctx.fillText(`[${i + 1}]`, px + 10, y + 10);

      if (item) {
        ctx.fillStyle = Item.getRarityColor(item.rarity || 'common');
        ctx.font = '11px monospace';
        const countStr = item.count > 1 ? ` x${item.count}` : '';
        ctx.fillText(`${item.name}${countStr}`, px + 36, y + 10);
      } else {
        ctx.fillStyle = '#333333';
        ctx.font = '11px monospace';
        ctx.fillText('- empty -', px + 36, y + 10);
      }

      y += 20;
    }

    // Item details for selected
    y += 8;
    const selected = player.inventory[this.selectedIndex];
    if (selected) {
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(px + 10, y);
      ctx.lineTo(px + panelW - 10, y);
      ctx.stroke();
      y += 12;

      const desc = selected.getDescription ? selected.getDescription() : [];
      ctx.font = '10px monospace';
      for (const line of desc) {
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(line, px + 10, y);
        y += 14;
      }

      // Controls
      y += 4;
      ctx.fillStyle = '#555555';
      ctx.font = '9px monospace';
      if (selected.type === 'consumable') {
        ctx.fillText('[Enter] Use  [D] Drop  [Esc] Close', px + 10, y);
      } else if (selected.type === 'weapon') {
        ctx.fillText('[Enter] Equip  [D] Drop  [Esc] Close', px + 10, y);
      } else if (selected.type === 'armor') {
        ctx.fillText('[Enter] Equip  [D] Drop  [Esc] Close', px + 10, y);
      }
    } else {
      ctx.fillStyle = '#555555';
      ctx.font = '9px monospace';
      ctx.fillText('[Esc] Close', px + 10, y + 10);
    }
  }

  handleInput(key, player, game) {
    if (!this.visible) return false;

    switch (key) {
      case 'ArrowUp':
      case 'KeyW':
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        return true;
      case 'ArrowDown':
      case 'KeyS':
        this.selectedIndex = Math.min(player.maxInventory - 1, this.selectedIndex + 1);
        return true;
      case 'Enter': {
        const item = player.inventory[this.selectedIndex];
        if (!item) return true;
        if (item.type === 'consumable') {
          player.useItem(this.selectedIndex, game);
        } else if (item.type === 'weapon') {
          const old = player.equipWeapon(item);
          player.inventory.splice(this.selectedIndex, 1);
          if (old && !old.isDefault) player.addToInventory(old);
          game.messageLog?.add(`Equipped ${item.name}`, '#00fff5');
        } else if (item.type === 'armor') {
          const old = player.equipArmor(item);
          player.inventory.splice(this.selectedIndex, 1);
          if (old) player.addToInventory(old);
          game.messageLog?.add(`Equipped ${item.name}`, '#00fff5');
        }
        return true;
      }
      case 'KeyD': {
        const item = player.inventory[this.selectedIndex];
        if (item) {
          player.inventory.splice(this.selectedIndex, 1);
          game.messageLog?.add(`Dropped ${item.name}`, '#888888');
        }
        return true;
      }
      case 'Escape':
      case 'KeyI':
        this.close();
        return true;
    }
    return true; // Consume all input while open
  }
}
