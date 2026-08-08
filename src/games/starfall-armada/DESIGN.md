# Starfall Armada Code Design

## Cartridge boundary

`StarfallArmada` is a self-contained canvas cartridge. The arcade shell only depends on the standard cartridge interface:

- `constructor(container, onGameOver)` creates the canvas and persistence/audio helpers.
- `init()` resets state, attaches input, and starts the `GameLoop`.
- `stop()` stops the loop, removes all listeners, destroys the scaler, and removes the canvas.
- `resetGameState()` starts a fresh run without tearing down the cartridge instance.

The game stores its high score under `starfall-armada` and reports terminal game-over through the shell callback exactly once per run.

## Module responsibilities

- `index.js`: game state, input translation, update loop, collision checks, scoring, waves, and rendering.
- `config.js`: canvas size and balance constants for movement, formation, shots, fire cadence, and wave pacing.
- `__tests__/mechanics.test.js`: renderer-light mechanics contracts for formation, movement, firing, scoring, wave progression, and defeat.

## State model

The state is intentionally plain data:

- `player`: defender rectangle, lives, invincibility timer.
- `aliens`: formation cells with row/column metadata and score value.
- `playerShots` / `alienShots`: rectangle projectiles with velocities.
- `formationDirection`, `formationSpeed`, `wave`, `nextWaveTimer`: wave movement and pacing.
- `touchState` / `keys`: input state translated into the same movement/fire actions.

No DOM object is stored inside gameplay entities, which keeps the mechanics directly testable.

## Update phases

The frame update exits early for pause/game-over, then runs deterministic phases in order:

1. `updatePlayer(dt)` reads keyboard/touch state, clamps movement, and fires through the shared shot helper.
2. `updateShots(dt)` advances projectiles and removes off-screen shots.
3. `updateFormation(dt)` moves the armada, reverses at boundaries, and descends on edge hits.
4. `updateAlienFire(dt)` selects bottom-column aliens for bombs.
5. `handleCollisions()` resolves player-shot/alien and alien-shot/player hits.
6. `updateExplosions(dt)` expires short-lived visual bursts.
7. `checkWaveOrDefeat(dt)` starts the next wave or ends the run when the armada breaches the line.

## Input design

Keyboard, mouse, and touch are deliberately thin adapters:

- Keyboard keeps `keys.ArrowLeft`, `keys.ArrowRight`, and `keys.Space` state.
- Mouse uses lower-screen regions so desktop pointer play matches touch behavior.
- Touch processes all active points and can combine movement/fire regions.
- All fire inputs call `firePlayerShot()`, preserving the one-active-shot rule across modalities.

## Rendering layers

Rendering is ordered back-to-front:

1. dark neon grid background
2. breach/defense line
3. defender ship
4. alien formation
5. player and alien shots
6. short explosion rings
7. HUD
8. pause/game-over overlays

The rendering code reads current state only; gameplay mutation stays in update/collision methods.

## Current quality notes

- Player movement is clamped at the canvas edge.
- The defender can only keep one shot active, preserving the classic pressure rhythm.
- Alien formation reversal and descent are centralized in `updateFormation()`.
- Only bottom aliens in each column can fire, making bombs visually fair.
- Alien fire avoids directly targeting the idle defender when other shooter columns are available, preserving a fair opening window.
- Keyboard, mouse, and touch all feed the same `keys`/`touchState` movement and `firePlayerShot()` behavior.
- Future improvement: add destructible shields as their own tested data model before rendering damage masks.
