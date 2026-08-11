# Circuit Chase Code Design

Circuit Chase is an original neon maze-chase cartridge inspired by classic dot-collection maze games without copying their names, art, characters, or level layouts.

## Cartridge boundary

`CircuitChase` follows the arcade cartridge contract:

- `constructor(container, onGameOver)` creates the canvas and shared adapters.
- `init()` resets state, attaches input, and starts the `GameLoop`.
- `stop()` stops the loop, destroys scaling, removes listeners, and removes the canvas.
- `resetGameState()` restarts a run without teardown/re-init.

## Module responsibilities

- `index.js`: DOM/canvas lifecycle, update loop, score/lives/high score, rendering, input adapters.
- `Logic.js`: renderer-independent maze helpers: map parsing, walkability, movement, direction math, and hunter pathfinding.
- `levels.js`: static tile-map source of truth.
- `config.js`: canvas, timing, scoring, and balance constants.

## State model

The level is a small ASCII grid:

- `#`: wall.
- `.`: score dot.
- `P`: power node.
- `S`: player start.
- `H`: hunter home/start.
- `T`: horizontal wrap tunnel.
- space: open corridor.

`createMazeState()` converts that map into plain data sets for walls, dots, power nodes, player start, and hunter starts. This keeps maze semantics testable without a canvas.

## Update Order

1. Skip updates when paused, stopped, or game-over.
2. Count down respawn invincibility and frightened mode.
3. Advance the player on a fixed grid interval.
4. Collect dots/power nodes on the player tile.
5. Advance hunters on their own fixed grid interval.
6. Resolve hunter/player tile collisions.

## Hunter AI

Hunters use `findNextHunterDirection()` from `Logic.js`:

- Chase mode picks the next legal direction that minimizes shortest-path distance to the player.
- Frightened mode picks a legal direction that maximizes distance from the player.
- Direct reversals are avoided when another legal route exists, so hunters feel less jittery.

This is intentionally simple but already extracted for future maze games or smarter personalities.

## Input Model

- Keyboard: Arrow keys or WASD queue the next grid turn.
- Mouse: drag/swipe on the canvas queues a direction.
- Touch: swipe queues a direction via the same direction translation as mouse.
- Esc pauses; R restarts after game over.

Input only changes queued direction or pause/restart state. Movement remains grid-timed in the update loop.

## Rendering layers

1. Background.
2. HUD.
3. Maze wall outlines.
4. Dots and power nodes.
5. Hunters.
6. Player.
7. Pause/game-over overlay.

## Current quality notes

- Maze/pathfinding logic has renderer-free tests.
- Cartridge mechanics cover start state, collection, power mode, frightened hunter scoring, and life/game-over behavior.
- Input modality coverage verifies keyboard and swipe turn queuing.
