# Neon Flow Code Design

This documents the current code design for `src/games/neon-flow/`, not future intent.

## Cartridge boundary

`index.js` exports `NeonFlow`, the arcade cartridge loaded by the app shell. It keeps the standard interface:

- `constructor(container, onGameOver)` creates canvas, adapters, scaler, cursor/input handlers, color-blind display metadata, and local state.
- `init()` resets the campaign, attaches pointer/touch/keyboard listeners, starts `GameLoop`, and marks the cartridge running.
- `stop()` clears delayed level-transition timers, stops the loop if present, destroys scaling, removes listeners, and removes the canvas.

## Module responsibilities

- `index.js` — canvas/UI orchestration, input, level progression, particle effects, audio, persistence, rendering.
- `Logic.js` — renderer-free grid and pipe-flow model: tiles, rotation, connectivity, BFS flow propagation, color matching, and win condition.
- `levels.js` — authored level maps.
- `config.js` — grid/canvas constants.
- `__tests__/Logic.test.js` — pure flow, rotation, and color-matching contracts.

## State model

- `Grid` owns the current level state: tile positions, rotations, active colors, and win-condition checks.
- `NeonFlow` owns progression state: `currentLevelIndex`, per-level `moves`, campaign `totalMoves`, cursor, particles, paused/running flags, and delayed transition timer.
- A solved level schedules a short `levelAdvanceTimer`; the timer is cleared on restart/stop so callbacks cannot mutate a stopped game.

## Flow model

`Grid.calculateFlow()` clears active colors, seeds the queue from source tiles, and propagates through pipe connections. Sources and sinks currently have permissive endpoint connection semantics: they connect/receive from all directions, while sinks terminate propagation. This is deliberately documented because it is the key rule contributors need to understand before authoring new levels or changing endpoint behavior.

## Update phases

`update(dt)` only handles visual particles. Core puzzle behavior is event-driven: rotate a tile, recalculate flow, check win condition, then schedule level advancement.

Campaign completion is centralized in `completeCampaign()`:

1. Set `gameOver` once.
2. Save `totalMoves` as the high-score metric.
3. Refresh local `highScore` from storage.
4. Call `onGameOver` for the arcade shell.

## Input design

- Pointer move updates mouse position and cursor.
- Pointer down and touch start rotate the tile under the pointer when not paused.
- Arrow keys move the cursor.
- `Space`/`Enter` rotate the selected tile.
- `R` clears any pending level transition and restarts from level 1.
- `Escape` toggles pause.

## Rendering layers

`render()` draws:

1. Background.
2. Grid and cursor highlight.
3. Sources, sinks, and pipes.
4. Active flow glow on pipes.
5. HUD with level/move count.
6. Flow particles.
7. Pause overlay.

Color-blind mode uses text symbols on sources/sinks. Pattern metadata exists for future visual pattern work but is not currently rendered.

## Current quality notes

- The pure `Logic.js` split is strong: most puzzle rules are testable without canvas.
- Main risk is that `index.js` still combines rendering, input, progression, storage, particles, and audio.
- Future high-value refactors: extract shared color utilities, make source/sink endpoint semantics explicit in named helpers, and add level-data validation tests for every authored level.
