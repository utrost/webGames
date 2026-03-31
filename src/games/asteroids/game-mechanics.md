# Asteroids — Game Mechanics

## Genre
Arcade / Shooter — Modern neon take on the 1979 classic.

## Core Loop
Destroy asteroids → survive waves → achieve high score.

## Player Ship
- **Shape:** Triangular vector ship (Cyan `#0ff`)
- **Rotation:** 4 rad/s (Arrow Left/Right)
- **Thrust:** 200 units/s (Arrow Up), applied in facing direction
- **Drag:** 0.99 per frame (slight drift, space-like inertia)
- **Collision Radius:** 15 px

## Movement Physics
- Inertial: thrust adds velocity in facing direction, drag slowly decelerates
- **Screen Wrapping:** objects leaving one edge appear on the opposite

## Weapons
- **Bullet:** Fires from ship nose in facing direction
- **Speed:** 400 units/s
- **Lifetime:** 1.5 seconds (then despawns)
- **Cooldown:** 0.2 seconds between shots
- **Controls:** Space bar / right touch region

## Asteroids
| Size | Radius | Speed | Score | Splits Into |
|---|---|---|---|---|
| Large (3) | 45 px | 30 u/s | 100 | 2× Medium |
| Medium (2) | 30 px | 60 u/s | 200 | 2× Small |
| Small (1) | 15 px | 90 u/s | 300 | Nothing |

- **Visual:** Jagged polygon (8–14 segments), Magenta `#f0f`
- **Velocity:** Random direction, smaller = faster
- **Split Mechanics:** Destroyed asteroids split into 2 pieces of next smaller size, inheriting parent velocity + random offset (50 u/s)

## Wave System
- **Start:** 3 large asteroids
- **Next Wave:** Triggers when 0 asteroids remain
- **Wave Delay:** 1.0 seconds
- **Scaling:** Each wave spawns `5 + floor(score / 1000)` asteroids
- **Safe Spawn:** Asteroids spawn ≥200 px from ship

## Lives & Death
- **Starting Lives:** 3
- **Death:** Ship-asteroid collision → ship destroyed, particle explosion (20 cyan particles)
- **Respawn:** 2.0 second delay, center of screen
- **Invincibility:** 2.0 seconds after respawn — ship blinks (toggles every 0.1s), immune to asteroid collisions
- **Game Over:** 0 lives remaining

## Scoring
| Action | Points |
|---|---|
| Large asteroid | 100 |
| Medium asteroid | 200 |
| Small asteroid | 300 |

- **High Score:** Persisted via StorageManager

## Visual Effects
- **Neon Glow:** Canvas shadowBlur on all entities
- **Thrust Particles:** Cyan particles emitted from rear when thrusting
- **Explosion Particles:** 5× asteroid size, in asteroid color
- **Death Explosion:** 20 cyan particles

## Audio (Web Audio API)
| Event | Frequency | Waveform | Duration |
|---|---|---|---|
| Shoot | 800 Hz | Triangle | 0.05s |
| Asteroid destroy (by size) | 400 - size×50 Hz | Square | 0.1s |
| Ship death | 100 Hz | Sawtooth | 0.5s |
| New wave | 600 Hz | Sine | 0.5s |

## Controls
| Input | Action |
|---|---|
| Arrow Left/Right | Rotate |
| Arrow Up | Thrust |
| Space | Fire |
| Escape | Pause |
| R (game over) | Restart |

### Touch Regions
| Screen Region | Action |
|---|---|
| Left third (0–33%) | Rotate Left |
| Center (33–66%), top half | Thrust |
| Center, bottom half | Rotate Right |
| Right third (66–100%) | Fire |

## Technical
- **Canvas:** 800×600
- **Rendering:** Direct Canvas 2D, no framework
- **Physics:** Custom pos += vel × dt, screen wrapping
- **Collision:** Circle-circle (distSq < (r1+r2)²)
