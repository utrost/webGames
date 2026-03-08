# Contributing to Web Games Arcade

## Development Setup

1. Clone the repository
2. `npm install`
3. `npm run dev` — starts Vite dev server with hot reload
4. Open `http://localhost:5173` in your browser

## Adding a New Game

1. Create a directory under `src/games/<game-name>/`
2. Export a class implementing the game interface:
   - `constructor(container, onGameOver)`
   - `init()` — start the game loop
   - `destroy()` — clean up listeners and animation frames
   - `resize(w, h)` — handle viewport changes
3. Register the game in `src/main.js`
4. Add game spec to `games.md`
5. Use `core/` utilities (GameLoop, InputManager, Vector2) — don't reinvent

## Code Style

- Vanilla JS, ES modules (`import`/`export`)
- No frameworks, no TypeScript (keep it simple)
- Canvas API for rendering
- 2-space indent
- Descriptive class and method names

## Commit Messages

Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Pull Requests

- One game or feature per PR
- Must build cleanly (`npm run build`)
- Update CHANGELOG.md under `[Unreleased]`
- Update `games.md` if adding/modifying a game
