# Architecture & Best Practices

This document outlines the standard architecture, patterns, and best practices for developing games within the Web Games Arcade.

## 🏗️ Project Structure ("Hub-and-Spoke")

The project uses a monolithic repo structure where a shared core powers individual game modules.

```text
src/
├── core/                    # Shared Engine (Do not modify without review)
│   ├── GameLoop.js          # Manages time steps (delta time)
│   ├── Vector2.js           # 2D math library (add, scale, rotate, normalize, dist, dot, angle)
│   ├── InputManager.js      # Normalized input (Mouse/Keyboard)
│   ├── GamepadManager.js    # Gamepad API support
│   ├── AudioManager.js      # Web Audio API wrapper (tones + buffers)
│   ├── StorageManager.js    # Persistence layer (high scores, settings)
│   ├── ParticleSystem.js    # Emit, update, render particles
│   ├── StateMachine.js      # State transitions with enter/exit callbacks
│   ├── StatsTracker.js      # Session statistics and play time tracking
│   ├── PerfMonitor.js       # FPS counter overlay
│   ├── CanvasScaler.js      # Responsive canvas with DPI handling
│   └── __tests__/           # Unit tests for core modules
├── ui/                      # Shared UI Components (Buttons, Overlays)
└── games/                   # Game Cartridges
    ├── asteroids/           # Neon vector shooter
    ├── cosmic-breaker/      # Breakout clone
    ├── elemental-sandbox/   # Falling sand simulation
    ├── neon-blocks/         # Tetris clone
    ├── neon-flow/           # Pipe routing puzzle
    └── orbit/               # Gravity physics survival
```

## 🧩 Game Interface

Every game **MUST** be a class that implements the following interface. This allows the Lobby to load/unload it generically.

```javascript
/* src/games/your-game/index.js */
export class YourGame {
  /**
   * @param {HTMLElement} container - The DOM element to render into.
   * @param {Function} onGameOver - Callback to trigger when game ends.
   */
  constructor(container, onGameOver) { ... }

  /**
   * Initialize resources, event listeners, and start the loop.
   */
  init() { ... }

  /**
   * Clean up resources, remove listeners, and destroy DOM elements.
   * CRITICAL: Failure here causes memory leaks.
   */
  stop() { ... }
}
```

## 🎮 Physics & Mechanics

**Recommendation: Use Custom Arcade Physics over Heavy Engines.**

For arcade-style games (Breakout, Space Invaders), general-purpose engines like Matter.js are often too "mushy" or non-deterministic.
*   **Custom Loops**: Implement your own `update(dt)` using `pos += vel * dt`.
*   **AABB Collision**: Use simple Axis-Aligned Bounding Box checks for responsiveness.
*   **"Game Feel"**: Prioritize mechanics like "Coyote Time", input buffering, and "English" (angle control) over realistic simulation.

## 💾 State Management

*   **Game Loop**: Use `src/core/GameLoop.js`. Do not write your own `requestAnimationFrame`.
*   **Paused State**: Games should support a paused state where `update()` is skipped but `render()` continues (for UI overlays).
*   **Persistence**: Use `StorageManager` for saving high scores.
    ```javascript
    import { StorageManager } from '../../core/StorageManager.js';
    const storage = new StorageManager();
    storage.saveHighScore('game-id', 1000);
    ```

## 🎨 Asset Management

*   **Audio**: Use `AudioManager` (Web Audio API wrapper) to prevent browser autoplay policies from blocking sound.
*   **Images**: Preload assets in `init()` before starting the game loop if possible.

## 🧪 Testing

Unit tests use **Vitest** and live in `__tests__/` directories next to the modules they test.

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

**What to test:**
- Pure logic modules (physics, math, data structures, state machines)
- Entity constructors and properties
- Config/data validation (level definitions, shape matrices)
- Storage and persistence behavior

**What NOT to test:**
- Canvas rendering (requires browser DOM)
- Audio playback (requires Web Audio context)
- Full game integration (requires browser environment)

**Mocking patterns:**
- `localStorage`: Create a mock object and assign to `globalThis.localStorage`
- `requestAnimationFrame`: Use `vi.stubGlobal()` to provide a controlled callback queue
- `Date.now()`: Use `vi.spyOn(Date, 'now')` for time-dependent tests

## 📝 Coding Standards

*   **ES Modules**: Use `import/export`.
*   **Math**: Use the shared `Vector2` class for 2D positioning.
*   **UI**: Draw game UI (Score, Lives) on the canvas. Draw Meta UI (Pause Menu, Back Button) using DOM elements in `src/ui/`.
