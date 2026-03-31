# Neon Flow — Game Mechanics

## Genre
Puzzle / Routing — Connect colored energy streams through pipe networks.

## Core Loop
Rotate pipes → route colored flows from Emitters to Receivers → match required colors → advance.

## Grid System
- **Tile Size:** 60×60 px
- **Grid:** Variable per level (5×5 to 9×9)
- **Centered** on 800×600 canvas

## Tile Types

### Emitter (Source)
- Generates continuous flow of one primary color (Red, Green, Blue)
- Connects in all 4 directions
- Cannot be rotated
- Visual: Glowing filled circle with outer ring

### Receiver (Sink)
- Requires a specific color (primary or mixed)
- Connects from all 4 directions
- Cannot be rotated
- **Satisfied:** Glowing ring + filled center when correct color arrives
- **Unsatisfied:** Dim inner dot, dark ring

### Pipe
- Transmits flow between connections
- **Rotatable** by click/tap (90° clockwise per click)
- 4 shapes with different connection ports:

| Shape | Symbol | Connections (at rotation 0) |
|---|---|---|
| Straight | I | North ↔ South |
| Corner | L | North ↔ East |
| Tee | T | North ↔ East ↔ West |
| Cross | X | All 4 directions |

### Connection Logic
- Rotation formula: `(basePort + rotation) % 4 === direction`
- Directions: 0=North, 1=East, 2=South, 3=West
- Two tiles connect when both have an open port facing each other

## Color System

### Primary Colors
| Color | Hex | Symbol |
|---|---|---|
| Red | `#f00` | R |
| Green | `#0f0` | G |
| Blue | `#00f` | B |

### Mixed Colors (from combining primaries)
| Mix | Result | Hex | Symbol |
|---|---|---|---|
| Red + Blue | Magenta | `#f0f` | M |
| Red + Green | Yellow | `#ff0` | Y |
| Blue + Green | Cyan | `#0ff` | C |
| Red + Green + Blue | White | `#fff` | W |

### Mixing Rules
- Colors mix when multiple flows converge at a junction
- A Receiver requires **exactly** the right primaries — no extras allowed
- Example: Magenta sink needs Red AND Blue, but NOT Green

### Color-Blind Support
- Toggle via localStorage (`webGames_colorblind`)
- Letter symbols (R/G/B/M/Y/C/W) displayed on Sources and Sinks
- Pattern-based differentiation planned

## Flow Simulation (BFS)
1. Reset all active colors on all tiles
2. Find all Sources, seed their color
3. BFS propagation: for each tile, check all 4 neighbors
4. If current tile has an open port AND neighbor has a matching incoming port → propagate color
5. Visited set prevents infinite loops

## Win Condition
All Receivers must have exactly the required color mix. Checked after every pipe rotation.

## Levels (10 total)
| Level | Name | Grid | Mechanic Introduced |
|---|---|---|---|
| 1 | First Connection | 5×5 | Straight pipes, single color |
| 2 | Right Angles | 6×6 | Corner pipes |
| 3 | Parallel Lines | 6×6 | Dual sources, separate routing |
| 4 | Fusion | 7×7 | Color mixing (Red + Blue → Magenta) |
| 5 | Emerald Stream | 6×6 | Tee pipes, splitting flow |
| 6 | Primary School | 7×7 | 3 sources, secondary colors (Cyan, Yellow) |
| 7 | Prism Core | 7×7 | All 3 primaries → White |
| 8 | Overpass | 7×7 | Routing around obstacles, no crossing |
| 9 | Motherboard | 8×8 | Complex multi-output mixing |
| 10 | The Neon Core | 9×9 | Master puzzle — all mixes including White |

## Scoring
- **Metric:** Total moves (rotations) across all levels
- **Lower is better**
- Persisted as high score via StorageManager

## Visual Effects
- **Pipe Glow:** Active pipes glow with their mixed color (shadowBlur 10)
- **Particles:** Random spawn on active pipes, drift with slight velocity
- **Satisfied Receivers:** Full glow (shadowBlur 20)
- **Tile Grid:** Subtle dark stroke on each cell

## Audio (Web Audio API)
| Event | Frequency | Waveform | Duration |
|---|---|---|---|
| Pipe rotate | 400–600 Hz (random) | Sine | 0.1s |
| Level complete | 880 + 1100 Hz | Triangle | 0.3s |

## Controls
| Input | Action |
|---|---|
| Click / Tap on pipe | Rotate 90° clockwise |
| Arrow keys | Move cursor (keyboard navigation) |
| Space / Enter | Rotate pipe at cursor |
| Escape | Pause |
| R (all levels complete) | Restart from level 1 |

## Technical
- **Canvas:** 800×600
- **Flow Engine:** BFS from sources, O(n) per recalculation
- **Recalculation:** After every rotation (instant, no animation delay)
