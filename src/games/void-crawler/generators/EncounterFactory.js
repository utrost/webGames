import eventsData from '../data/events.json';
import { ItemFactory } from './ItemFactory.js';

/**
 * Generates encounter events for deck rooms.
 */
export class EncounterFactory {
  static generate(deckNumber, count = 2) {
    const available = eventsData.filter(e => e.minDeck <= deckNumber);
    const encounters = [];

    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      encounters.push({ ...available[idx] });
    }

    return encounters;
  }

  static resolve(encounter, choice, game) {
    const choiceDef = encounter.choices[choice];
    if (!choiceDef) return { message: 'Nothing happens.' };

    switch (choiceDef.effect) {
      case 'none':
        return { message: 'You move on.' };

      case 'heal':
        game.player.heal(choiceDef.value || 30);
        return { message: `Healed ${choiceDef.value || 30} HP.` };

      case 'o2Restore':
        game.o2System.add(choiceDef.value || 30);
        return { message: `+${choiceDef.value || 30} O2.` };

      case 'fullHeal':
        game.player.stats.hp = game.player.stats.maxHP;
        game.o2System.current = Math.max(0, game.o2System.current - (choiceDef.o2Cost || 30));
        return { message: `Fully healed! Lost ${choiceDef.o2Cost || 30} O2.` };

      case 'gamble': {
        if (Math.random() < (choiceDef.successRate || 0.5)) {
          const item = ItemFactory.createLootDrop(game.deckNumber);
          if (item) game.player.addToInventory(item);
          return { message: `Got ${item?.name || 'something'}!`, item };
        }
        game.player.takeDamage(choiceDef.failDamage || 15, 'explosion');
        return { message: `Explosion! Took ${choiceDef.failDamage || 15} damage.` };
      }

      case 'revealEnemies':
        game.revealAllEnemies = choiceDef.duration || 20;
        return { message: `Enemy positions revealed for ${choiceDef.duration || 20} turns.` };

      case 'resistBuff':
        for (const elem of Object.keys(game.player.resistances)) {
          game.player.resistances[elem] += choiceDef.value || 15;
        }
        return { message: `+${choiceDef.value || 15}% all resistances this deck.` };

      case 'weaponChoice': {
        const weapons = [];
        for (let i = 0; i < (choiceDef.count || 3); i++) {
          weapons.push(ItemFactory.createWeapon(game.deckNumber, 'rare'));
        }
        return { message: 'Choose a weapon.', weapons };
      }

      case 'lore':
        game.progression?.runStats && (game.progression.runStats.itemsFound++);
        return { message: 'You read the log... fragments of a terrible truth.' };

      case 'randomBuff': {
        if (Math.random() < (choiceDef.debuffChance || 0.4)) {
          game.player.stats.maxHP -= 10;
          game.player.stats.hp = Math.min(game.player.stats.hp, game.player.stats.maxHP);
          return { message: 'The anomaly drains you. -10 Max HP.' };
        }
        game.player.stats.atk += 3;
        return { message: 'The anomaly empowers you. +3 ATK!' };
      }

      default:
        return { message: 'Nothing happens.' };
    }
  }
}
