# 🎮 Game Library & Status

This document tracks the current implementation status of the eight released games in the Web Games Arcade project, plus the quality gate for future arcade classics.

Void Crawler has moved to its own standalone repository: [utrost/void-crawler](https://github.com/utrost/void-crawler).

## 📊 Summary

| Game | Genre | Engine | Status |
| :--- | :--- | :--- | :--- |
| **Neon Flow** | Puzzle / Routing | Canvas + pure grid logic | 🟢 Release v1.0 |
| **Cosmic Breaker** | Arcade / Action | Custom arcade physics | 🟢 Release v1.0 |
| **Elemental Sandbox** | Simulation / Creational | Canvas + cellular automata | 🟢 Release v1.0 |
| **Orbit** | Arcade / Skill | Canvas + Verlet/N-body physics | 🟢 Release v1.0 |
| **Asteroids** | Arcade / Shooter | Canvas + entity classes | 🟢 Release v1.0 |
| **Starfall Armada** | Arcade / Fixed shooter | Canvas + tested formation logic | 🟢 Release v1.1 |
| **Circuit Chase** | Arcade / Maze chase | Canvas + tile-map/pathfinding helpers | 🟢 Release v1.0 |
| **Neon Blocks** | Puzzle / Arcade | Canvas + grid/piece rules | 🟢 Release v1.0 |

Before adding more classics, use the [new-game checklist](docs/new-game-checklist.md) and copy-start from `src/games/_template/`.

---

## 1. Neon Flow

- **Genre**: Puzzle / Routing
- **Status**: 🟢 Released v1.0
- **Concept**: A chill puzzle game about routing neon energy streams from emitters to receivers by rotating pipe segments.
- **Mechanics**:
  - **Grid System**: The board is a grid of pipes, emitters, and receivers.
  - **Interactivity**: Click/tap/select tiles to rotate pipe segments 90 degrees.
  - **Flow Logic**: Emitters seed colored flow; pipes transmit and mix colors; receivers check required colors.
  - **Win Condition**: All receivers must be powered by matching flow.
- **Code design**: See `src/games/neon-flow/DESIGN.md`.

## 2. Cosmic Breaker

- **Genre**: Breakout / Arcade Action
- **Status**: 🟢 Released v1.0
- **Concept**: A crisp Breakout-style game with power-ups, multi-ball, and paddle-angle control.
- **Key Features**:
  - Multi-ball, wide paddle, and extra-life power-ups.
  - Five brick layouts.
  - Particle explosions and screen shake.
  - Ball angle control based on paddle hit offset.
  - Multi-hit bricks with damage states.
- **Code design**: See `src/games/cosmic-breaker/DESIGN.md`.

## 3. Elemental Sandbox

- **Genre**: Simulation / Creational
- **Status**: 🟢 Released v1.0
- **Concept**: A falling-sand simulation where players paint with materials such as sand, water, fire, oil, acid, plant, wood, steam, and smoke.
- **Implemented Features**:
  - Cellular automata simulation.
  - Powder, liquid, gas, fire, acid, and growth interactions.
  - Mouse/touch painting plus keyboard brush controls.
  - Clear, pause, element selection, and brush-size controls.
- **Not currently implemented**:
  - Save/share/export of creations as images.
- **Code design**: See `src/games/elemental-sandbox/DESIGN.md`.

## 4. Orbit

- **Genre**: Arcade / Skill
- **Status**: 🟢 Released v1.0
- **Concept**: A tense physics survival game. Protect the Sun by slinging counter-bodies at incoming comets while keeping planets alive for a score multiplier.
- **Mechanics**:
  - N-body-ish gravity around a central Sun.
  - Planets increase score multiplier while alive.
  - Comets spawn and dive toward the Sun.
  - Mouse/touch drag or keyboard aiming launches projectiles.
  - Trajectory prediction previews shots.
- **Code design**: See `src/games/orbit/DESIGN.md`.

## 5. Asteroids

- **Genre**: Arcade / Shooter
- **Status**: 🟢 Released v1.0
- **Concept**: A modern neon take on Asteroids with inertial thrust, wrapping, shooting, asteroid splitting, and infinite waves.
- **Mechanics**:
  - Inertial ship movement and screen wrapping.
  - Bullets split large asteroids into smaller asteroids.
  - Infinite waves with increasing density.
  - Lives, respawn timer, invincibility, pause, and restart.
- **Code design**: See `src/games/asteroids/DESIGN.md`.

## 6. Starfall Armada

- **Genre**: Arcade / Fixed Shooter
- **Status**: 🟢 Released v1.0
- **Concept**: A Space-Invaders-inspired skyline defense game with a descending neon armada, shield bunkers, a bonus mothership, single-shot pressure, alien bombs, waves, and high-score chase.
- **Mechanics**:
  - Defender moves horizontally and is clamped to the playfield.
  - One active player shot at a time.
  - Alien formation reverses at edges and descends toward the breach line.
  - Bottom aliens fire bombs.
  - Destructible shield blocks absorb player shots and alien bombs.
  - A travelling mothership offers a 250-point bonus target.
  - Clearing a formation starts a faster wave.
- **Code design**: See `src/games/starfall-armada/DESIGN.md`.

## 7. Circuit Chase

- **Genre**: Arcade / Maze Chase
- **Status**: Release v1.0
- **Core loop**: collect score dots in a neon circuit maze while four glitch hunters chase the player across the grid.
- **Architecture**:
  - `Logic.js` parses tile maps, checks walkability, steps grid positions, and chooses hunter directions with shortest-path search.
  - `levels.js` keeps the ASCII map as the source of truth.
  - `index.js` handles cartridge lifecycle, scoring, lives, rendering, high scores, and input adapters.
- **Features**:
  - Dots, power nodes, frightened hunters, hunter bonus scoring, lives, high score, pause, restart.
  - Keyboard turn queue plus mouse/touch swipe controls.
  - Horizontal tunnel wrapping.
- **Code design**: See `src/games/circuit-chase/DESIGN.md`.

## 8. Neon Blocks

- **Genre**: Puzzle / Arcade
- **Status**: 🟢 Released v1.0
- **Concept**: A neon tetromino stacker with line clears, ghost piece, hold, hard drop, levels, and scoring.
- **Key Features**:
  - Classic 10×20 grid.
  - Seven tetromino shapes via 7-bag randomizer.
  - Hard drop, soft drop, ghost piece, hold, and lock delay.
  - Score, high score, level, lines, next, and hold side panel.
- **Code design**: See `src/games/neon-blocks/DESIGN.md`.

## Future Classics Queue

Recommended implementation order:

1. **Climber** — Donkey-Kong-inspired; defer until platform collision and level-script helpers exist.
2. **Frogger** — lane/grid timing and collision rules.
4. **Pong / Paddle Duel** — still useful as a tiny two-player/control experiment.
5. **Snake** — pure grid logic and deterministic movement tests.

Each future game must pass the checklist before being marked released.
