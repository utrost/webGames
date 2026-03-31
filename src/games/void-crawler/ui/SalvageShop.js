/**
 * Salvage Shop — between-run permanent upgrade screen.
 */
export class SalvageShop {
  constructor() {
    this.visible = false;
    this.selectedIndex = 0;
    this.onClose = null;
  }

  show(onClose) {
    this.visible = true;
    this.selectedIndex = 0;
    this.onClose = onClose;
  }

  hide() {
    this.visible = false;
    if (this.onClose) this.onClose();
  }

  render(ctx, progression) {
    if (!this.visible) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const panelW = 340;
    const panelH = 400;
    const px = (w - panelW) / 2;
    const py = (h - panelH) / 2;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    // Title
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('SALVAGE SHOP', px + panelW / 2, py + 22);

    // Credits
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Credits: ${progression.credits}`, px + panelW / 2, py + 40);
    ctx.textAlign = 'left';

    let y = py + 60;

    const upgrades = progression.getUpgradeDefinitions();

    for (let i = 0; i < upgrades.length; i++) {
      const upg = upgrades[i];
      const selected = i === this.selectedIndex;

      if (selected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fillRect(px + 6, y - 2, panelW - 12, 28);
      }

      // Name
      ctx.font = '11px monospace';
      const maxed = upg.currentLevel >= upg.maxLevel;
      ctx.fillStyle = maxed ? '#555555' : upg.canAfford ? '#ffffff' : '#666666';
      ctx.fillText(upg.name, px + 10, y + 10);

      // Level
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      const levelStr = `Lv ${upg.currentLevel}/${upg.maxLevel}`;
      ctx.fillText(levelStr, px + 180, y + 10);

      // Cost
      if (!maxed) {
        ctx.fillStyle = upg.canAfford ? '#ffd700' : '#663300';
        ctx.fillText(`${upg.nextCost}c`, px + panelW - 60, y + 10);
      } else {
        ctx.fillStyle = '#39ff14';
        ctx.fillText('MAX', px + panelW - 60, y + 10);
      }

      // Effect description
      ctx.fillStyle = '#555555';
      ctx.font = '9px monospace';
      const effectStr = `+${upg.valuePerLevel} ${upg.effect}/level`;
      ctx.fillText(effectStr, px + 10, y + 22);

      y += 30;
    }

    // Controls
    ctx.fillStyle = '#555555';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[W/S] Select  [Enter] Buy  [Esc/Space] Start Run', px + panelW / 2, py + panelH - 12);
    ctx.textAlign = 'left';
  }

  handleInput(key, progression) {
    if (!this.visible) return false;

    const upgrades = progression.getUpgradeDefinitions();

    switch (key) {
      case 'ArrowUp':
      case 'KeyW':
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        return true;
      case 'ArrowDown':
      case 'KeyS':
        this.selectedIndex = Math.min(upgrades.length - 1, this.selectedIndex + 1);
        return true;
      case 'Enter': {
        const upg = upgrades[this.selectedIndex];
        if (upg && upg.canAfford) {
          progression.purchaseUpgrade(upg.id);
        }
        return true;
      }
      case 'Escape':
      case 'Space':
        this.hide();
        return true;
    }
    return true;
  }
}
