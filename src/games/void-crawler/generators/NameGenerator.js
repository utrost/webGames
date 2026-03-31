const ADJECTIVES = [
  'Flickering', 'Corroded', 'Superheated', 'Frozen', 'Volatile',
  'Pulsing', 'Glitching', 'Warped', 'Decayed', 'Charged',
  'Venomous', 'Fractured', 'Mutated', 'Bloated', 'Shrieking',
  'Crawling', 'Lurking', 'Burning', 'Sparking', 'Oozing'
];

const BODY_NAMES = {
  insectoid: ['Brood-Crawler', 'Chitin-Runner', 'Mandible-Drone', 'Spine-Bug'],
  humanoid: ['Shade', 'Husk', 'Remnant', 'Wraith', 'Revenant'],
  drone: ['Sentinel', 'Watcher', 'Probe', 'Scout-Drone', 'Turret'],
  amorphous: ['Amorphic Mass', 'Gel-Blob', 'Slime', 'Bio-Mass', 'Ooze'],
  parasite: ['Leech', 'Tick', 'Brain-Worm', 'Burrower', 'Sucker'],
  swarm: ['Swarm-Cloud', 'Micro-Hive', 'Nanite-Flock', 'Mite-Wave']
};

const CHAMPION_NAMES = [
  'NEREUS', 'CHARYBDIS', 'TETHYS', 'EREBUS', 'NOCTIS',
  'TYPHON', 'SCYLLA', 'HYDRA', 'CERBERUS', 'CHIMERA'
];

const WEAPON_SUFFIXES_POOL = [
  'of the Void', 'of Endurance', 'of Haste', 'of Devastation',
  'of the Deep', 'of Ruin', 'of Fury', 'of the Storm'
];

export class NameGenerator {
  static monsterName(bodyType, isElite, isChampion) {
    if (isChampion) {
      return CHAMPION_NAMES[Math.floor(Math.random() * CHAMPION_NAMES.length)];
    }

    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const names = BODY_NAMES[bodyType] || ['Entity'];
    const base = names[Math.floor(Math.random() * names.length)];

    if (isElite) return `Elite ${adj} ${base}`;
    return `${adj} ${base}`;
  }

  static weaponName(baseName, affixes) {
    let name = baseName;
    if (affixes.length > 0) {
      const prefix = affixes.find(a => a.isPrefix);
      const suffix = affixes.find(a => !a.isPrefix);
      if (prefix) name = `${prefix.name} ${name}`;
      if (suffix) name = `${name} ${suffix.name}`;
    }
    return name;
  }

  static armorName(baseName, affixes) {
    return this.weaponName(baseName, affixes);
  }
}
