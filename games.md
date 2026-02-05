# 🎮 Game Library & Status

This document tracks the current implementation status of all games in the Web Games Arcade project.

## 📊 Summary

| Game | Genre | Engine | Status |
| :--- | :--- | :--- | :--- |
| **Neon Flow** | Puzzle / Creational | Canvas |  Release v1.0 |
| **Cosmic Breaker** | Arcade / Action | Custom Arcade Physics | 🟢 Release v1.0 |
| **Elemental Sandbox** | Simulation / Creational | Canvas | 🔴 Not Started |
| **Orbit** | Arcade / Skill | Canvas | 🟢 Release v1.0 |
| **Asteroids** | Arcade / Shooter | Canvas | 🟢 Release v1.0 |
| **Neon Blocks** | Puzzle / Arcade | Canvas | 🔴 Not Started |

---

## 1. Neon Flow
*   **Genre**: Puzzle / Creational
*   **Status**: 🟢 Released v1.0
*   **Concept**: A chill puzzle game about routing energy. Connect fluid neon streams from Emitters to Receivers by rotating pipe segments.
*   **Mechanics**:
    *   **Grid System**: The game board is a grid of tiles (Pipes, Emitters, Receivers).
    *   **Interactivity**: Click tiles to rotate them 90 degrees.
    *   **Flow Logic**:
        *   **Emitters**: Generate continuous flow of a primary color (Red, Green, Blue).
        *   **Pipes**: Transmit flow. Shapes include Straight, Corner, T-Junction, and Cross.
        *   **Mixing**: If two different colored flows meet at a junction, they mix (e.g., Red + Blue = Magenta).
    *   **Win Condition**: All Receivers must be powered by flow of their specific required color.
*   **Visual Style**: Dark background, glowing neon lines (bloom filters), particles traveling inside the pipes to visualize flow direction and speed.
*   **Tech Stack**: HTML5 Canvas (for particles/bloom), Vanilla JS.

## 2. Cosmic Breaker
*   **Genre**: Arcade / Action
*   **Concept**: A classic, crisp "Breakout" clone with tight controls and satisfying physics.
*   **Tech Stack**: Custom Arcade Physics Engine + Canvas.
*   **Key Features**:
    *   **Power-Ups**: Multi-ball, Wide Paddle, Extra Life.
    *   **5 Unique Levels**: Distinct block layouts (Pyramid, Invader, etc.).
    *   **"Juice"**: Particle explosions and screen shake.
    *   **"English" Mechanics**: Control ball angle by hitting different parts of the paddle.
    *   **Brick Physics**: Multi-hit bricks with damage states.

## 3. Elemental Sandbox
*   **Genre**: Simulation / Creational
*   **Concept**: A "Falling Sand" game where you paint with materials (Sand, Water, Fire, Oil, Acid, Plant). They simulate interactions (fire burns wood, water makes plants grow).
*   **Tech Stack**: Canvas pixel manipulation.
*   **Key Features**:
    *   Cellular automata simulation.
    *   Fluid dynamics for liquids/gases.
    *   Save/Share creations as images.

## 4. Orbit
*   **Genre**: Arcade / Skill
*   **Status**: 🟢 Released v1.0
*   **Concept**: A tense physics survival game. You play as a stylized Sun at the center of the screen.
*   **Look & Feel**:
    *   **Minimalist Vector Art**: Thin, glowing white lines on deep black.
    *   **UI**: None/Minimal. Information is conveyed via diegetic elements (Sun gets dimmer as HP drops).
    *   **Audio**: Deep droning bass, sharp digital pings for launches, crunchy explosions.
*   **Mechanics**:
    *   **N-Body Gravity**: All objects are attracted to the Sun.
    *   **The Goal**: Keep "Planets" (Green) in orbit for as long as possible to accrue score multiplier.
    *   **The Threat**: "Comets" (Red) spawn and dive-bomb the Sun.
    *   **Interactivity - The Sling**:
        *   Click and drag anywhere to prepare a launch.
        *   Time slows down slightly while dragging (Bullet time).
        *   Release to launch a "Counter-Body" (White) to intercept Comets or nudge Planets into better orbits.
    *   **Trajectory Prediction**: While aiming, show a dashed line predicting the path of your shot for the next 2 seconds.
*   **Tech Stack**: Canvas API, Custom Verlet Integration for stable orbits.

## 5. Asteroids
*   **Genre**: Arcade / Shooter
*   **Status**: 🟢 Released v1.0
*   **Concept**: A modern, neon-soaked take on the classic.
*   **Look & Feel**:
    *   **Vector Neon**: High-contrast, glowing lines (Cyan Ship, Magenta Asteroids).
*   **Mechanics**:
    *   **Movement**: Inertial thrusters (drift). Screen wrapping.
    *   **Combat**: Split large asteroids into smaller ones.
    *   **Waves**: Infinite waves with increasing density.
    *   **Lives**: 3 Lives, respawn timer.
*   **Tech Stack**: Canvas API, Core Vector2.

## 6. Neon Blocks (Tetris)
*   **Genre**: Puzzle / Arcade
*   **Status**: 🔴 Not Started
*   **Concept**: A high-speed, glowing block stacker.
*   **Key Features**:
    *   Classic 10x20 Grid.
    *   7 Tetromino shapes with unique colors.
    *   **"Neon" Aesthetic**: Blocks glow and pulse.
    *   **Mechanics**: Hard Drop, Ghost Piece, Combo Scoring.
