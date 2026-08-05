# Template Game Code Design

This is a copy-start template for new game cartridges. Replace every template-specific section with facts about the implemented game before release.

## Cartridge boundary

`index.js` exports a game class that follows the arcade shell contract:

- `constructor(container, onGameOver)` creates the canvas and shared adapters.
- `init()` resets state, attaches listeners, starts `GameLoop`, and marks the cartridge running.
- `stop()` tears down loop, scaler, listeners, and canvas.
- `resetGameState()` resets transient game state without destroying/recreating DOM.

## Module responsibilities

Expected split for a real game:

- `index.js` — cartridge orchestration, lifecycle, input wiring, rendering, persistence, audio.
- `config.js` — balance and layout constants.
- `Logic.js` or `Entities.js` — pure/testable game rules where useful.
- `__tests__/...` — rule, lifecycle, input, and data contract tests.

## State model

Document runtime state here. Include:

- player/enemy/projectile/entity state
- score/lives/level progression
- transient timers/cooldowns
- restart/game-over/paused flags
- persistent storage keys

## Update phases

Document the order of `update(dt)` here. Example:

1. Return early when paused or game-over.
2. Translate input into commands.
3. Advance timers.
4. Move entities.
5. Resolve collisions.
6. Apply scoring/lives/progression.
7. Remove dead entities and spawn effects.

## Input design

Document mouse, keyboard, and touch mappings. The same content should also exist as controls metadata in `src/app/gameRegistry.js` and in `docs/how-to-play.md`.

## Rendering layers

Document canvas draw order from background to overlays. Include HUD, pause, game-over, and any debug/preview layers.

## Current quality notes

Before release, replace this with real notes about the implemented game:

- What is well-separated and tested?
- What is intentionally simple?
- Which future refactor should happen before this cartridge grows larger?
