import elementsData from '../data/elements.json';

/**
 * Combat system implementing the full damage formula from DESIGN.md.
 * Handles elemental damage, resistances, status effects, and combos.
 */
export class CombatSystem {
  constructor(messageLog) {
    this.messageLog = messageLog;
  }

  /**
   * Calculate and apply damage from attacker to defender.
   * @returns {{ finalDamage: number, killed: boolean, statusApplied: string|null, combo: string|null }}
   */
  attack(attacker, defender, game) {
    const weapon = attacker.getWeapon ? attacker.getWeapon() : null;
    const element = weapon?.element || 'kinetic';

    // 1. Base ATK
    let baseATK = (weapon?.atk || 0) + (attacker.stats?.atk || attacker.atk || 0);

    // 2. Element bonus from affixes
    let elementBonus = 0;
    if (weapon?.affixes) {
      for (const affix of weapon.affixes) {
        if (affix.effect === 'element' && affix.element === element) {
          elementBonus += affix.value;
        }
      }
    }

    // 3. Raw damage
    let rawDamage = baseATK * (1 + elementBonus);

    // 4. Resistance
    const resistance = this.getEffectiveResistance(defender, element);

    // 5. After resistance
    let afterResist = rawDamage * (1 - resistance / 100);

    // 6. After DEF
    const defenderDEF = defender.stats?.def ?? defender.def ?? 0;
    let afterDEF = Math.max(1, afterResist - defenderDEF);

    // 7. Combo bonus
    let combo = this.checkCombo(defender, element);
    let comboMult = 1;
    if (combo) {
      comboMult = combo.damageMult || 1;
      if (combo.name) {
        this.messageLog?.add(`${combo.name}!`, combo.color || '#ff00ff');
      }
    }

    // 8. Overload bonus (shock status)
    if (defender.statusEffects?.has('overload')) {
      afterDEF *= 1.3;
      defender.statusEffects.delete('overload');
    }

    // Final damage
    const finalDamage = Math.max(1, Math.floor(afterDEF * comboMult));

    // Apply damage
    const killed = defender.takeDamage(finalDamage, element);

    // Apply status effect
    const statusApplied = this.applyStatusEffect(defender, element);

    // Weapon durability
    if (weapon && weapon.durability !== undefined) {
      weapon.durability--;
      if (weapon.durability <= 0) {
        this.messageLog?.add(`${weapon.name} breaks!`, '#ff0040');
        if (attacker.onWeaponBreak) attacker.onWeaponBreak();
      }
    }

    // Lifesteal
    if (weapon?.affixes) {
      for (const affix of weapon.affixes) {
        if (affix.effect === 'lifesteal') {
          const heal = Math.floor(finalDamage * affix.value);
          attacker.heal(heal);
        }
      }
    }

    // Alarm system - combat noise alerts nearby enemies
    if (game && !weapon?.silent) {
      this.triggerAlarm(attacker, game);
    }

    return {
      finalDamage,
      killed,
      statusApplied,
      combo: combo?.name || null,
      element
    };
  }

  getEffectiveResistance(entity, element) {
    if (element === 'kinetic' && !entity.resistances) return 0;
    const base = entity.resistances?.[element] || 0;
    return Math.min(90, base); // Cap at 90%
  }

  applyStatusEffect(target, element) {
    const elemData = elementsData[element];
    if (!elemData?.statusEffect) return null;

    const effect = elemData.statusEffect;
    if (!target.statusEffects) target.statusEffects = new Map();

    switch (element) {
      case 'thermal':
        target.statusEffects.set('burn', {
          name: 'Burn',
          damage: effect.damage,
          duration: effect.duration,
          turnsLeft: effect.duration
        });
        return 'Burn';

      case 'cryo': {
        const existing = target.statusEffects.get('chill');
        if (existing && existing.stacks >= 1) {
          target.statusEffects.delete('chill');
          target.statusEffects.set('freeze', {
            name: 'Freeze',
            stun: true,
            duration: 1,
            turnsLeft: 1
          });
          return 'Freeze';
        }
        target.statusEffects.set('chill', {
          name: 'Chill',
          speedMult: effect.speedMult,
          duration: effect.duration,
          turnsLeft: effect.duration,
          stacks: (existing?.stacks || 0) + 1
        });
        return 'Chill';
      }

      case 'shock':
        target.statusEffects.set('overload', {
          name: 'Overload',
          nextHitBonus: effect.nextHitBonus,
          turnsLeft: 1
        });
        return 'Overload';

      case 'acid': {
        const existing = target.statusEffects.get('corrode');
        const stacks = Math.min((existing?.stacks || 0) + 1, 5);
        target.statusEffects.set('corrode', {
          name: 'Corrode',
          defReduction: effect.defReduction * stacks,
          duration: effect.duration,
          turnsLeft: effect.duration,
          stacks
        });
        return 'Corrode';
      }
    }
    return null;
  }

  checkCombo(target, element) {
    if (!target.statusEffects) return null;
    const combos = elementsData.combos;

    for (const combo of combos) {
      const [elem1, elem2] = combo.elements;
      if (element === elem2 || element === elem1) {
        // Check if target has the other element's status
        if (element === 'kinetic' && target.statusEffects.has('freeze')) {
          return { name: 'Shatter', damageMult: 2.0, color: '#00bfff' };
        }
        if (element === 'acid' && target.statusEffects.has('burn')) {
          return { name: 'Meltdown', damageMult: 1.5, color: '#ff6600' };
        }
        if (element === 'thermal' && target.statusEffects.has('corrode')) {
          return { name: 'Meltdown', damageMult: 1.5, color: '#ff6600' };
        }
      }
    }
    return null;
  }

  processStatusEffects(entity) {
    if (!entity.statusEffects) return;

    for (const [key, effect] of entity.statusEffects) {
      switch (key) {
        case 'burn':
          entity.takeDamage(effect.damage, 'thermal');
          break;
        case 'corrode':
          // DEF reduction is passive
          break;
        case 'freeze':
          entity.frozen = true;
          break;
        case 'chill':
          // Speed reduction is passive
          break;
      }

      effect.turnsLeft--;
      if (effect.turnsLeft <= 0) {
        entity.statusEffects.delete(key);
        if (key === 'freeze') entity.frozen = false;
      }
    }
  }

  triggerAlarm(source, game) {
    if (!game.monsters) return;
    const alarmRadius = 10;
    for (const monster of game.monsters) {
      if (!monster.alive || monster.alerted) continue;
      const dx = monster.x - source.x;
      const dy = monster.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= alarmRadius) {
        monster.alerted = true;
        monster.behavior = 'hunt';
      }
    }
  }
}
