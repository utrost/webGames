# Web Games Arcade

A collection of web-based arcade and creational games built with modern web technologies. This project features a modular "Hub-and-Spoke" architecture where a shared core engine powers multiple distinct game experiences.

## 🎮 Vision
To create a "virtual console" feel where users can select from a variety of arcade-style (action) and creational (generative/puzzle) games. The focus is on:
*   **Aesthetics**: Neon, glowing, premium UI.
*   **Performance**: Vanilla JS + Canvas/WebGL.
*   **Modularity**: Easy to add new "cartridges" (games).

## 🕹️ Available Games

### 1. Cosmic Breaker
> *Arcade Breakout with a Twist*
A polished brick-breaking game featuring multi-ball madness, power-ups, screen shake, and 5 unique levels. Use the "English" mechanic to control ball trajectory.

### 2. Neon Flow
> *Chill Puzzle Logic*
Connect emitters to receivers by rotating pipes. Mix primary colors (Red, Green, Blue) to create new ones (Magenta, Yellow, Cyan) and complete the circuit. Features glowing visuals and procedural tones.

### 3. Orbit
> *Gravity Defense*
A tense physics survival game. You play as a stylized Sun. Use a slingshot mechanic to launch projectiles, deflect diving comets, and maintain planetary orbits. Features N-body gravity simulation and bullet time.

### 4. Asteroids
> *Neon Vector Shooter*
A modern, neon-soaked take on the arcade classic. Pilot a ship with inertial physics, blast asteroids that split into smaller chunks, and survive infinite waves. Features screen wrapping, particle explosions, and increasing difficulty.

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
