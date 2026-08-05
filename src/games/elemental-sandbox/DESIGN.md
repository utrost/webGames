# Elemental Sandbox Code Design

This documents the current code design for `src/games/elemental-sandbox/`, not future intent.

## Cartridge boundary

`index.js` exports `ElementalSandbox`, the arcade cartridge loaded by the app shell. It keeps the standard interface:

- `constructor(container, onGameOver)` creates canvas, adapters, scaler, `Simulation`, UI state, and control references.
- `init()` resets state, builds DOM controls, attaches input listeners, starts `GameLoop`.
- `stop()` tears down listeners, controls, loop, scaler, and canvas.

## Module responsibilities

- `index.js` — canvas/DOM orchestration, painting input, keyboard shortcuts, UI controls, rendering, pause/lifecycle.
- `Simulation.js` — renderer-free falling-sand grid and element update rules.
- `Elements.js` — element IDs, display metadata, color helpers.
- `config.js` — canvas, grid, brush, and simulation-speed constants.
- `__tests__/Simulation.test.js` — pure simulation contracts.

## State model

`Simulation` owns the cellular automaton data:

- `grid`: `Uint8Array` element IDs.
- `colors`: `Uint32Array` packed display colors.
- `updated`: `Uint32Array` frame flags.
- `frame`: monotonic simulation frame counter.

The cartridge owns UI state: selected element, brush size, pause state, mouse/touch painting state, and keyboard brush cursor.

## Simulation design

`Simulation.step()` increments the frame, alternates horizontal scan direction to reduce bias, then scans bottom-up. Each element type delegates to a method:

- `updateSand()` — powder falling and sinking through liquids.
- `updateWater()` — falling liquid with diagonal and sideways spread.
- `updateOil()` — liquid, water-floating, flammable.
- `updateFire()` — water-to-steam priority, random death/rise, ignition of flammables.
- `updateAcid()` — dissolves selected solids/plants, then behaves like liquid.
- `updatePlant()` — grows into adjacent water.
- `updateSteam()` / `updateSmoke()` — rising gases with decay/condensation.

`swap()` marks both moved cells as updated for the current frame. `set(..., { markUpdated: true })` marks transformed cells so newly created fire/steam/smoke/plant cannot immediately act again in the same frame. Plain `set()` remains available for setup and painting.

## Input and UI design

- Mouse/touch drag paints on the grid.
- Brush painting interpolates between pointer positions so fast strokes do not leave gaps.
- Buttons select elements, adjust brush size, pause/resume, and clear.
- Keyboard shortcuts select elements, move the brush cursor, paint, resize brush, clear, and pause.

## Rendering layers

`render()` draws:

1. Background.
2. Simulation cells from `grid`/`colors`.
3. Brush cursor/preview.
4. Pause overlay when needed.
5. DOM controls are outside the canvas in `.sandbox-ui`.

## Current quality notes

- `Simulation.js` is the strongest separation in this game: most behavior is testable without DOM/canvas.
- `index.js` still mixes DOM controls, painter behavior, rendering, and shortcuts.
- Future high-value slices: inject deterministic RNG into `Simulation`, extract shared liquid movement helpers, and extract a `SandboxPainter` helper for brush circle/line interpolation tests.
