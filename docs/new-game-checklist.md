# New Game Quality Checklist

This checklist is the release gate for adding additional arcade classics to Web Games Arcade. It documents the minimum quality bar for new cartridges so the project does not grow by copy-paste accident.

## Start from the template

1. Copy `src/games/_template/` to `src/games/<game-id>/`.
2. Rename `TemplateGame` to the game class, for example `Pong` or `Snake`.
3. Keep the public cartridge boundary intact:
   - `constructor(container, onGameOver)`
   - `init()`
   - `stop()`
   - `resetGameState()`
4. Replace template placeholders with the smallest playable slice.
5. Delete any template comments that are no longer useful after the first real implementation.

## Required files

Every playable game must include:

- `src/games/<game-id>/index.js` — cartridge entrypoint.
- `src/games/<game-id>/config.js` — balance/layout constants when values are not purely local.
- `src/games/<game-id>/Logic.js`, `Entities.js`, or similar pure module when rules can be tested without canvas.
- `src/games/<game-id>/DESIGN.md` — code-level design note.
- `src/games/<game-id>/__tests__/...` — focused game tests.

## Required registration and docs

Before the game is considered complete:

- Add the cartridge to `GAME_REGISTRY` in `src/app/gameRegistry.js`.
- Include non-empty controls metadata for `mouse`, `keyboard`, and `touch`.
- Add a section to `docs/how-to-play.md`.
- Add the game to `README.md` and `games.md`.
- Add the game folder to `src/games/README.md`.
- Keep `DESIGN.md` current with the implemented code, not just design intent.

## Required design doc sections

Each `DESIGN.md` must include:

- `# <Game Title> Code Design`
- `## Cartridge boundary`
- `## Module responsibilities`
- `## State model`
- `## Update phases` or an equivalent event-driven lifecycle section
- `## Input design`
- `## Rendering layers`
- `## Current quality notes`

## Required tests

Use RED-GREEN-REFACTOR. Add a failing test before production code where behavior changes.

At minimum, a new game should have:

- Pure logic/entity tests for game rules, collision, scoring, level progression, or movement.
- Lifecycle/restart test proving `resetGameState()` resets transient state without teardown/re-init.
- Input modality test proving mouse, keyboard, and touch paths are represented or intentionally mapped.
- Registry/docs test coverage from `src/app/__tests__/controls.test.js`.

Prefer extracting a pure `Logic.js` or `Entities.js` module over testing copied helper logic inside tests.

## Required local verification

Run all of these before committing:

```bash
npm test
npm run lint
npm run build
```

Also run the repository markdown link check pattern used in previous docs commits.

## Required browser smoke

After a production build, run a browser smoke on local preview and then on the deployed URL after push/deploy:

- Lobby loads.
- New game card appears.
- Opening the card creates a canvas.
- Controls panel is present.
- Back button returns to the lobby.
- Browser console has no JavaScript errors.

## Implementation order for classics

Use one small classic to prove the flow before harder games:

1. **Pong / Paddle Duel** — smallest cartridge, validates lifecycle/template.
2. **Snake** — validates pure grid logic and deterministic movement tests.
3. **Space Invaders** — validates entity waves and shooter patterns.
4. **Frogger** — validates lane/grid logic.
5. **Maze chaser** — defer until pathfinding/AI patterns are cleaner.

## Non-negotiables

- Do not add a playable game without controls metadata.
- Do not add a playable game without `DESIGN.md`.
- Do not add canvas lifecycle code that cannot be stopped cleanly.
- Do not count a game as released until tests, lint, build, browser smoke, CI, deploy, and live smoke pass.
