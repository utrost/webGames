# Web Games Arcade

A collection of web-based arcade and creational games built with modern web technologies. This project features a modular "Hub-and-Spoke" architecture where a shared core engine powers multiple distinct game experiences.

## 🎮 Vision
To create a "virtual console" feel where users can select from a variety of arcade-style (action) and creational (generative/puzzle) games. The focus is on:
*   **Aesthetics**: Neon, glowing, premium UI.
*   **Performance**: Vanilla JS + Canvas/WebGL.
*   **Modularity**: Easy to add new "cartridges" (games).

## 🏗️ Architecture
The project uses a **Hub-and-Spoke** architecture:

*   **`src/core/`**: The shared game engine. Handles common tasks so individual games don't have to.
    *   `GameLoop.js`: Manages the requestAnimationFrame loop and delta time.
    *   `InputManager.js`: Normalizes keyboard, mouse, and touch input.
    *   `AudioManager.js`: Wraps the Web Audio API for sound effects and music.
    *   `StorageManager.js`: Handles data persistence (High Scores, Settings). *Currently using LocalStorage (MVP).*
    *   `Vector2.js`: Common math utility for 2D physics/movement.
*   **`src/ui/`**: Reusable UI components (Buttons, Overlays) to maintain a consistent "Arcade" theme across all games.
*   **`src/games/`**: Each game lives in its own isolated folder here.

### Folder Structure
```text
webGames/
├── index.html              # The "Arcade Lobby" (Game Selection Menu)
├── package.json            # Dependencies and scripts
├── public/                 # Static assets
└── src/
    ├── main.js             # Entry point for the Lobby
    ├── style.css           # Global "Arcade" theme
    ├── core/               # Shared Engine
    ├── ui/                 # Shared UI
    └── games/              # Individual Game Modules
```

## 💾 Persistence strategy
**Current Status: MVP (Tier 1)**
*   Data is saved to the browser's `localStorage`.
*   Includes: High Scores, Unlockables, Settings.

**Future Roadmap (Tier 2)**
*   Integration with a backend (e.g., Supabase/Firebase) for global leaderboards.

## 🚀 Getting Started

### Prerequisites
*   Node.js installed.

### Setup
1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open your browser to the local URL provided (usually `http://localhost:5173`).

## 🛠️ Tech Stack
*   **Vite**: Build tool and dev server.
*   **Vanilla JavaScript**: Core logic.
*   **HTML5 Canvas**: High-performance 2D rendering.
*   **Custom Arcade Physics**: Tailored physics engines for specific game feels (e.g., Breakout mechanics).
*   **CSS3**: UI and effects.
