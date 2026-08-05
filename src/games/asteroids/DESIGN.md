# Asteroids Code Design

This documents the current code design for `src/games/asteroids/`, not future intent.

## Cartridge boundary

`index.js` exports `Asteroids`, the arcade cartridge loaded by the app shell. It keeps the standard interface:

- `constructor(container, onGameOver)` creates canvas, adapters, scaler, and persistent high score.
- `init()` resets state, attaches keyboard/touch/mouse listeners, starts `GameLoop`.
- `stop()` tears down the loop, scaler, listeners, and canvas.

## Module responsibilities

- `index.js` — game orchestration, spawning, input, collisions, wave progression, scoring, rendering, audio, persistence.
- `Entities.js` — renderer-aware but self-contained entity classes: `Ship`, `Asteroid`, `Bullet`, `Particle`.
- `config.js` — canvas constants and tuning hooks.
- `__tests__/Entities.test.js` — entity contracts.
- `__tests__/GameMechanics.test.js` — integration contracts for asteroid splitting, restart state, and edge spawning.

## State model

- `entities`: canonical live list for update/render/removal.
- `asteroids`: tracked asteroid list kept in sync for wave/split bookkeeping and protected by tests.
- `ship`: current player ship or removed ship waiting for respawn.
- `touchState`: normalized command state for touch/mouse regions.
- Progression: `score`, `lives`, `shootCooldown`, `respawnTimer`, `waveDelay`, `gameOver`, `paused`.

`resetGameState()` resets all transient wave and respawn state before spawning the initial ship and first wave.

## Update phases

`update(dt)` is ordered as:

1. Restart from game-over on `R`.
2. Ignore paused/game-over frames.
3. Apply ship rotation/thrust/fire input.
4. Handle respawn countdown.
5. Update and wrap all entities.
6. Remove dead entities.
7. Resolve bullet-vs-asteroid collisions.
8. Resolve ship-vs-asteroid collisions when not invincible.
9. Spawn next wave after a short delay when no live asteroids remain.

## Entity design

`Entities.js` contains small classes with their own update/render behavior:

- `Ship` — triangle ship, inertia, invincibility rendering.
- `Asteroid` — random polygon shape, split size, drifting velocity.
- `Bullet` — fixed lifetime projectile.
- `Particle` — short-lived explosion/thrust particles.

## Input design

- Keyboard: arrows rotate/thrust, `Space` fires, `Escape` pauses, `R` restarts from game-over.
- Touch/mouse regions map screen areas to rotate left, rotate right, thrust, and fire.
- Region control is normalized into `touchState` so update logic reads one command shape.

## Rendering layers

`render()` draws:

1. Background.
2. All entities.
3. Touch control hints on touch-capable devices.
4. HUD: score, high score, lives.
5. Pause overlay.
6. Game-over overlay.

## Current quality notes

- Entity classes keep many moving pieces out of the cartridge.
- The duplicate `asteroids` list is the main maintainability risk; tests now protect consistency, but a future refactor should derive live asteroids from `entities` or centralize all add/remove operations.
- Randomness is still global (`Math.random`), which keeps tests broad rather than deterministic.
