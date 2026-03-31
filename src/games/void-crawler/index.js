import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { InputManager } from '../../core/InputManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';

import { Player } from './entities/Player.js';
import { TurnScheduler } from './systems/TurnScheduler.js';
import { FOVSystem } from './systems/FOVSystem.js';
import { O2System } from './systems/O2System.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { ProgressionSystem } from './systems/ProgressionSystem.js';
import { DeckFactory } from './generators/DeckFactory.js';
import { ItemFactory } from './generators/ItemFactory.js';
import { EncounterFactory } from './generators/EncounterFactory.js';
import { TileRenderer } from './rendering/TileRenderer.js';
import { Camera } from './rendering/Camera.js';
import { Effects } from './rendering/Effects.js';
import { HUD } from './ui/HUD.js';
import { Inventory } from './ui/Inventory.js';
import { Minimap } from './ui/Minimap.js';
import { MessageLog } from './ui/MessageLog.js';
import { SalvageShop } from './ui/SalvageShop.js';

const TILE_SIZE = 16;
const DESIGN_WIDTH = 640;
const DESIGN_HEIGHT = 480;

// Movement key mappings
const MOVE_KEYS = {
  // Cardinal
  'ArrowUp': [0, -1], 'ArrowDown': [0, 1], 'ArrowLeft': [-1, 0], 'ArrowRight': [1, 0],
  'KeyW': [0, -1], 'KeyS': [0, 1], 'KeyA': [-1, 0], 'KeyD': [1, 0],
  // Diagonal
  'KeyQ': [-1, -1], 'KeyE': [1, -1], 'KeyZ': [-1, 1], 'KeyC': [1, 1],
  'Numpad7': [-1, -1], 'Numpad9': [1, -1], 'Numpad1': [-1, 1], 'Numpad3': [1, 1],
  'Numpad8': [0, -1], 'Numpad2': [0, 1], 'Numpad4': [-1, 0], 'Numpad6': [1, 0]
};

/**
 * Void Crawler — Roguelite Sci-Fi Horror
 * Standard game interface: constructor(container, onGameOver), init(), stop()
 */
export class VoidCrawler {
  constructor(container, onGameOver) {
    this.container = container;
    this.onGameOver = onGameOver;

    // Canvas setup
    this.canvas = document.createElement('canvas');
    this.canvas.width = DESIGN_WIDTH;
    this.canvas.height = DESIGN_HEIGHT;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.container.appendChild(this.canvas);
    this.scaler = new CanvasScaler(this.canvas, DESIGN_WIDTH, DESIGN_HEIGHT);

    // Core
    this.audio = new AudioManager();
    this.input = new InputManager(this.canvas);
    this.gameLoop = null;

    // Game state
    this.state = 'shop'; // 'shop', 'playing', 'dead', 'paused', 'encounter'
    this.deckNumber = 1;
    this.deckName = '';
    this.turnNumber = 0;
    this.dtl = 1;

    // Systems
    this.progression = new ProgressionSystem();
    this.messageLog = new MessageLog();
    this.combatSystem = new CombatSystem(this.messageLog);
    this.turnScheduler = new TurnScheduler();
    this.fovSystem = new FOVSystem();
    this.o2System = null;

    // Map
    this.map = new Map();
    this.mapWidth = 60;
    this.mapHeight = 40;

    // Entities
    this.player = null;
    this.monsters = [];
    this.items = [];
    this.elevatorX = 0;
    this.elevatorY = 0;

    // Rendering
    this.camera = new Camera(DESIGN_WIDTH, DESIGN_HEIGHT, TILE_SIZE);
    this.tileRenderer = new TileRenderer(this.ctx, this.camera, TILE_SIZE);
    this.effects = new Effects(this.ctx, this.canvas);
    this.hud = new HUD();
    this.minimap = new Minimap();
    this.inventory = new Inventory();
    this.salvageShop = new SalvageShop();

    // Encounters
    this.encounters = [];
    this.currentEncounter = null;
    this.revealAllEnemies = 0;

    // Input state
    this.inputCooldown = 0;
    this.keyHandler = null;
  }

