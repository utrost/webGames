# Orbit Code Design

This documents the current code design for `src/games/orbit/`, not future intent.

## Cartridge boundary

`index.js` exports `Orbit`, the arcade cartridge loaded by the app shell. It keeps the standard interface:

- `constructor(container, onGameOver)` creates canvas, adapters, scaler, `Physics`, and top-level game fields.
- `init()` resets state, attaches input listeners, starts `GameLoop`.
- `stop()` stops the loop, destroys scaler, removes listeners, and removes the canvas.

## Module responsibilities

- `index.js` — game orchestration, wave spawning, input, scoring, particles, rendering, storage, and lifecycle.
- `Entities.js` — renderer-free body classes: `Body`, `Sun`, `Planet`, `Comet`, `Projectile`.
- `Physics.js` — gravity, Verlet integration, collision resolution, and prediction.
- `config.js` — canvas-independent balance constants: difficulty ramp, launch scale, comet spawn distance/speed, despawn distance, score.
- `__tests__/Physics.test.js` — entity, physics, cloning, launch-scale, and game-over lifecycle contracts.

## State model

- `bodies`: array of `Sun`, `Planet`, `Comet`, and `Projectile` simulation bodies.
- `sun`: central static body with HP and damage callback.
- `particles`: visual-only hit/death particles.
- `keyboardLaunch`: renderer-independent launch point and aim vector for keyboard play.
- Progression: `score`, `waveTimer`, `waveDifficulty`, `planetCount`, `gameOver`, `paused`.

Bodies are renderer-free and do not store canvas objects. `clone()` preserves subclass-relevant simulation state so trajectory prediction can safely simulate copies without mutating live bodies.

## Update phases

`update(dt)` is ordered as:

1. Ignore frames when game-over or paused.
2. Apply slow-motion time scale while dragging.
3. Advance wave timer and spawn comets.
4. Increase wave difficulty up to the configured cap.
5. Run physics update over all bodies.
6. Count live planets for score multiplier.
7. Age projectiles.
8. Remove far/dead bodies and play planet death feedback.
9. Advance particles.
10. End the game if sun HP reaches zero.

Game-over is centralized in `endGame()`, which saves score, refreshes high score, and calls `onGameOver` exactly once.

## Physics design

`Physics` applies pairwise gravity, integrates bodies with Verlet-like position updates, resolves overlapping bodies, and can predict a projectile path by cloning the bodies and simulating forward. Collision callbacks are still invoked from physics, so scoring is currently attached to projectile collision callbacks in `index.js`. A future quality slice should return collision events from physics and let `Orbit` consume them.

## Input design

- Mouse/touch drag: drag from launch point, release to fire. Drag uses `CONFIG.LAUNCH_SCALE`.
- Keyboard: arrows move launch point, WASD changes aim, `Space` fires.
- `Escape` toggles pause.
- `R` restarts from game-over by resetting state.

## Rendering layers

`render()` draws:

1. Background.
2. Bodies with glow.
3. Drag trajectory prediction or keyboard launch reticle.
4. Particles.
5. HUD: score, high score, sun integrity, planets/multiplier.
6. Pause/game-over overlays.

## Current quality notes

- Entity and physics modules are reasonably separated and tested.
- `index.js` still owns too much orchestration, rendering, particles, audio, and scoring.
- Main future improvement: turn physics collision side effects into explicit collision events, then unit-test scoring and sun-damage flows without canvas.
