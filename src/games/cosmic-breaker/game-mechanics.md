# Cosmic Breaker — Game Mechanics

## Genre
Arcade / Breakout — Classic brick breaker with power-ups and "English" mechanics.

## Core Loop
Launch ball → break bricks → catch power-ups → clear level → advance.

## Paddle
- **Width:** 120 px (180 px with Wide power-up)
- **Height:** 20 px
- **Color:** Cyan `#00f3ff` (Blue `#3498db` when Wide active)
- **Position:** Y = canvas height - 50
- **Input:** Mouse position controls X, or Arrow Left/Right (800 px/s)
- **"English" Mechanic:** Ball angle depends on where it hits the paddle
  - Center hit → straight up (-90°)
  - Edge hit → up to ±60° angle
  - Formula: `angle = -π/2 + (hitOffset / halfWidth) × π/3`

## Ball
- **Radius:** 8 px
- **Initial Speed:** 400 u/s
- **Max Speed:** 800 u/s
- **Speed Increment:** +20 u/s per brick hit
- **Launch:** Click/Space/Tap, random angle near vertical (-90° ± 0.5 rad)
- **Wall Bounce:** Reflects off left, right, and top walls
- **Bottom:** Ball lost (no bounce)

## Bricks
6 brick types defined by color and HP:

| Type | Color | HP | Score |
|---|---|---|---|
| 1 (Red) | `#c0392b` | 3 | 50 |
| 2 (Orange) | `#e67e22` | 2 | 30 |
| 3 (Yellow) | `#f1c40f` | 1 | 20 |
| 4 (Green) | `#2ecc71` | 1 | 10 |
| 5 (Blue) | `#3498db` | 1 | 10 |
| 6 (Purple) | `#9b59b6` | 1 | 10 |

- **Damage Visual:** Opacity decreases with HP loss (0.5 + 0.5 × hp/maxHp)
- **Hit Score:** +10 per hit (in addition to destroy score)
- **Collision Direction:** Determines if ball bounces X or Y based on dx/dy ratio to brick center

## Levels (5 total, loop)
| Level | Name | Pattern |
|---|---|---|
| 1 | Fields of Blocks | 5 horizontal rows |
| 2 | The Pyramid | Centered triangle |
| 3 | Twin Forts | Two columns with bridge |
| 4 | Invader | Space Invader silhouette |
| 5 | Diamond | Diamond outline with center bricks |

- **Level Complete:** All bricks destroyed → next level, ball reset
- **Level Cycling:** After level 5, loops back to 1 with accumulated score

## Power-Ups
Drop chance: **15%** per brick destroyed (CONFIG.POWERUP_DROP_CHANCE).

| Type | Symbol | Color | Effect |
|---|---|---|---|
| **Multi-Ball** | M | Green `#2ecc71` | Spawns 2 additional balls per active ball |
| **Wide Paddle** | W | Blue `#3498db` | Paddle width ×1.5 (until life lost) |
| **Extra Life** | L | Red `#e74c3c` | +1 life |

- **Fall Speed:** 150 px/s
- **Catch:** AABB collision with paddle
- **Score:** +100 per catch (any type)

## Lives & Death
- **Starting Lives:** 3
- **Life Lost:** All balls leave bottom of screen
- **Reset on Death:** Ball respawned on paddle, Wide Paddle removed, paddle returns to normal width
- **Game Over:** 0 lives remaining

## Scoring
| Action | Points |
|---|---|
| Brick hit (any) | +10 |
| Brick destroyed (by type) | +10 to +50 |
| Power-up caught | +100 |
| Hard drop bonus | — (not applicable) |

## Visual Effects
- **Screen Shake:** 5 intensity on brick destroy, decays at 50/s
- **Particle Explosions:** 10–15 particles per brick, matching brick color
- **Neon Glow:** Paddle has Canvas shadowBlur 15
- **Brick Highlight:** Top half white overlay (20% opacity) for 3D effect

## Audio (Web Audio API)
| Event | Frequency | Waveform | Duration |
|---|---|---|---|
| Paddle hit | 440 Hz | Square | 0.1s |
| Brick hit | 880 Hz | Square | 0.05s |
| Brick break | 440+880 Hz | Saw+Square | 0.1s |
| Wall hit | 220 Hz | Triangle | 0.05s |
| Ball lost | 110 Hz | Sawtooth | 0.5s |
| Serve | 660 Hz | Sine | 0.2s |
| Level up | 1320 Hz | Square | 0.4s |
| Power-up | 550+1100 Hz | Sine | 0.1s |

## Controls
| Input | Action |
|---|---|
| Mouse move | Paddle position |
| Arrow Left/Right | Paddle move (800 px/s) |
| Click / Space / Arrow Up | Launch ball |
| Escape | Pause |
| R (game over) | Restart |

### Touch
- Touch move: Paddle follows finger X
- Touch start: Launch ball

## Technical
- **Canvas:** 800×600
- **Collision:** Circle-vs-AABB (closest point on rectangle to circle center)
- **Ball-Brick Direction:** Compare dx/halfW vs dy/halfH to determine reflection axis