  init() {
    this.setupAudio();
    this.keyHandler = (e) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
    this.gameLoop.start();

    // Show shop first
    this.salvageShop.show(() => this.startNewRun());
    this.messageLog.add('Welcome to EREBUS-7. Buy upgrades, then descend.', '#00fff5');
  }

  stop() {
    if (this.gameLoop) this.gameLoop.stop();
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    if (this.input) this.input.destroy();
    if (this.scaler) this.scaler.destroy();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  setupAudio() {
    this.sounds = {
      footstep: () => this.audio.playTone(80, 'square', 0.04),
      attack: () => this.audio.playTone(200, 'sawtooth', 0.08),
      hit: () => this.audio.playTone(100, 'square', 0.1),
      pickup: () => this.audio.playTone(600, 'sine', 0.08),
      rarePickup: () => {
        this.audio.playTone(500, 'sine', 0.1);
        setTimeout(() => this.audio.playTone(700, 'sine', 0.1), 100);
        setTimeout(() => this.audio.playTone(900, 'sine', 0.15), 200);
      },
      door: () => this.audio.playTone(150, 'sawtooth', 0.15),
      elevator: () => this.audio.playTone(60, 'sawtooth', 0.5),
      o2Warning: () => this.audio.playTone(440, 'square', 0.15),
      o2Critical: () => {
        this.audio.playTone(880, 'square', 0.1);
        setTimeout(() => this.audio.playTone(880, 'square', 0.1), 150);
      },
      death: () => this.audio.playTone(50, 'sawtooth', 0.8),
      monsterAlert: () => this.audio.playTone(300, 'triangle', 0.06),
      combo: () => {
        this.audio.playTone(400, 'sine', 0.1);
        setTimeout(() => this.audio.playTone(800, 'sine', 0.15), 100);
      },
      thermal: () => this.audio.playTone(250, 'sawtooth', 0.08),
      cryo: () => this.audio.playTone(1200, 'sine', 0.06),
      shock: () => this.audio.playTone(600, 'square', 0.05),
      acid: () => this.audio.playTone(100, 'triangle', 0.1),
      ambient: () => this.audio.playTone(40, 'sine', 0.3)
    };
  }

  // =================== RUN MANAGEMENT ===================

  startNewRun() {
    this.deckNumber = 1;
    this.turnNumber = 0;
    this.progression.resetRunStats();
    this.messageLog.clear();

    // Create player with upgraded stats
    const stats = this.progression.getModifiedStats();
    this.player = new Player(stats);
    this.o2System = new O2System(stats.o2);

    // Give starting items from upgrades
    if (stats.startStim) {
      const stim = ItemFactory.createConsumable('stimPack');
      this.player.addToInventory(stim);
    }

    this.messageLog.add('Entering EREBUS-7...', '#00fff5');
    this.generateDeck(this.deckNumber);
    this.state = 'playing';
  }

  generateDeck(deckNum) {
    const deck = DeckFactory.generate(deckNum);

    this.map = deck.map;
    this.mapWidth = deck.width;
    this.mapHeight = deck.height;
    this.monsters = deck.monsters;
    this.items = deck.items;
    this.elevatorX = deck.elevatorX;
    this.elevatorY = deck.elevatorY;
    this.dtl = deck.dtl;
    this.deckName = deck.name;

    // Place player
    this.player.x = deck.startX;
    this.player.y = deck.startY;

    // Setup FOV
    this.fovSystem.reset();
    this.fovSystem.setMap(this.map);
    this.fovSystem.compute(this.player.x, this.player.y, this.player.getEffectiveSight());

    // Setup turn scheduler
    this.turnScheduler.clear();
    this.turnScheduler.add(this.player);
    for (const monster of this.monsters) {
      this.turnScheduler.add(monster);
    }

    // Generate encounters
    this.encounters = EncounterFactory.generate(deckNum);

    // Camera
    this.camera.follow(this.player.x, this.player.y);

    this.messageLog.add(deck.name, '#00fff5');
    if (deck.modifiers.length > 0) {
      this.messageLog.add(`Modifiers: ${deck.modifiers.join(', ')}`, '#ffe100');
    }

    this.progression.runStats.decksReached = deckNum;
  }

  descendElevator() {
    if (this.deckNumber >= 10) {
      // Victory!
      this.messageLog.add('You escaped EREBUS-7! Victory!', '#ffd700');
      this.endRun('Escaped!');
      return;
    }

    this.sounds.elevator();
    this.deckNumber++;
    this.messageLog.add(`Descending to Deck ${this.deckNumber}...`, '#ffffff');
    this.progression.addCredits(15); // Credits per deck
    this.generateDeck(this.deckNumber);
  }

  endRun(causeOfDeath) {
    this.state = 'dead';
    const stats = this.progression.endRun(causeOfDeath);
    this.sounds.death();
    this.messageLog.add(`Run Over: ${causeOfDeath}`, '#ff0040');
  }

  // =================== INPUT ===================

  handleKeyDown(e) {
    if (this.inputCooldown > 0) return;

    const code = e.code;

    // Global keys
    if (code === 'Escape') {
      if (this.inventory.visible) { this.inventory.close(); return; }
      if (this.currentEncounter) { this.currentEncounter = null; return; }
      if (this.state === 'playing') { this.state = 'paused'; return; }
      if (this.state === 'paused') { this.state = 'playing'; return; }
    }

    // Shop state
    if (this.state === 'shop' || this.salvageShop.visible) {
      this.salvageShop.handleInput(code, this.progression);
      return;
    }

    // Dead state
    if (this.state === 'dead') {
      if (code === 'Enter' || code === 'Space') {
        this.state = 'shop';
        this.salvageShop.show(() => this.startNewRun());
      }
      return;
    }

    // Paused
    if (this.state === 'paused') return;

    // Encounter
    if (this.currentEncounter) {
      this.handleEncounterInput(code);
      return;
    }

    // Inventory
    if (this.inventory.visible) {
      this.inventory.handleInput(code, this.player, this);
      return;
    }

    // Playing state
    if (this.state !== 'playing') return;

    // UI toggles
    if (code === 'KeyI') { this.inventory.toggle(); return; }
    if (code === 'KeyM') { this.minimap.toggle(); return; }

    // Quick-use inventory (1-6)
    if (code >= 'Digit1' && code <= 'Digit6') {
      const idx = parseInt(code.charAt(5)) - 1;
      if (this.player.inventory[idx]?.type === 'consumable') {
        this.player.useItem(idx, this);
        this.endPlayerTurn();
      }
      return;
    }

    // Wait
    if (code === 'Space') {
      this.messageLog.add('Waiting...', '#555555');
      this.endPlayerTurn();
      return;
    }

    // Movement / attack
    const dir = MOVE_KEYS[code];
    if (dir) {
      e.preventDefault();
      this.tryMovePlayer(dir[0], dir[1]);
      return;
    }

    // Interact
    if (code === 'Enter') {
      this.tryInteract();
      return;
    }
  }

  tryMovePlayer(dx, dy) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    const key = `${nx},${ny}`;
    const tile = this.map.get(key);

    // Wall check
    if (!tile || tile === 'wall') return;

    // Monster check — bump to attack
    const monster = this.getMonsterAt(nx, ny);
    if (monster) {
      const result = this.combatSystem.attack(this.player, monster, this);
      this.sounds.attack();
      this.messageLog.add(
        `You hit ${monster.name} for ${result.finalDamage}! ${result.statusApplied ? `(${result.statusApplied})` : ''}`,
        '#39ff14'
      );
      if (result.combo) {
        this.sounds.combo();
        this.progression.runStats.combosTriggered++;
      }
      if (result.element && result.element !== 'kinetic') {
        this.sounds[result.element]?.();
      }
      this.progression.runStats.damageDealt += result.finalDamage;

      if (result.killed) {
        this.onMonsterKilled(monster);
      }

      // Screen effects
      const screenPos = this.camera.toScreen(nx, ny);
      this.effects.spawnParticles(
        screenPos.x + TILE_SIZE / 2,
        screenPos.y + TILE_SIZE / 2,
        monster.color,
        8
      );

      this.endPlayerTurn();
      return;
    }

    // Move
    this.player.x = nx;
    this.player.y = ny;
    this.sounds.footstep();

    // Pick up items
    this.tryPickupItems(nx, ny);

    // Check special tiles
    if (tile === 'door') {
      this.sounds.door();
      this.map.set(key, 'floor');
      this.messageLog.add('Door opened.', '#555555');
    }

    if (tile === 'ventilation') {
      this.o2System.add(30);
      this.map.set(key, 'floor');
      this.messageLog.add('Ventilation station: +30 O2', '#00bfff');
      this.sounds.pickup();
    }

    // Check encounter
    this.checkEncounters(nx, ny);

    this.endPlayerTurn();
  }

