# Web Games Arcade — Roadmap (v1.1)

## Current State Assessment (v1.0)
The project has successfully implemented almost the entirety of the original `plan.md` roadmap. The codebase is in a highly complete state (v1.0 for all games), with all major bugs fixed and core mechanics implemented. 

### Features fully implemented in v1.0:
- **Neon Blocks**: Next-piece preview, high scores, pause, and touch controls.
- **Neon Flow**: 10 distinct levels fully implemented and playable.
- **Elemental Sandbox**: Complete simulation integrated.
- **Cross-Game Features**: Pause functionality, master volume controls, high-score persistence, lobby high scores, and touch/mobile support.
- **UX**: Lobby Settings panel (volume, color-blind mode), StatsTracker, and an Achievements system with notifications.

---

## Phase 2: System Hardening & PWA (Current Priority)

### 2.1 Service Worker Audit
- Verify that `sw.js` properly caches all assets (audio buffers, canvas scripts, CSS) to ensure 100% offline capability.
- Test PWA installation across supported browsers.

### 2.2 Test Suite Audit
- Run `npm test` and identify files with low coverage.
- Add Vitest tests for newly added cross-game modules: `Settings` logic, `Achievements` evaluation, and `StatsTracker`.

---

## Phase 3: Content Expansion (Medium-term)

### 3.1 Global Leaderboards
- Transition from `localStorage` (`StorageManager`) to a backend (e.g., Firebase, Supabase, or custom REST API) for competitive global high scores.

### 3.2 Neon Flow UI Polish
- Add a visual Level Select screen so players don't have to rely purely on sequential progression.

### 3.3 New Game Cartridge
- Propose and scaffold a new game genre, such as a Neon Racing game or Platformer, leveraging the established `GameLoop`, `CanvasScaler`, and `Vector2` engine.
