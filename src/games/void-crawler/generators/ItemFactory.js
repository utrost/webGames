import { Item } from '../entities/Item.js';
import { NameGenerator } from './NameGenerator.js';
import scalingData from '../data/scaling.json';
import affixesData from '../data/affixes.json';

const ELEMENTS = ['kinetic', 'thermal', 'cryo', 'shock', 'acid'];

/**
 * Generates weapons, armor, and consumables.
 * Items = Base × iLvl × Rarity × Affixes × Element
 */
export class ItemFactory {
  static createWeapon(iLvl, forcedRarity = null) {
    const rarity = forcedRarity || ItemFactory.rollRarity(iLvl);
    const affixCount = ItemFactory.affixCountForRarity(rarity);

    // Pick base weapon available at this iLvl
    const allBases = [...scalingData.weaponBases.melee, ...scalingData.weaponBases.ranged];
    const available = allBases.filter(b => b.minILvl <= iLvl);
    if (available.length === 0) return null;
    const base = available[Math.floor(Math.random() * available.length)];

    // Scale stats
    const atk = Math.floor(base.atk * (1 + 0.15 * iLvl));
    const durability = Math.floor(base.durability * (1 + 0.10 * iLvl));

    // Element
    let element = base.element || 'kinetic';

    // Roll affixes
    const affixes = ItemFactory.rollAffixes('weapon', iLvl, affixCount);

    // Check if affix changes element
    for (const affix of affixes) {
      if (affix.effect === 'element') {
        element = affix.element;
      }
    }

    const name = NameGenerator.weaponName(base.name, affixes);

    return new Item({
      name,
      type: 'weapon',
      rarity,
      iLvl,
      atk,
      durability,
      range: base.range,
      element,
      affixes,
      aoe: base.aoe || 0
    });
  }

  static createArmor(iLvl, forcedRarity = null) {
    const rarity = forcedRarity || ItemFactory.rollRarity(iLvl);
    const affixCount = ItemFactory.affixCountForRarity(rarity);

    const available = scalingData.armorBases.filter(b => b.minILvl <= iLvl);
    if (available.length === 0) return null;
    const base = available[Math.floor(Math.random() * available.length)];

    const def = Math.floor(base.def * (1 + 0.20 * iLvl));
    const affixes = ItemFactory.rollAffixes('armor', iLvl, affixCount);

    const resistances = { ...(base.resistances || {}) };

    // Apply affix resistances
    for (const affix of affixes) {
      if (affix.effect === 'resistance' && affix.element) {
        resistances[affix.element] = (resistances[affix.element] || 0) + affix.value;
      }
    }

    const name = NameGenerator.armorName(base.name, affixes);

    return new Item({
      name,
      type: 'armor',
      rarity,
      iLvl,
      def,
      resistances,
      affixes,
      o2Mult: base.o2Mult || null,
      bonusSlots: base.bonusSlots || 0,
      emergencyShield: base.emergencyShield || false
    });
  }

  static createConsumable(type = null) {
    const consumables = scalingData.consumables;
    const def = type
      ? consumables.find(c => c.id === type)
      : consumables[Math.floor(Math.random() * consumables.length)];

    if (!def) return null;

    return new Item({
      id: def.id,
      name: def.name,
      type: 'consumable',
      effect: def.effect,
      value: def.value || 0,
      duration: def.duration || 0,
      radius: def.radius || 0,
      stackLimit: def.stackLimit || 5
    });
  }

  static rollRarity(iLvl) {
    // Interpolate drop rates from scaling data
    const rates = scalingData.dropRates;
    const deckKeys = Object.keys(rates).map(Number).sort((a, b) => a - b);

    let lower = rates['1'];
    let upper = rates['1'];
    for (let i = 0; i < deckKeys.length - 1; i++) {
      if (iLvl >= deckKeys[i] && iLvl <= deckKeys[i + 1]) {
        lower = rates[deckKeys[i]];
        upper = rates[deckKeys[i + 1]];
        break;
      }
      if (iLvl > deckKeys[i]) {
        lower = rates[deckKeys[i]];
        upper = rates[deckKeys[Math.min(i + 1, deckKeys.length - 1)]];
      }
    }

    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const rarity of ['legendary', 'epic', 'rare', 'uncommon', 'common']) {
      cumulative += lower[rarity] || 0;
      if (roll < cumulative) return rarity;
    }
    return 'common';
  }

  static affixCountForRarity(rarity) {
    switch (rarity) {
      case 'common': return 0;
      case 'uncommon': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 3;
      default: return 0;
    }
  }

  static rollAffixes(itemType, iLvl, count) {
    if (count === 0) return [];

    const prefixPool = (affixesData.prefixes[itemType] || []).filter(a => a.minILvl <= iLvl);
    const suffixPool = (affixesData.suffixes[itemType] || []).filter(a => a.minILvl <= iLvl);

    const affixes = [];
    const used = new Set();

    // At least one prefix if available
    if (prefixPool.length > 0 && count > 0) {
      const idx = Math.floor(Math.random() * prefixPool.length);
      const affix = { ...prefixPool[idx], isPrefix: true };
      affixes.push(affix);
      used.add(affix.name);
      count--;
    }

    // Fill remaining with suffixes or prefixes
    const remaining = [...suffixPool, ...prefixPool].filter(a => !used.has(a.name));
    while (count > 0 && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      const affix = { ...remaining[idx], isPrefix: !remaining[idx].isPrefix };
      affixes.push(affix);
      remaining.splice(idx, 1);
      count--;
    }

    return affixes;
  }

  static createLootDrop(iLvl, guaranteedRarity = null) {
    const roll = Math.random();
    if (roll < 0.4) return ItemFactory.createWeapon(iLvl, guaranteedRarity);
    if (roll < 0.7) return ItemFactory.createArmor(iLvl, guaranteedRarity);
    return ItemFactory.createConsumable();
  }
}
