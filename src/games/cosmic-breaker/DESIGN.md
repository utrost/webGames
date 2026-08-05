# Cosmic Breaker Code Design

This documents the current code design for `src/games/cosmic-breaker/`, not future intent.

## Cartridge boundary

`index.js` exports `CosmicBreaker`, the arcade cartridge loaded by the app shell. It keeps the standard arcade interface:

- `constructor(container, onGameOver)` creates the canvas, audio/storage adapters, scaler, static paddle/ball constants, input handlers, and starting fields.
- `init()` resets state, attaches input listeners, starts `GameLoop`, and marks the cartridge running.
- `stop()` is teardown-only: clear the loop if present, destroy the scaler, remove listeners, and remove the canvas.

## Module responsibilities

- `index.js` — orchestration, game state, input, physics/collision, rendering, audio cues, persistence.
- `levels.js` — brick maps and names.
- `config.js` — canvas, paddle, ball, brick, power-up, and speed-tuning constants.
- `__tests__/levels.test.js` — level-data contracts.
- `__tests__/mechanics.test.js` — current power-up/score mechanics contracts.

## State model

Runtime state is object-oriented and canvas-local:

- Paddle: `paddle` object with position, dimensions, and color.
- Balls: array of plain objects with `pos`, `vel`, `speed`, `active`, `color`.
- Bricks: array of plain objects with rect geometry, `hp`, `maxHp`, `scoreValue`, `status`.
- Power-ups: falling rect objects with `type`, `color`, `symbol`, and `dy`.
- Particles: short-lived visual objects.
- Progression: `score`, `lives`, `currentLevel`, `difficultyLoops`, `powerupDropChance`.

## Update phases

`update(dt)` is intentionally ordered:

1. Ignore frames when stopped, paused, or game-over.
2. Move paddle from keyboard/mouse state and clamp it to the canvas.
3. Move each ball or keep inactive balls attached to the paddle.
4. Resolve wall, paddle, and brick collisions.
5. Remove lost balls and lose a life if no balls remain.
6. Move/catch/drop power-ups.
7. Advance to next level when all bricks are gone.
8. Decay screen shake and particles.

Collision uses final-position circle-vs-rect checks (`checkAABB`) rather than swept collision. This is simple and fast for current speeds, but large `dt` spikes remain the main future physics risk.

## Persistence and game-over

On final life loss, the game saves the score via `StorageManager.saveHighScore('cosmic-breaker', score)`, refreshes the local `highScore`, sets `gameOver`, and calls `onGameOver` once for the arcade shell.

## Input design

- Pointer/mouse movement sets `mouseX` for paddle aiming.
- Pointer down, touch start, `Space`, and `ArrowUp` serve inactive balls.
- Arrow keys can also move the paddle.
- `Escape` toggles pause.
- `R` restarts only from game-over by calling `resetGameState()`; it does not tear down/recreate the canvas.

## Rendering layers

`render()` draws in this order:

1. Optional shake transform.
2. Background.
3. Bricks.
4. Paddle.
5. Power-ups.
6. Balls.
7. HUD and level label.
8. Particles.
9. Pause/game-over overlays outside the shake transform.

## Current quality notes

- The cartridge is behaviorally stable and tested, but `index.js` remains large and mixes simulation, input, rendering, audio, and persistence.
- A high-value future slice would extract ball/brick collision and power-up application into pure helpers with tests.
- Wide paddle currently behaves as “until life loss,” not a timed power-up. The unused timer field is legacy and should be removed or converted into a real duration if the mechanic changes.
