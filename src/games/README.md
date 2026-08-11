# Games Directory

All individual games live in their own subdirectories here. Each playable game is a standalone cartridge that imports shared resources from `../../core` and is registered by `src/app/gameRegistry.js`.

## Current Games

| Directory | Game | Key Modules |
|---|---|---|
| `asteroids/` | Asteroids | `index.js`, `Entities.js`, `config.js`, `DESIGN.md` |
| `circuit-chase/` | Circuit Chase | `index.js`, `Logic.js`, `levels.js`, `config.js`, `DESIGN.md` |
| `cosmic-breaker/` | Cosmic Breaker | `index.js`, `levels.js`, `config.js`, `DESIGN.md` |
| `elemental-sandbox/` | Elemental Sandbox | `index.js`, `Simulation.js`, `Elements.js`, `config.js`, `DESIGN.md` |
| `neon-blocks/` | Neon Blocks | `index.js`, `Shapes.js`, `config.js`, `DESIGN.md` |
| `neon-flow/` | Neon Flow | `index.js`, `Logic.js`, `levels.js`, `config.js`, `DESIGN.md` |
| `orbit/` | Orbit | `index.js`, `Physics.js`, `Entities.js`, `config.js`, `DESIGN.md` |
| `starfall-armada/` | Starfall Armada | `index.js`, `config.js`, `DESIGN.md` |

Each game folder includes a `DESIGN.md` that documents the current code design: cartridge boundary, module responsibilities, state model, update order, input model, render layers, and known quality notes.

## Template and Checklist

Use `_template/` only as a copy-start scaffold. It is not registered in the lobby and should not be treated as a playable game.

Before adding a new classic, follow the [new-game checklist](../../docs/new-game-checklist.md). The checklist defines the quality gate for lifecycle, tests, controls metadata, docs, local verification, browser smoke, CI, deploy, and live verification.

## Game Interface

Every playable game must export a class with:

```javascript
export class YourGame {
    constructor(container, onGameOver) { /* create canvas/adapters */ }
    init() { /* reset state, add listeners, start GameLoop */ }
    stop() { /* stop loop, destroy scaler, remove listeners/canvas */ }
    resetGameState() { /* restart without teardown/re-init */ }
}
```

## Adding a New Game

1. Copy `_template/` to a new folder, e.g. `my-game/`.
2. Rename `TemplateGame` and replace placeholder behavior with the smallest playable slice.
3. Add a `config.js` for shared game constants.
4. Split testable rules into separate modules, e.g. `Logic.js`, `Entities.js`, or `Physics.js`.
5. Add tests in a local `__tests__/` directory.
6. Add controls metadata in `src/app/gameRegistry.js`.
7. Add user-facing controls to `docs/how-to-play.md`.
8. Update README, `games.md`, this directory README, and the game `DESIGN.md`.
9. Run the full local quality gate before committing.
