# Games Directory

All individual games live in their own subdirectories here. Each game is a standalone module that imports shared resources from `../core`.

## Current Games

| Directory | Game | Key Modules |
|---|---|---|
| `asteroids/` | Asteroids | `index.js`, `Entities.js`, `config.js` |
| `cosmic-breaker/` | Cosmic Breaker | `index.js`, `levels.js`, `config.js` |
| `elemental-sandbox/` | Elemental Sandbox | `index.js`, `Simulation.js`, `Elements.js`, `config.js` |
| `neon-blocks/` | Neon Blocks | `index.js`, `Shapes.js`, `config.js` |
| `neon-flow/` | Neon Flow | `index.js`, `Logic.js`, `levels.js`, `config.js` |
| `orbit/` | Orbit | `index.js`, `Physics.js`, `Entities.js`, `config.js` |

## Game Interface

Every game must export a class with:

```javascript
export class YourGame {
    constructor(container, onGameOver) { /* ... */ }
    init() { /* Start game loop, set up listeners */ }
    stop() { /* Clean up: remove listeners, cancel animation frames */ }
}
```

## Adding a New Game

1. Create a new folder, e.g., `my-game/`
2. Add an `index.js` as the entry point implementing the game interface above
3. Add a `config.js` for game constants
4. Split logic into separate modules (e.g., `Entities.js`, `Physics.js`)
5. Add tests in `__tests__/` directory
6. Register the game in `src/main.js`
