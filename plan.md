# Web Games Arcade — Enhancement Plan

## Project Assessment

**Overall completion: ~82%.** 5 games exist (4 released, 1 in-progress), plus 1 not started. The core engine is solid but underutilized. Several production bugs and code quality issues need attention before new features.

---

## Phase 1: Bug Fixes & Code Cleanup (Critical)

### 1.1 Remove debug `alert()` statements in Orbit
- `src/games/orbit/index.js` contains `alert()` calls (lines ~306, ~382) — production blockers.

### 1.2 Fix duplicate `update()`/`render()` methods in Orbit
- Methods are defined twice (lines 60-94 and 230-384), causing one to shadow the other.

### 1.3 Fix Vector2 mutability documentation
- Remove the lengthy debugging prose (lines 19-36) and replace with a clear API contract comment.

### 1.4 Fix Cosmic Breaker double-initialization
- `this.lives = 3` set twice (lines 31-32). Remove duplicate.

### 1.5 Fix Cosmic Breaker `roundRect()` compatibility
- `ctx.roundRect()` is not universally supported. Add a fallback/polyfill.

### 1.6 Fix Neon Flow Level 7 duplicate tile
- Level 7 ("Prism Core") has a duplicate tile definition at position (4,4) — potential crash.

### 1.7 Fix lobby back-button using `window.location.reload()`
- Replace with proper cleanup + DOM restoration (no full page reload).

---

## Phase 2: Complete In-Progress Games

### 2.1 Finish Neon Blocks (Tetris) — marked "In Progress"
- Add **next piece preview** panel
- Add **high score persistence** via StorageManager
- Add **pause functionality** (Escape key)
- Add level-up visual feedback

### 2.2 Complete Neon Flow levels 7-10
- Fix Level 7 ("Prism Core") broken layout
- Design and implement Levels 8 ("Overpass"), 9 ("Motherboard"), 10 ("Neon Core")
- Add level select screen with completion tracking

---

## Phase 3: Cross-Game Polish & Shared Features

### 3.1 Add pause system to all games
- Escape key pauses, shows overlay (use existing `Overlay.js` which is currently unused)
- Pause skips `update()` but keeps `render()` active (per architecture.md)

### 3.2 Add global audio volume control
- AudioManager currently has no volume control — add master volume + mute toggle
- Persist setting via StorageManager

### 3.3 Add high score persistence to all games
- StorageManager exists but only Cosmic Breaker uses it
- Wire up Orbit, Asteroids, Neon Flow (time/moves), and Neon Blocks

### 3.4 Display high scores in the lobby
- Show best score on each game card in the lobby menu

### 3.5 Mobile/touch input support
- Add touch controls: tap, swipe, virtual joystick where appropriate
- Make canvas responsive to viewport size

---

## Phase 4: New Game — Elemental Sandbox

### 4.1 Implement Elemental Sandbox (spec exists in games.md)
- Cellular automata simulation with pixel-level Canvas manipulation
- Materials: Sand, Water, Fire, Oil, Acid, Plant
- Element interactions (fire burns wood, water grows plants)
- Brush tool with size selector
- Save/share creations

---

## Phase 5: UX & Visual Enhancements

### 5.1 Lobby improvements
- Animated game card thumbnails (mini canvas previews or screenshots)
- Game status badges (score, last played)
- Smooth transitions between lobby and games (fade in/out)

### 5.2 Add settings menu
- Volume slider, key rebinding, color-blind mode toggle

### 5.3 Add achievements system
- Cross-game achievement tracking (e.g., "Clear 100 lines in Neon Blocks", "Survive 60s in Orbit")
- Achievement toast notifications

---

## Recommended Priority Order

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| P0 | Phase 1 (all bug fixes) | High | Low |
| P1 | 2.1 Finish Neon Blocks | High | Medium |
| P1 | 3.1 Pause system | High | Low |
| P1 | 3.2 Audio volume control | Medium | Low |
| P2 | 2.2 Complete Neon Flow levels | Medium | Medium |
| P2 | 3.3-3.4 High scores everywhere | Medium | Low |
| P2 | 3.5 Mobile/touch support | High | High |
| P3 | Phase 4 (Elemental Sandbox) | High | High |
| P3 | Phase 5 (UX polish) | Medium | Medium |
