/**
 * Player entity with stats, inventory, equipment, and status effects.
 */
export class Player {
  constructor(stats) {
    this.type = 'player';
    this.x = 0;
    this.y = 0;
    this.alive = true;
    this.frozen = false;

    // Stats from progression system
    this.stats = {
      hp: stats.hp,
      maxHP: stats.hp,
      atk: stats.atk,
      def: stats.def,
      sight: stats.sight,
      speed: stats.speed,
      dodgeChance: stats.dodgeChance || 0
    };

    // Equipment
    this.weapon = {
      name: 'Wrench',
      atk: 3 + (stats.wrenchBonus || 0),
      durability: Infinity,
      maxDurability: Infinity,
      range: 1,
      element: 'kinetic',
      affixes: [],
      rarity: 'common',
      isDefault: true
    };
    this.armor = null;

    // Inventory (6 slots)
    this.inventory = [];
    this.maxInventory = 6;

    // Status effects
    this.statusEffects = new Map();

    // Resistances
    this.resistances = { kinetic: 0, thermal: 0, cryo: 0, shock: 0, acid: 0 };

    // Temporary buffs
    this.tempBuffs = [];
  }

  getWeapon() {
    return this.weapon;
  }

  equipWeapon(weapon) {
    const old = this.weapon.isDefault ? null : this.weapon;
    this.weapon = weapon;
    return old;
  }

  equipArmor(armor) {
    const old = this.armor;
    this.armor = armor;
    this.recalcResistances();
    return old;
  }

  recalcResistances() {
    // Reset to base
    this.resistances = { kinetic: 0, thermal: 0, cryo: 0, shock: 0, acid: 0 };
    this.stats.def = 0;

    if (this.armor) {
      this.stats.def = this.armor.def || 0;
      if (this.armor.resistances) {
        for (const [elem, val] of Object.entries(this.armor.resistances)) {
          this.resistances[elem] = (this.resistances[elem] || 0) + val;
        }
      }
      // Armor affixes
      if (this.armor.affixes) {
        for (const affix of this.armor.affixes) {
          if (affix.effect === 'resistance' && affix.element) {
            this.resistances[affix.element] += affix.value;
          }
        }
      }
    }
  }

  onWeaponBreak() {
    this.weapon = {
      name: 'Wrench',
      atk: 3,
      durability: Infinity,
      maxDurability: Infinity,
      range: 1,
      element: 'kinetic',
      affixes: [],
      rarity: 'common',
      isDefault: true
    };
  }

  takeDamage(amount, source) {
    // Dodge check
    if (this.stats.dodgeChance > 0 && Math.random() * 100 < this.stats.dodgeChance) {
      return false; // Dodged
    }

    this.stats.hp -= amount;
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.alive = false;
      return true; // Killed
    }
    return false;
  }

  heal(amount) {
    this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + amount);
  }

  addToInventory(item) {
    if (item.stackable) {
      const existing = this.inventory.find(i => i.id === item.id);
      if (existing) {
        existing.count = Math.min(
          (existing.count || 1) + (item.count || 1),
          item.stackLimit || 99
        );
        return true;
      }
    }
    if (this.inventory.length >= this.maxInventory) return false;
    this.inventory.push({ ...item, count: item.count || 1 });
    return true;
  }

  removeFromInventory(index) {
    if (index < 0 || index >= this.inventory.length) return null;
    const item = this.inventory[index];
    if (item.count > 1) {
      item.count--;
      return { ...item, count: 1 };
    }
    return this.inventory.splice(index, 1)[0];
  }

  useItem(index, game) {
    const item = this.inventory[index];
    if (!item) return false;

    switch (item.effect) {
      case 'heal':
        this.heal(item.value);
        game.messageLog?.add(`Used ${item.name}. +${item.value} HP`, '#39ff14');
        break;
      case 'o2':
        game.o2System.add(item.value);
        game.messageLog?.add(`Used ${item.name}. +${item.value} O2`, '#00bfff');
        break;
      case 'speed':
        this.tempBuffs.push({ type: 'speed', value: item.value, turnsLeft: item.duration });
        game.messageLog?.add(`Used ${item.name}. Speed boost!`, '#ffe100');
        break;
      case 'sight':
        this.tempBuffs.push({ type: 'sight', value: item.value, turnsLeft: item.duration });
        game.messageLog?.add(`Used ${item.name}. Vision enhanced!`, '#ffe100');
        break;
      case 'repair':
        if (this.weapon && !this.weapon.isDefault) {
          this.weapon.durability = Math.min(
            this.weapon.maxDurability,
            this.weapon.durability + item.value
          );
          game.messageLog?.add(`Repaired ${this.weapon.name}. +${item.value} durability`, '#888888');
        }
        break;
      default:
        return false;
    }

    this.removeFromInventory(index);
    return true;
  }

  getEffectiveSight() {
    let sight = this.stats.sight;
    for (const buff of this.tempBuffs) {
      if (buff.type === 'sight') sight += buff.value;
    }
    return sight;
  }

  processTurnBuffs() {
    for (let i = this.tempBuffs.length - 1; i >= 0; i--) {
      this.tempBuffs[i].turnsLeft--;
      if (this.tempBuffs[i].turnsLeft <= 0) {
        this.tempBuffs.splice(i, 1);
      }
    }
  }
}
