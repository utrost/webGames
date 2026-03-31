import { StorageManager } from '../../../core/StorageManager.js';
import scalingData from '../data/scaling.json';

const SAVE_KEY = 'void-crawler';

/**
 * Manages credits, permanent upgrades, and run statistics.
 */
export class ProgressionSystem {
  constructor() {
    this.storage = new StorageManager();
    this.upgrades = this.loadUpgrades();
    this.credits = this.loadCredits();
    this.runStats = this.createRunStats();
  }

  createRunStats() {
    return {
      decksReached: 0,
      monstersKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      o2Used: 0,
      combosTriggered: 0,
      itemsFound: 0,
      creditsEarned: 0,
      causeOfDeath: ''
    };
  }

  loadUpgrades() {
    const saved = this.storage.getSettings(SAVE_KEY);
    return saved?.upgrades || {};
  }

  loadCredits() {
    const saved = this.storage.getSettings(SAVE_KEY);
    return saved?.credits || 0;
  }

  save() {
    this.storage.saveSettings(SAVE_KEY, {
      upgrades: this.upgrades,
      credits: this.credits
    });
  }

  getUpgradeLevel(upgradeId) {
    return this.upgrades[upgradeId] || 0;
  }

  canAfford(upgradeId) {
    const def = scalingData.upgrades.find(u => u.id === upgradeId);
    if (!def) return false;
    const level = this.getUpgradeLevel(upgradeId);
    if (level >= def.maxLevel) return false;
    return this.credits >= def.costs[level];
  }

  purchaseUpgrade(upgradeId) {
    const def = scalingData.upgrades.find(u => u.id === upgradeId);
    if (!def || !this.canAfford(upgradeId)) return false;
    const level = this.getUpgradeLevel(upgradeId);
    this.credits -= def.costs[level];
    this.upgrades[upgradeId] = level + 1;
    this.save();
    return true;
  }

  addCredits(amount) {
    const efficiencyLevel = this.getUpgradeLevel('salvageEfficiency');
    const bonus = 1 + efficiencyLevel * scalingData.credits.salvageEfficiencyMult;
    const total = Math.floor(amount * bonus);
    this.credits += total;
    this.runStats.creditsEarned += total;
    this.save();
    return total;
  }

  /** Apply permanent upgrades to base player stats */
  getModifiedStats() {
    const base = { ...scalingData.player };
    const mods = {};

    for (const upgradeDef of scalingData.upgrades) {
      const level = this.getUpgradeLevel(upgradeDef.id);
      if (level === 0) continue;
      const value = upgradeDef.valuePerLevel * level;

      switch (upgradeDef.effect) {
        case 'hp': mods.bonusHP = value; break;
        case 'o2': mods.bonusO2 = value; break;
        case 'atk': mods.bonusATK = value; break;
        case 'sight': mods.bonusSight = value; break;
        case 'dodge': mods.dodgeChance = value; break;
        case 'wrenchAtk': mods.wrenchBonus = value; break;
        case 'revealElevator': mods.revealElevator = true; break;
        case 'startStim': mods.startStim = true; break;
      }
    }

    return {
      hp: base.baseHP + (mods.bonusHP || 0),
      o2: base.baseO2 + (mods.bonusO2 || 0),
      atk: base.baseATK + (mods.bonusATK || 0),
      def: base.baseDEF,
      sight: base.baseSight + (mods.bonusSight || 0),
      speed: base.baseSpeed,
      dodgeChance: mods.dodgeChance || 0,
      wrenchBonus: mods.wrenchBonus || 0,
      revealElevator: mods.revealElevator || false,
      startStim: mods.startStim || false
    };
  }

  endRun(causeOfDeath) {
    this.runStats.causeOfDeath = causeOfDeath;

    // Ensure minimum credits per run
    const minCredits = scalingData.credits.minPerRun || 80;
    if (this.runStats.creditsEarned < minCredits) {
      const bonus = minCredits - this.runStats.creditsEarned;
      this.credits += bonus;
      this.runStats.creditsEarned += bonus;
    }

    // Save high score (decks reached)
    this.storage.saveHighScore('void-crawler', this.runStats.decksReached);
    this.save();
    return { ...this.runStats };
  }

  resetRunStats() {
    this.runStats = this.createRunStats();
  }

  getUpgradeDefinitions() {
    return scalingData.upgrades.map(def => ({
      ...def,
      currentLevel: this.getUpgradeLevel(def.id),
      nextCost: this.getUpgradeLevel(def.id) < def.maxLevel
        ? def.costs[this.getUpgradeLevel(def.id)]
        : null,
      canAfford: this.canAfford(def.id)
    }));
  }
}
