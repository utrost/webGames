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
   - `stop()` — clean up listeners, animation frames, and DOM elements
3. Register the game in `src/main.js`
4. Add game spec to `games.md`
5. Use `core/` utilities (GameLoop, InputManager, Vector2, StorageManager, ParticleSystem) — don't reinvent
6. Add tests for game logic (see Testing section below)

## Testing

Tests use **Vitest** and live alongside the code in `__tests__/` directories.

```bash
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
```

### Test conventions

- Place test files in `__tests__/<ModuleName>.test.js` next to the module
- Import from `vitest`: `describe`, `it`, `expect`, `vi`, `beforeEach`
- Test pure logic and data (entities, physics, shapes, config) — skip DOM/Canvas rendering
- Mock browser APIs (localStorage, requestAnimationFrame) when needed
- Keep tests focused: one assertion concept per `it()` block

### Adding tests for a new game

1. Create `src/games/<game-name>/__tests__/`
2. Add test files for logic modules (e.g., `Logic.test.js`, `Entities.test.js`)
3. Run `npm test` to verify all tests pass before committing

## Code Style

- Vanilla JS, ES modules (`import`/`export`)
- No frameworks, no TypeScript (keep it simple)
- Canvas API for rendering
- 2-space indent (enforced by Prettier)
- Descriptive class and method names
- ESLint for linting: `npx eslint src/`

## Commit Messages

Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Pull Requests

- One game or feature per PR
- Must build cleanly (`npm run build`)
- All tests must pass (`npm test`)
- Update CHANGELOG.md under `[Unreleased]`
- Update `games.md` if adding/modifying a game
