# Neon Blocks — Game Mechanics

## Genre
Puzzle / Arcade — Classic Tetris with neon aesthetics and modern quality-of-life features.

## Core Loop
Pieces fall → rotate and position → clear lines → level up → speed increases.

## Grid
- **Dimensions:** 10 columns × 20 rows
- **Block Size:** 30×30 px
- **Game Area:** 300×600 px (left side of 480×600 canvas)
- **Side Panel:** Right side — score, high score, level, lines, next piece preview

## Tetrominos (7 Pieces)
| Shape | Color | Hex |
|---|---|---|
| I | Cyan | `#00f0f0` |
| J | Blue | `#0000f0` |
| L | Orange | `#f0a000` |
| O | Yellow | `#f0f000` |
| S | Green | `#00f000` |
| T | Purple | `#a000f0` |
| Z | Red | `#f00000` |

## Randomizer
- **7-Bag System:** All 7 pieces shuffled (Fisher-Yates), dealt one by one
- Guarantees each piece appears once per bag before repeating
- Prevents long droughts of any piece type

## Movement & Rotation
- **Horizontal Move:** Arrow Left/Right, 1 column per press
- **Soft Drop:** Arrow Down, 1 row per press (resets drop counter)
- **Hard Drop:** Space, instant placement + lock
- **Rotation:** Arrow Up, clockwise
- **Wall Kick:** If rotation causes collision, shifts piece left/right (up to piece width) to find valid position

## Drop Speed
- **Initial Interval:** 1000 ms
- **Speed Factor:** ×0.9 per level
- **Level Up:** Every 5 lines cleared
- **Formula:** `interval = 1000 × 0.9^(level-1)`

| Level | Drop Interval |
|---|---|
| 1 | 1000 ms |
| 5 | 656 ms |
| 10 | 387 ms |
| 15 | 228 ms |
| 20 | 135 ms |

## Lock Delay
- **Delay:** 500 ms after piece lands (touches surface below)
- **Resets:** Moving or rotating the piece resets the timer
- **Max Resets:** 15 (prevents infinite stalling)
- **Hard Drop:** Bypasses lock delay entirely

## Ghost Piece
- Shows where current piece would land (20% opacity)
- Updates in real-time as piece moves

## Line Clearing
- Full rows are removed, rows above shift down
- Multiple rows cleared simultaneously = combo scoring

## Scoring
| Action | Points |
|---|---|
| Single line | 100 |
| Double | 400 (100 × 2²) |
| Triple | 900 (100 × 3²) |
| Tetris (4 lines) | 1600 (100 × 4²) |
| Hard drop | 2 × rows dropped |
| Soft drop | (implicit via faster play) |

**Formula:** `points = lines × 100 × lines` (quadratic — rewards combos)

## Next Piece Preview
- Shows next piece in side panel (20×20 px blocks)
- Updated immediately when current piece spawns

## Visual Effects
- **Neon Glow:** Each block has Canvas shadowBlur 10 in its color
- **Block Highlight:** Inner white rectangle (30% opacity) for 3D depth
- **Grid Lines:** Subtle white lines (4% opacity)
- **Line Clear Particles:** 5 white particles per cell in cleared row
- **Level Up Flash:** Cyan screen flash (15% opacity), fades over 0.5s

## Audio (Web Audio API)
| Event | Frequency | Waveform | Duration |
|---|---|---|---|
| Piece lock | 200 Hz | Sine | 0.05s |
| Hard drop | 300 Hz | Square | 0.05s |
| Line clear (1–3) | 700–900 Hz | Sine | 0.1s |
| Tetris (4 lines) | 880+1100 Hz | Square+Sine | 0.2s |
| Level up | 1320 Hz | Square | 0.3s |

## Controls
| Input | Action |
|---|---|
| Arrow Left/Right | Move piece |
| Arrow Down | Soft drop |
| Arrow Up | Rotate clockwise |
| Space | Hard drop |
| Escape | Pause |
| R (game over) | Restart |

### Touch
| Gesture | Action |
|---|---|
| Tap (<20 px, <300 ms) | Rotate |
| Swipe left/right (>30 px) | Move |
| Swipe down (>50 px) | Hard drop |
| Small swipe down (>20 px) | Soft drop |

## Game Over
- Triggered when new piece spawns overlapping existing blocks
- High score persisted via StorageManager

## Technical
- **Canvas:** 480×600
- **Collision:** Matrix overlap check against grid
- **Rendering:** Direct Canvas 2D, block-by-block
- **State:** 2D array (null = empty, color string = filled)
