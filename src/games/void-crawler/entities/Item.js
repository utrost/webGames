/**
 * Item entity for weapons, armor, and consumables.
 */
export class Item {
  constructor(config) {
    this.id = config.id || config.name?.toLowerCase().replace(/\s+/g, '_');
    this.name = config.name;
    this.type = config.type; // 'weapon', 'armor', 'consumable'
    this.rarity = config.rarity || 'common';
    this.iLvl = config.iLvl || 1;

    // Position on map (if dropped)
    this.x = config.x ?? null;
    this.y = config.y ?? null;
    this.onMap = config.onMap ?? false;

    // Weapon stats
    if (this.type === 'weapon') {
      this.atk = config.atk || 0;
      this.durability = config.durability || 20;
      this.maxDurability = config.durability || 20;
      this.range = config.range || 1;
      this.element = config.element || 'kinetic';
      this.affixes = config.affixes || [];
      this.silent = config.silent || false;
      this.aoe = config.aoe || 0;
    }

    // Armor stats
    if (this.type === 'armor') {
      this.def = config.def || 0;
      this.resistances = config.resistances || {};
      this.affixes = config.affixes || [];
      this.o2Mult = config.o2Mult || null;
      this.bonusSlots = config.bonusSlots || 0;
      this.emergencyShield = config.emergencyShield || false;
    }

    // Consumable stats
    if (this.type === 'consumable') {
      this.effect = config.effect;
      this.value = config.value || 0;
      this.duration = config.duration || 0;
      this.radius = config.radius || 0;
      this.stackable = true;
      this.stackLimit = config.stackLimit || 5;
      this.count = config.count || 1;
    }
  }

  getDisplayName() {
    const rarityColors = {
      common: '#888888',
      uncommon: '#39ff14',
      rare: '#00bfff',
      epic: '#ff00ff',
      legendary: '#ffd700'
    };
    return {
      text: this.name,
      color: rarityColors[this.rarity] || '#888888'
    };
  }

  getDescription() {
    const lines = [];
    if (this.type === 'weapon') {
      lines.push(`ATK: ${this.atk}`);
      lines.push(`Durability: ${this.durability}/${this.maxDurability}`);
      if (this.range > 1) lines.push(`Range: ${this.range}`);
      if (this.element !== 'kinetic') lines.push(`Element: ${this.element}`);
      for (const affix of this.affixes) {
        lines.push(`${affix.name}`);
      }
    } else if (this.type === 'armor') {
      lines.push(`DEF: ${this.def}`);
      for (const [elem, val] of Object.entries(this.resistances)) {
        if (val !== 0) lines.push(`${elem}: ${val > 0 ? '+' : ''}${val}%`);
      }
      for (const affix of this.affixes) {
        lines.push(`${affix.name}`);
      }
    } else if (this.type === 'consumable') {
      lines.push(this.getEffectDescription());
    }
    return lines;
  }

  getEffectDescription() {
    switch (this.effect) {
      case 'heal': return `Restores ${this.value} HP`;
      case 'o2': return `Restores ${this.value} O2`;
      case 'speed': return `Speed x${this.value} for ${this.duration} turns`;
      case 'sight': return `+${this.value} sight for ${this.duration} turns`;
      case 'repair': return `+${this.value} durability`;
      case 'emp': return `Disables machines in ${this.radius} radius`;
      default: return this.effect;
    }
  }

  static getRarityColor(rarity) {
    const colors = {
      common: '#888888',
      uncommon: '#39ff14',
      rare: '#00bfff',
      epic: '#ff00ff',
      legendary: '#ffd700'
    };
    return colors[rarity] || '#888888';
  }
}
