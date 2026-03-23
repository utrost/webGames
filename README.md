# Web Games Arcade

A collection of browser-based games built with vanilla JavaScript and HTML5 Canvas. Neon-retro aesthetic, no frameworks, minimal dependencies.

## Games

| Game | Genre | Status |
|---|---|---|
| **Neon Flow** | Puzzle / Routing | ✅ v1.0 |
| **Cosmic Breaker** | Breakout / Arcade | ✅ v1.0 |
| **Orbit** | Physics / Survival | ✅ v1.0 |
| **Asteroids** | Shooter / Arcade | ✅ v1.0 |
| **Neon Blocks** | Tetris / Puzzle | ✅ v1.0 |
| **Elemental Sandbox** | Falling Sand / Sim | ✅ v1.0 |

## Tech Stack

- **Vanilla JS** (ES modules, no frameworks)
- **HTML5 Canvas** for rendering
- **Web Audio API** for sound synthesis
- **Vite** for dev server and build
- **Vitest** for unit testing
- **ESLint** + **Prettier** for code quality
- Custom shared engine: GameLoop, InputManager, AudioManager, Vector2, StorageManager, ParticleSystem, StateMachine, StatsTracker, PerfMonitor

## Architecture

Hub-and-Spoke monorepo. A shared `core/` engine powers individual game modules under `src/games/`.

```
src/
├── core/                    # Shared engine modules
│   ├── GameLoop.js          # Frame timing with delta time
│   ├── Vector2.js           # 2D math library (add, scale, rotate, normalize, etc.)
│   ├── AudioManager.js      # Web Audio API wrapper (tones + sound buffers)
│   ├── StorageManager.js    # localStorage persistence (high scores, settings)
│   ├── ParticleSystem.js    # Emit/update/render particle effects
│   ├── StateMachine.js      # State transitions with enter/exit callbacks
│   ├── StatsTracker.js      # Session statistics and play time tracking
│   ├── PerfMonitor.js       # FPS counter overlay (F3 to toggle)
│   ├── CanvasScaler.js      # Responsive canvas with DPI scaling
│   ├── GamepadManager.js    # Gamepad API support
│   └── __tests__/           # Core module tests
├── games/                   # Game modules
│   ├── asteroids/           # Vector neon shooter
│   ├── cosmic-breaker/      # Breakout clone with power-ups
│   ├── elemental-sandbox/   # Falling sand cellular automata
│   ├── neon-blocks/         # Tetris with neon aesthetic
│   ├── neon-flow/           # Pipe routing puzzle with color mixing
│   └── orbit/               # Gravity physics survival
└── main.js                  # Lobby, game registry, achievements
```

Each game implements a standard interface (`constructor(container, onGameOver)`, `init()`, `stop()`) for lobby load/unload.

See [architecture.md](architecture.md) for full details and [games.md](games.md) for game specs.

## Development

```bash
npm install
npm run dev       # Start dev server (hot reload)
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Testing

Tests use [Vitest](https://vitest.dev/) and cover core engine modules and game logic.

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
```

**Test coverage:**

| Area | Test File | Tests |
|---|---|---|
| Core: Vector2 | `src/core/__tests__/Vector2.test.js` | 16 |
| Core: StorageManager | `src/core/__tests__/StorageManager.test.js` | 7 |
| Core: GameLoop | `src/core/__tests__/GameLoop.test.js` | 6 |
| Core: StateMachine | `src/core/__tests__/StateMachine.test.js` | 12 |
| Core: ParticleSystem | `src/core/__tests__/ParticleSystem.test.js` | 13 |
| Core: PerfMonitor | `src/core/__tests__/PerfMonitor.test.js` | 6 |
| Core: StatsTracker | `src/core/__tests__/StatsTracker.test.js` | 8 |
| Asteroids: Entities | `src/games/asteroids/__tests__/Entities.test.js` | 13 |
| Cosmic Breaker: Levels | `src/games/cosmic-breaker/__tests__/levels.test.js` | 10 |
| Neon Blocks: Shapes | `src/games/neon-blocks/__tests__/Shapes.test.js` | 12 |
| Neon Flow: Logic | `src/games/neon-flow/__tests__/Logic.test.js` | 19 |
| Orbit: Physics | `src/games/orbit/__tests__/Physics.test.js` | 14 |
| Elemental Sandbox: Sim | `src/games/elemental-sandbox/__tests__/Simulation.test.js` | 23 |
| **Total** | | **162** |

## Prerequisites

- Node.js 18+
- npm

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Private repository. All rights reserved.
