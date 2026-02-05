# 🎮 Game Library & Status

This document tracks the current implementation status of all games in the Web Games Arcade project.

## 📊 Summary

| Game | Genre | Engine | Status |
| :--- | :--- | :--- | :--- |
| **Neon Flow** | Puzzle / Creational | Canvas | � Release v1.0 |
| **Cosmic Breaker** | Arcade / Action | Custom Arcade Physics | 🟢 Release v1.0 |
| **Elemental Sandbox** | Simulation / Creational | Canvas | 🔴 Not Started |
| **Orbit** | Arcade / Skill | Canvas | 🔴 Not Started |

---

## 1. Neon Flow
*   **Genre**: Puzzle / Creational
*   **Status**: � Released v1.0
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
*   **Concept**: You control a sun in the center. Comets and planets spawn, and you must click/drag to launch counter-bodies to deflect them or capture them into valid stable orbits for points.
*   **Tech Stack**: Canvas API with custom gravity physics.
*   **Key Features**:
    *   N-body gravity simulation.
    *   Trajectory prediction lines.
    *   Minimalist vector art style.
