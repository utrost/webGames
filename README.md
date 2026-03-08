# Web Games Arcade

A collection of browser-based games built with vanilla JavaScript and HTML5 Canvas. Neon-retro aesthetic, no frameworks, minimal dependencies.

## Games

| Game | Genre | Status |
|---|---|---|
| **Neon Flow** | Puzzle / Routing | ✅ v1.0 |
| **Cosmic Breaker** | Breakout / Arcade | ✅ v1.0 |
| **Orbit** | Physics / Survival | ✅ v1.0 |
| **Asteroids** | Shooter / Arcade | ✅ v1.0 |
| **Neon Blocks** | Tetris / Puzzle | 🚧 In Progress |
| **Elemental Sandbox** | Falling Sand / Sim | 🔴 Not Started |

## Tech Stack

- **Vanilla JS** (ES modules, no frameworks)
- **HTML5 Canvas** for rendering
- **Vite** for dev server and build
- Custom shared engine: GameLoop, InputManager, AudioManager, Vector2, StorageManager

## Architecture

Hub-and-Spoke monorepo. A shared `core/` engine powers individual game modules under `src/games/`.

```
src/
├── core/           # Shared engine (GameLoop, Input, Audio, Vector2, Storage)
├── ui/             # Shared components (Button, Overlay)
└── games/          # Game modules
    ├── asteroids/
    ├── cosmic-breaker/
    ├── neon-blocks/
    ├── neon-flow/
    └── orbit/
```

Each game implements a standard interface (`init`, `destroy`, `resize`) for lobby load/unload.

See [architecture.md](architecture.md) for full details and [games.md](games.md) for game specs.

## Development

```bash
npm install
npm run dev       # Start dev server (hot reload)
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Prerequisites

- Node.js 18+
- npm

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Private repository. All rights reserved.
