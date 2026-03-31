/**
 * Viewport camera that follows the player. Works in tile coordinates.
 */
export class Camera {
  constructor(viewWidth, viewHeight, tileSize) {
    this.tileSize = tileSize;
    this.viewWidth = viewWidth;   // viewport in pixels
    this.viewHeight = viewHeight;
    this.x = 0; // top-left tile coordinate
    this.y = 0;
    this.tilesX = Math.ceil(viewWidth / tileSize);
    this.tilesY = Math.ceil(viewHeight / tileSize);
  }

  follow(playerX, playerY) {
    this.x = playerX - Math.floor(this.tilesX / 2);
    this.y = playerY - Math.floor(this.tilesY / 2);
  }

  /** Convert world tile coords to screen pixel coords */
  toScreen(tileX, tileY) {
    return {
      x: (tileX - this.x) * this.tileSize,
      y: (tileY - this.y) * this.tileSize
    };
  }

  /** Check if a tile is within the viewport */
  isVisible(tileX, tileY) {
    return tileX >= this.x && tileX < this.x + this.tilesX &&
           tileY >= this.y && tileY < this.y + this.tilesY;
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.tilesX = Math.ceil(viewWidth / this.tileSize);
    this.tilesY = Math.ceil(viewHeight / this.tileSize);
  }
}
