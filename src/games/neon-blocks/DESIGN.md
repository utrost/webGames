# Neon Blocks Code Design

This documents the current code design for `src/games/neon-blocks/`, not future intent.

## Cartridge boundary

`index.js` exports `NeonBlocks`, the arcade cartridge loaded by the app shell. It keeps the standard interface:

- `constructor(container, onGameOver)` creates canvas, adapters, scaler, dimensions, and high score.
- `init()` resets game state, attaches keyboard and gesture listeners, starts `GameLoop`.
- `stop()` stops the loop if present, destroys scaling, removes listeners, and removes the canvas.

## Module responsibilities

- `index.js` — game orchestration, grid state, input, Tetromino movement, scoring, rendering, particles, audio, persistence.
- `Shapes.js` — tetromino matrices and colors.
- `config.js` — canvas, grid, scoring, drop, lock-delay, and gesture constants.
- `__tests__/Shapes.test.js` — shape data contracts.
- `__tests__/NeonBlocks.test.js` — gameplay and scoring contracts.

## State model

- `grid`: 20×10 array of `null` or color values.
- `player`: active piece with `type`, `matrix`, `color`, and `pos`.
- `nextPiece`: next 7-bag piece object.
- `holdPiece`: held piece object, also preserving `type`.
- `bag`: shuffled 7-bag type list.
- Progression: `score`, `level`, `linesCleared`, `dropCounter`, `dropInterval`.
- Lock state: `isLanding`, `lockTimer`, `lockResets`, `hasHeld`.

Pieces now carry a canonical `type` (`I`, `L`, `J`, `O`, `T`, `S`, `Z`) alongside matrix/color so tests and future debug UI can reason about piece identity without inferring from shape.

## Gameplay helpers

Core rules are methods on the cartridge:

- `_pullFromBag()` — 7-bag randomizer.
- `collide(arena, player)` — explicit wall/floor/occupied-cell collision. Spawn-above-grid is allowed by ignoring negative `arenaY` occupied checks.
- `merge(arena, player)` — writes active piece into grid.
- `arenaSweep()` — clears full rows, updates score/level/drop interval.
- `_lockPiece()` — merge, sweep, spawn next piece.
- `_resetLockDelay()` — bounded lock-delay reset on valid movement/rotation.

## Update phases

`update(dt)` is ordered as:

1. Ignore paused/game-over frames.
2. Check whether one row below collides.
3. Start/advance lock timer when landing.
4. Lock piece when lock delay expires.
5. Advance automatic drop when not landing.
6. Update particles and level-up flash.

## Input design

- Keyboard: arrows move/drop/rotate, `Space` hard drops, `C` holds, `Escape` pauses, `R` restarts after game-over.
- Mouse/touch gestures map tap to rotate, horizontal swipes to move, vertical swipe/drop to soft/hard drop.
- Gesture thresholds are centralized in `config.js`.

## Rendering layers

`render()` draws:

1. Background.
2. Optional level-up flash.
3. Grid lines and locked cells.
4. Ghost piece.
5. Active piece.
6. Particles.
7. Grid border.
8. Side panel: score, high score, level, lines, next, hold, controls hint.
9. Pause/game-over overlays.

## Current quality notes

- Config and shape data are separated, and several gameplay contracts are tested.
- `index.js` remains large and combines logic, rendering, input, audio, and persistence.
- The highest-value future slice is extracting pure grid/piece helpers into `Logic.js` so tests exercise production helpers directly instead of mirroring logic in test-local helpers.