  tryInteract() {
    const tile = this.map.get(`${this.player.x},${this.player.y}`);
    if (tile === 'elevator') {
      this.descendElevator();
      return;
    }

    // Check adjacent tiles for interactables
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const adjTile = this.map.get(`${this.player.x + dx},${this.player.y + dy}`);
        if (adjTile === 'elevator') {
          this.player.x += dx;
          this.player.y += dy;
          this.descendElevator();
          return;
        }
      }
    }
  }

  tryPickupItems(x, y) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.onMap || item.x !== x || item.y !== y) continue;

      if (item.type === 'consumable') {
        if (this.player.addToInventory(item)) {
          this.items.splice(i, 1);
          this.messageLog.add(`Picked up ${item.name}`, '#ffe100');
          this.sounds.pickup();
          this.progression.runStats.itemsFound++;
        } else {
          this.messageLog.add('Inventory full!', '#ff0040');
        }
      } else {
        // Equipment — auto-pickup to inventory
        if (this.player.addToInventory(item)) {
          this.items.splice(i, 1);
          const { color } = item.getDisplayName();
          this.messageLog.add(`Found: ${item.name}`, color);
          if (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary') {
            this.sounds.rarePickup();
          } else {
            this.sounds.pickup();
          }
          this.progression.runStats.itemsFound++;
        } else {
          this.messageLog.add('Inventory full! [I] to manage', '#ff0040');
        }
      }
    }
  }

  checkEncounters(x, y) {
    // Simple proximity check — encounters trigger near room centers
    if (this.encounters.length === 0) return;
    // 10% chance per move to trigger an encounter
    if (Math.random() > 0.1) return;

    this.currentEncounter = this.encounters.pop();
    this.messageLog.add(`[EVENT] ${this.currentEncounter.name}`, '#ff00ff');
    this.messageLog.add(this.currentEncounter.description, '#aaaaaa');
    for (let i = 0; i < this.currentEncounter.choices.length; i++) {
      this.messageLog.add(`  [${i + 1}] ${this.currentEncounter.choices[i].label}`, '#ffffff');
    }
  }

  handleEncounterInput(code) {
    if (!this.currentEncounter) return;
    const choices = this.currentEncounter.choices;

    for (let i = 0; i < choices.length; i++) {
      if (code === `Digit${i + 1}`) {
        const result = EncounterFactory.resolve(this.currentEncounter, i, this);
        this.messageLog.add(result.message, '#ff00ff');
        this.currentEncounter = null;
        return;
      }
    }
  }

  onMonsterKilled(monster) {
    this.messageLog.add(`${monster.name} destroyed!`, '#ffd700');
    this.turnScheduler.remove(monster);
    this.progression.runStats.monstersKilled++;

    // Credits
    const credits = this.progression.addCredits(monster.credits);

    // Loot drop
    if (monster.isElite || monster.isChampion || Math.random() < 0.4) {
      const loot = ItemFactory.createLootDrop(this.deckNumber, monster.lootTier === 'epic' ? 'epic' : null);
      if (loot) {
        loot.x = monster.x;
        loot.y = monster.y;
        loot.onMap = true;
        this.items.push(loot);
      }
    }
  }

  endPlayerTurn() {
    this.turnNumber++;
    this.inputCooldown = 80; // ms between inputs

    // O2 tick
    const o2Mods = {};
    if (this.player.armor?.o2Mult) o2Mods.o2Mult = this.player.armor.o2Mult;
    const o2Result = this.o2System.tick(this.player, o2Mods);
    if (o2Result.depleted) {
      this.messageLog.add(`Suffocating! -${o2Result.damage} HP`, '#ff0040');
      this.progression.runStats.damageTaken += o2Result.damage;
    }

    // O2 warnings
    if (this.o2System.isCritical()) {
      this.sounds.o2Critical();
    } else if (this.o2System.isLow()) {
      this.sounds.o2Warning();
    }

    // Player status effects
    this.combatSystem.processStatusEffects(this.player);
    this.player.processTurnBuffs();

    // Check player death
    if (!this.player.alive) {
      this.endRun('Killed in action');
      return;
    }

    // Monster turns
    this.turnScheduler.processTurn(this);

    // Check player death again after monster turns
    if (!this.player.alive) {
      this.endRun('Killed in action');
      return;
    }

    // Reveal enemy timer
    if (this.revealAllEnemies > 0) this.revealAllEnemies--;

    // Update FOV
    this.fovSystem.compute(this.player.x, this.player.y, this.player.getEffectiveSight());
    this.camera.follow(this.player.x, this.player.y);

    // Remove dead monsters from list
    this.monsters = this.monsters.filter(m => m.alive);
  }

  getMonsterAt(x, y) {
    return this.monsters.find(m => m.alive && m.x === x && m.y === y) || null;
  }

  // =================== UPDATE & RENDER ===================

  update(dt) {
    // Input cooldown
    if (this.inputCooldown > 0) {
      this.inputCooldown -= dt * 1000;
    }

    // Effects
    this.effects.update(dt);
  }

  render() {
    const ctx = this.ctx;

    // Apply screen shake
    const shake = this.effects.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    if (this.state === 'playing' || this.state === 'paused' || this.state === 'dead') {
      // Render game world
      this.tileRenderer.render(this);

      // Effects
      this.effects.render();

      // UI
      this.hud.render(ctx, this);
      this.minimap.render(ctx, this);
      this.messageLog.render(ctx, 8, ctx.canvas.height - 90, ctx.canvas.width - 16);

      // Inventory overlay
      this.inventory.render(ctx, this.player);

      // Elevator hint
      if (this.map.get(`${this.player.x},${this.player.y}`) === 'elevator') {
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('[Enter] Descend', ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
        ctx.textAlign = 'left';
      }

      // Pause overlay
      if (this.state === 'paused') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#00fff5';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('[Esc] Resume', ctx.canvas.width / 2, ctx.canvas.height / 2 + 25);
        ctx.textAlign = 'left';
      }

      // Death screen
      if (this.state === 'dead') {
        this.renderDeathScreen(ctx);
      }
    }

    // Shop overlay
    if (this.state === 'shop' || this.salvageShop.visible) {
      if (this.state === 'shop') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Title
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#00fff5';
        ctx.textAlign = 'center';
        ctx.fillText('VOID CRAWLER', ctx.canvas.width / 2, 40);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#555555';
        ctx.fillText('EREBUS-7 Salvage Operation', ctx.canvas.width / 2, 58);
        ctx.textAlign = 'left';
      }
      this.salvageShop.render(ctx, this.progression);
    }

    ctx.restore();
  }

  renderDeathScreen(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    let y = h / 2 - 100;

    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ff0040';
    ctx.fillText('SIGNAL LOST', w / 2, y);
    y += 30;

    ctx.font = '11px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(this.progression.runStats.causeOfDeath, w / 2, y);
    y += 30;

    // Stats
    const stats = this.progression.runStats;
    const lines = [
      `Decks Reached: ${stats.decksReached}`,
      `Monsters Killed: ${stats.monstersKilled}`,
      `Damage Dealt: ${stats.damageDealt}`,
      `Damage Taken: ${stats.damageTaken}`,
      `Items Found: ${stats.itemsFound}`,
      `Combos Triggered: ${stats.combosTriggered}`,
      `Credits Earned: ${stats.creditsEarned}`
    ];

    ctx.font = '11px monospace';
    for (const line of lines) {
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(line, w / 2, y);
      y += 16;
    }

    y += 20;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Total Credits: ${this.progression.credits}`, w / 2, y);
    y += 30;

    const blink = Math.sin(Date.now() / 400) > 0;
    if (blink) {
      ctx.fillStyle = '#00fff5';
      ctx.font = '12px monospace';
      ctx.fillText('[Enter] Salvage Shop', w / 2, y);
    }

    ctx.textAlign = 'left';
  }
}
