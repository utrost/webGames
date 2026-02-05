# 🎮 Game Library & Status

This document tracks the current implementation status of all games in the Web Games Arcade project.

## 📊 Summary

| Game | Genre | Engine | Status |
| :--- | :--- | :--- | :--- |
| **Neon Flow** | Puzzle / Creational | Canvas | 🔴 Not Started |
| **Cosmic Breaker** | Arcade / Action | Custom Arcade Physics | 🟢 Playable Beta |
| **Elemental Sandbox** | Simulation / Creational | Canvas | 🔴 Not Started |
| **Orbit** | Arcade / Skill | Canvas | 🔴 Not Started |

---

## 1. Neon Flow
*   **Genre**: Puzzle / Creational
*   **Concept**: A chill puzzle game where you connect energy nodes on a grid. Once connected, glowing particles "flow" through the pipes, mixing colors and activating machinery.
*   **Tech Stack**: HTML5 Canvas (particles), CSS (UI).
*   **Key Features**:
    *   Procedural grid generation.
    *   Color mixing mechanics (Red + Blue = Purple flow).
    *   Relaxing ambient soundtrack.

## 2. Cosmic Breaker
*   **Genre**: Arcade / Action
*   **Concept**: A classic, crisp "Breakout" clone with tight controls and satisfying physics.
*   **Tech Stack**: Custom Arcade Physics Engine + Canvas.
*   **Key Features**:
    *   **"English" Mechanics**: Control ball angle by hitting different parts of the paddle.
    *   **Speed Ramping**: Game gets faster as you break bricks.
    *   **Served Ball**: Click-to-launch mechanic.
    *   **AABB Collision**: Precise, predictable bounces.

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
