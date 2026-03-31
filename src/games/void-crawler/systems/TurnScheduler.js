/**
 * Turn-based scheduler. Manages turn order for player and monsters.
 */
export class TurnScheduler {
  constructor() {
    this.entities = [];
    this.currentIndex = 0;
    this.turnNumber = 0;
    this.playerActed = false;
    this.onTurnCallbacks = [];
  }

  add(entity) {
    this.entities.push(entity);
  }

  remove(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx !== -1) {
      this.entities.splice(idx, 1);
      if (this.currentIndex > idx) this.currentIndex--;
      if (this.currentIndex >= this.entities.length) this.currentIndex = 0;
    }
  }

  clear() {
    this.entities = [];
    this.currentIndex = 0;
    this.turnNumber = 0;
  }

  onTurn(callback) {
    this.onTurnCallbacks.push(callback);
  }

  /** Process one full turn: player acts, then all monsters act */
  processTurn(game) {
    this.turnNumber++;
    for (const cb of this.onTurnCallbacks) {
      cb(this.turnNumber, game);
    }

    // Process monster turns
    const monsters = this.entities.filter(e => e !== game.player && e.alive);
    for (const monster of monsters) {
      if (monster.alive) {
        monster.takeTurn(game);
      }
    }
  }

  getAliveMonsters() {
    return this.entities.filter(e => e.type === 'monster' && e.alive);
  }
}
