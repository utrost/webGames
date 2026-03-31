import { Map as ROTMap } from 'rot-js';
import { MonsterFactory } from './MonsterFactory.js';
import { ItemFactory } from './ItemFactory.js';
import scalingData from '../data/scaling.json';

const DECK_NAMES = {
  1: ['Crew Quarters', 'Dormitory', 'Mess Hall'],
  2: ['Crew Quarters B', 'Recreation Area', 'Cafeteria'],
  3: ['Research Lab Alpha', 'Containment Wing', 'Sample Storage'],
  4: ['Research Lab Beta', 'Hydroponics Bay', 'Isolation Ward'],
  5: ['Engineering West', 'Reactor Access', 'Maintenance'],
  6: ['Engineering East', 'Coolant Systems', 'Power Grid'],
  7: ['Deep Storage A', 'Cargo Hold C', 'Cryo Vault'],
  8: ['Deep Storage B', 'Freight Bay', 'Archive'],
  9: ['The Core Access', 'Anomaly Zone', 'Bio-Mass Chamber'],
  10: ['The Core', 'The Confluence', 'Ground Zero']
};

const MODIFIERS = ['dark', 'infested', 'decompressed', 'flooded', 'lockdown', 'overgrown'];

/**
 * Generates deck layouts using ROT.Map.Digger.
 */
export class DeckFactory {
  static generate(deckNumber) {
    const dtl = deckNumber; // Base DTL = deck number
    const width = 60;
    const height = 40;

    // Generate map using rot.js Digger
    const map = new Map();
    const rooms = [];
    const corridors = [];

    const digger = new ROTMap.Digger(width, height, {
      roomWidth: [4, 10],
      roomHeight: [4, 10],
      corridorLength: [2, 6],
      dugPercentage: 0.35
    });

    digger.create((x, y, value) => {
      const key = `${x},${y}`;
      if (value === 0) {
        map.set(key, 'floor');
      } else {
        map.set(key, 'wall');
      }
    });

    // Get rooms from digger
    const rotRooms = digger.getRooms();
    for (const room of rotRooms) {
      rooms.push({
        x1: room.getLeft(),
        y1: room.getTop(),
        x2: room.getRight(),
        y2: room.getBottom(),
        cx: Math.floor((room.getLeft() + room.getRight()) / 2),
        cy: Math.floor((room.getTop() + room.getBottom()) / 2)
      });

      // Mark doors
      room.getDoors((x, y) => {
        map.set(`${x},${y}`, 'door');
      });
    }

    if (rooms.length === 0) {
      // Fallback: create a simple room
      for (let x = 5; x < 25; x++) {
        for (let y = 5; y < 20; y++) {
          map.set(`${x},${y}`, 'floor');
        }
      }
      rooms.push({ x1: 5, y1: 5, x2: 24, y2: 19, cx: 15, cy: 12 });
    }

    // Pick start room and elevator room (furthest apart)
    const startRoom = rooms[0];
    let elevatorRoom = rooms[rooms.length - 1];
    let maxDist = 0;
    for (const room of rooms) {
      const dx = room.cx - startRoom.cx;
      const dy = room.cy - startRoom.cy;
      const dist = dx * dx + dy * dy;
      if (dist > maxDist) {
        maxDist = dist;
        elevatorRoom = room;
      }
    }

    // Place elevator
    const elevatorX = elevatorRoom.cx;
    const elevatorY = elevatorRoom.cy;
    map.set(`${elevatorX},${elevatorY}`, 'elevator');

    // Player start position
    const startX = startRoom.cx;
    const startY = startRoom.cy;

    // Roll deck modifiers
    const modifiers = [];
    if (deckNumber > 1) {
      const numMods = Math.min(2, Math.floor(Math.random() * 2) + 1);
      const available = [...MODIFIERS];
      for (let i = 0; i < numMods && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        modifiers.push(available.splice(idx, 1)[0]);
      }
    }

    // Calculate modifier bonus for DTL
    let modBonus = 0;
    for (const mod of modifiers) {
      modBonus += scalingData.dtl.modifiers[mod] || 0;
    }
    const effectiveDTL = deckNumber * (1.0 + modBonus);

    // Spawn monsters
    const monsters = [];
    const monsterCount = Math.floor(scalingData.deckGeneration.monstersPerDeck.base + scalingData.deckGeneration.monstersPerDeck.perDTL * dtl);
    const safeRadius = scalingData.deckGeneration.safeRadius;

    for (let i = 0; i < monsterCount; i++) {
      // Pick a random room (not start room)
      const validRooms = rooms.filter(r => {
        const dx = r.cx - startX;
        const dy = r.cy - startY;
        return Math.sqrt(dx * dx + dy * dy) > safeRadius;
      });

      if (validRooms.length === 0) continue;
      const room = validRooms[Math.floor(Math.random() * validRooms.length)];

      // Random position within room
      const mx = room.x1 + 1 + Math.floor(Math.random() * Math.max(1, room.x2 - room.x1 - 1));
      const my = room.y1 + 1 + Math.floor(Math.random() * Math.max(1, room.y2 - room.y1 - 1));

      // Don't place on elevator or another monster
      const key = `${mx},${my}`;
      if (map.get(key) === 'elevator') continue;
      if (monsters.some(m => m.x === mx && m.y === my)) continue;

      const monster = MonsterFactory.create(effectiveDTL, mx, my);
      monsters.push(monster);
    }

    // Place items
    const items = [];
    const lootRooms = rooms.filter(r => r !== startRoom && r !== elevatorRoom);

    // O2 tank in a few rooms
    for (const room of lootRooms.slice(0, Math.min(3, lootRooms.length))) {
      if (Math.random() < 0.4) {
        const item = ItemFactory.createConsumable('o2Tank');
        item.x = room.cx + (Math.random() < 0.5 ? 1 : -1);
        item.y = room.cy;
        item.onMap = true;
        items.push(item);
      }
    }

    // Equipment drops
    const numDrops = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numDrops && i < lootRooms.length; i++) {
      const room = lootRooms[Math.floor(Math.random() * lootRooms.length)];
      const item = ItemFactory.createLootDrop(deckNumber);
      if (item) {
        item.x = room.x1 + 1 + Math.floor(Math.random() * Math.max(1, room.x2 - room.x1 - 1));
        item.y = room.y1 + 1 + Math.floor(Math.random() * Math.max(1, room.y2 - room.y1 - 1));
        item.onMap = true;
        items.push(item);
      }
    }

    // Ventilation station
    if (lootRooms.length > 0) {
      const ventRoom = lootRooms[Math.floor(Math.random() * lootRooms.length)];
      map.set(`${ventRoom.cx},${ventRoom.cy}`, 'ventilation');
    }

    // Deck name
    const namePool = DECK_NAMES[deckNumber] || DECK_NAMES[10];
    const deckName = namePool[Math.floor(Math.random() * namePool.length)];
    const modString = modifiers.length > 0 ? ` (${modifiers.join(', ')})` : '';

    return {
      map,
      width,
      height,
      rooms,
      monsters,
      items,
      startX,
      startY,
      elevatorX,
      elevatorY,
      deckNumber,
      dtl: effectiveDTL,
      modifiers,
      name: `Deck ${deckNumber} — ${deckName}${modString}`
    };
  }
}
