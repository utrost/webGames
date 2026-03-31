import { Monster } from '../entities/Monster.js';
import { NameGenerator } from './NameGenerator.js';
import bodiesData from '../data/bodies.json';
import abilitiesData from '../data/abilities.json';
import scalingData from '../data/scaling.json';

const ELEMENTS = ['kinetic', 'thermal', 'cryo', 'shock', 'acid'];
const ELEMENT_COLORS = {
  kinetic: '#cccccc', thermal: '#ff6600', cryo: '#00bfff',
  shock: '#ffe100', acid: '#00ff00'
};
const TIER_COLORS = ['#ff6600', '#ff0040', '#ff00ff'];

/**
 * Generates monsters using the DNA system: body + behavior + abilities + element.
 */
export class MonsterFactory {
  static create(dtl, x, y) {
    const bodyKeys = Object.keys(bodiesData);
    const bodyKey = bodyKeys[Math.floor(Math.random() * bodyKeys.length)];
    const body = bodiesData[bodyKey];

    // Get evolution tier for this DTL
    const evo = MonsterFactory.getEvolution(dtl);

    // Determine elite/champion status
    const isElite = dtl >= 3 && Math.random() < (evo.eliteChance || 0);
    const isChampion = dtl >= 7 && Math.random() < (evo.championChance || 0);

    // Scale stats
    let hp = Math.floor(body.hp * (1 + 0.25 * dtl));
    let atk = Math.floor(body.atk * (1 + 0.20 * dtl));
    let def = body.def + Math.floor(dtl / 3);
    let xp = Math.floor(body.xp * (1 + 0.15 * dtl));

    if (isElite) { hp *= 2; atk = Math.floor(atk * 1.5); }
    if (isChampion) { hp *= 3; atk *= 2; }

    // Pick element
    let element = null;
    if (Math.random() < (evo.elementChance || 0)) {
      element = ELEMENTS[1 + Math.floor(Math.random() * (ELEMENTS.length - 1))]; // Skip kinetic
    }

    // Pick behavior
    const behaviorPool = ['wander', 'patrol', 'hunt', 'guard', 'lurk', 'flee', 'support', 'swarmAI'];
    const behavior = behaviorPool[Math.floor(Math.random() * Math.min(behaviorPool.length, 3 + Math.floor(dtl / 2)))];

    // Pick abilities
    const abilityKeys = Object.keys(abilitiesData);
    const numAbilities = evo.minAbilities + Math.floor(Math.random() * (evo.maxAbilities - evo.minAbilities + 1));
    const abilities = [];
    const usedAbilities = new Set();
    for (let i = 0; i < numAbilities; i++) {
      const key = abilityKeys[Math.floor(Math.random() * abilityKeys.length)];
      if (!usedAbilities.has(key)) {
        usedAbilities.add(key);
        abilities.push(abilitiesData[key]);
      }
    }

    // Scale resistances
    const resistances = {};
    for (const [elem, baseVal] of Object.entries(body.resistances)) {
      if (baseVal >= 0) {
        resistances[elem] = Math.min(90, baseVal + Math.floor(dtl * 2));
      } else {
        resistances[elem] = baseVal - Math.floor(dtl * 1);
      }
    }

    // Determine tier and color
    const tier = dtl <= 3 ? 1 : dtl <= 6 ? 2 : 3;
    let color = TIER_COLORS[tier - 1];
    if (element && element !== 'kinetic') color = ELEMENT_COLORS[element];

    // Credits
    let credits = scalingData.credits.perMonster;
    if (isElite) credits = scalingData.credits.perElite;
    if (isChampion) credits = scalingData.credits.perChampion;

    // Loot tier
    let lootTier = 'common';
    if (isElite) lootTier = 'rare';
    if (isChampion) lootTier = 'epic';

    const name = NameGenerator.monsterName(bodyKey, isElite, isChampion);

    return new Monster({
      name,
      x, y,
      bodyType: bodyKey,
      glyph: body.glyph,
      hp, atk, def, xp,
      element,
      resistances,
      behavior,
      abilities,
      color,
      tier,
      isElite,
      isChampion,
      lootTier,
      credits
    });
  }

  static getEvolution(dtl) {
    const evos = scalingData.evolution;
    let best = evos['1'];
    for (const [key, evo] of Object.entries(evos)) {
      if (dtl >= parseInt(key)) best = evo;
    }
    return best;
  }
}
