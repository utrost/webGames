import { FOV } from 'rot-js';

/**
 * Field of View system using rot.js shadowcasting.
 * Manages three tile states: visible, remembered, unexplored.
 */
export class FOVSystem {
  constructor() {
    this.visible = new Set();
    this.remembered = new Set();
    this.fov = new FOV.PreciseShadowcasting(this._lightPasses.bind(this));
    this.map = null;
  }

  setMap(map) {
    this.map = map;
  }

  _lightPasses(x, y) {
    if (!this.map) return false;
    const tile = this.map.get(`${x},${y}`);
    return tile && tile !== 'wall';
  }

  compute(playerX, playerY, sightRadius) {
    // Move currently visible tiles to remembered
    for (const key of this.visible) {
      this.remembered.add(key);
    }
    this.visible.clear();

    this.fov.compute(playerX, playerY, sightRadius, (x, y, r, visibility) => {
      if (visibility > 0) {
        this.visible.add(`${x},${y}`);
        this.remembered.add(`${x},${y}`);
      }
    });
  }

  isVisible(x, y) {
    return this.visible.has(`${x},${y}`);
  }

  isRemembered(x, y) {
    return this.remembered.has(`${x},${y}`);
  }

  getState(x, y) {
    const key = `${x},${y}`;
    if (this.visible.has(key)) return 'visible';
    if (this.remembered.has(key)) return 'remembered';
    return 'unexplored';
  }

  reset() {
    this.visible.clear();
    this.remembered.clear();
  }
}
