# Changelog

All notable changes to Web Games Arcade will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Elemental Sandbox** v1.0 — falling sand simulation with 9 elements (Sand, Water, Fire, Oil, Acid, Plant, Wood, Stone) and emergent interactions
- **Neon Blocks** v1.0 — complete Tetris clone with next-piece preview, level progression, high score persistence
- Pause system (ESC key) across all games
- Master volume control with mute toggle (persisted to localStorage)
- High score persistence for all games via StorageManager
- High scores displayed on lobby game cards
- Settings panel with volume slider and achievements display
- Achievements system with 6 cross-game achievements and toast notifications
- Touch/mobile input support for all games
- Neon Flow levels 7-10 (Prism Core, Overpass, Motherboard, The Neon Core)
- Proper lobby navigation without page reload
- GitHub Actions CI pipeline (Node 18/20, lint + build)
- CONTRIBUTING.md, .gitignore
- This CHANGELOG

### Fixed
- Removed debug `alert()` statements from Orbit game
- Fixed duplicate `update()`/`render()` method definitions in Orbit
- Cleaned up Vector2 debugging prose, added `dot()`, `angle()`, `rotate()` methods
- Fixed duplicate `this.lives = 3` initialization in Cosmic Breaker
- Replaced `ctx.roundRect()` with cross-browser compatible `drawRoundRect()` in Cosmic Breaker
- Fixed duplicate comment in Cosmic Breaker render
- Fixed Neon Flow Level 7 duplicate tile at (4,4)
- Fixed lobby back-button using `window.location.reload()` — now properly cleans up and restores DOM
- Removed committed `node_modules/` from repository

## [0.1.0] — 2025

### Added
- Arcade Lobby with neon-retro UI and game selection
- Shared engine: GameLoop, InputManager, AudioManager, Vector2, StorageManager
- Shared UI components: Button, Overlay
- **Neon Flow** v1.0 — pipe routing puzzle with color mixing
- **Cosmic Breaker** v1.0 — breakout clone with 5 levels, power-ups, particle effects
- **Orbit** v1.0 — gravity physics survival with n-body simulation
- **Asteroids** v1.0 — vector neon shooter with screen wrapping
- Vite build system
- Architecture and game specification docs
