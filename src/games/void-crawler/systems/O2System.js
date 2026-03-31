/**
 * Oxygen management system. Ticks down each turn. Drains HP when depleted.
 */
export class O2System {
  constructor(maxO2 = 200) {
    this.maxO2 = maxO2;
    this.current = maxO2;
    this.consumptionRate = 1.5;
    this.depletionDamage = 5;
    this.alarmThreshold = 50;
    this.criticalThreshold = 20;
  }

  tick(player, modifiers = {}) {
    let rate = this.consumptionRate;

    // Armor modifier (e.g. Exo-Frame)
    if (modifiers.o2Mult) rate *= modifiers.o2Mult;

    // Deck modifier
    if (modifiers.deckO2Mult) rate *= modifiers.deckO2Mult;

    this.current = Math.max(0, this.current - rate);

    if (this.current <= 0) {
      player.takeDamage(this.depletionDamage, 'suffocation');
      return { depleted: true, damage: this.depletionDamage };
    }

    return { depleted: false, damage: 0 };
  }

  add(amount) {
    this.current = Math.min(this.maxO2, this.current + amount);
  }

  isLow() {
    return this.current <= this.alarmThreshold;
  }

  isCritical() {
    return this.current <= this.criticalThreshold;
  }

  getPercent() {
    return this.current / this.maxO2;
  }

  reset(maxO2) {
    this.maxO2 = maxO2;
    this.current = maxO2;
  }
}
