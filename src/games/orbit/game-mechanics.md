# Orbit — Game Mechanics

## Genre
Arcade / Physics Survival — Defend your Sun by slinging projectiles at incoming comets.

## Core Loop
Comets dive toward Sun → drag-aim projectiles → intercept comets → keep planets alive for score.

## The Sun (Player Base)
- **Position:** Center of screen (400, 300)
- **Mass:** 10,000 (gravitational anchor)
- **Radius:** 30 px
- **HP:** 100 (starts bright white, dims as HP drops)
- **Static:** Does not move
- **Visual:** Brightness = HP/100 (shadowBlur 20 × intensity)
- **Death:** HP ≤ 0 → Game Over

## N-Body Gravity
- **Gravitational Constant (G):** 0.5
- **All bodies attract each other** (O(n²) calculation)
- **Force:** `F = G × m1 × m2 / dist²` (clamped: min distSq = 100)
- **Integration:** Verlet integration (position-based, stable orbits)
- **Damping:** 1.0 (no drag — true space physics)

## Entities

### Planet (Green `#2ecc71`)
- **Mass:** 10, **Radius:** 8 px
- **Role:** Score multiplier — keeping planets alive = good
- **Initial:** 1 planet spawned in orbit (200 px from Sun, velocity 5 downward)
- **Behavior:** Orbits Sun via gravity

### Comet (Red `#e74c3c`)
- **Mass:** 5, **Radius:** 5 px
- **Spawn:** At 600 px distance, random angle around Sun
- **Velocity:** Aimed at Sun, 100–150 u/s
- **Damage:** 10 HP to Sun on contact
- **Score:** 100 points when destroyed

### Projectile (White `#ffffff`)
- **Mass:** 20, **Radius:** 4 px
- **Launched by player** via sling mechanic
- **Affected by gravity** (curves toward Sun and other bodies)
- **Despawn:** At 1500 px from Sun

## Sling Mechanic (Core Interaction)
1. **Click/touch and drag** anywhere on screen
2. **Bullet time:** While dragging, time slows to 20% speed
3. **Trajectory Preview:** Dashed line shows predicted path (60 steps × 16ms simulated)
4. **Release:** Launches projectile from drag start point
5. **Velocity:** `(dragStart - dragCurrent) × 0.5`
6. **Aiming line:** Gray line from start to current mouse position

## Wave System
- **Spawn Rate:** 1 comet every `3.0 / difficulty` seconds
- **Difficulty Ramp:** +0.01/second, caps at 5.0
- **Effective:** At max difficulty, comets spawn every 0.6 seconds

## Collisions
| A | B | Result |
|---|---|---|
| Comet | Projectile | Both destroyed, +100 score |
| Comet | Planet | Both destroyed |
| Comet | Sun | Comet destroyed, Sun -10 HP |

- **Detection:** Circle-circle (distSq < (r1+r2)²)
- **Callback System:** Bodies have `onCollision` and `onDamage` callbacks

## Scoring
| Action | Points |
|---|---|
| Comet intercepted (by projectile) | 100 |

- **High Score:** Persisted via StorageManager

## Visual Style
- **Minimalist Vector:** Thin glowing lines and circles on black
- **Sun:** White with intensity-based glow (dims with damage)
- **No UI chrome** except top-left text
- **Trajectory:** Dashed white line during aim

## Audio (Web Audio API)
| Event | Frequency | Waveform | Duration |
|---|---|---|---|
| Launch projectile | 600 Hz | Sawtooth | 0.1s |
| Comet destroyed | 800–1200 Hz (random) | Sine | 0.1s |
| Sun damaged | 100 Hz | Square | 0.5s |

## Controls
| Input | Action |
|---|---|
| Click + drag | Aim sling (bullet time active) |
| Release | Launch projectile |
| Escape | Pause |

### Touch
- Touch start + move: Aim sling
- Touch end: Launch

## Technical
- **Canvas:** 800×600
- **Physics:** Custom Verlet integration, N-body gravity
- **Prediction:** Cloned simulation for trajectory preview (60 steps)
- **Despawn:** Bodies >1500 px from Sun auto-removed
