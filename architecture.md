# Architecture & Best Practices

This document outlines the standard architecture, patterns, and best practices for developing games within the Web Games Arcade.

## 🏗️ Project Structure ("Hub-and-Spoke")

The project uses a monolithic repo structure where a shared core powers individual game modules.

```text
src/
├── core/               # Shared Engine (Do not modify without review)
│   ├── GameLoop.js     # Manages time steps (delta time)
│   ├── InputManager.js # Normalized input (Mouse/Keyboard)
│   ├── Vector2.js      # standard Math library
│   └── StorageManager.js # Persistence layer
├── ui/                 # Shared UI Components (Buttons, Overlays)
└── games/              # Game Cartridges
    ├── cosmic-breaker/ # Game A
    └── neon-flow/      # Game B
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

## 📝 Coding Standards

*   **ES Modules**: Use `import/export`.
*   **Math**: Use the shared `Vector2` class for 2D positioning.
*   **UI**: Draw game UI (Score, Lives) on the canvas. Draw Meta UI (Pause Menu, Back Button) using DOM elements in `src/ui/`.
