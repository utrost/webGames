# Elemental Sandbox — Game Mechanics

## Genre
Simulation / Sandbox — Falling-sand game with element interactions. No win condition, pure creative play.

## Core Loop
Select element → paint on canvas → watch physics and interactions unfold → experiment.

## Simulation Grid
- **Dimensions:** 200×150 cells
- **Pixel Size:** 4×4 px per cell (800×600 canvas)
- **Update:** 1 simulation step per frame
- **Scan Direction:** Alternates left-to-right / right-to-left each frame (prevents directional bias)

## Elements (9 drawable + 2 emergent)

### Solids
| Element | Key | Color | Behavior |
|---|---|---|---|
| **Sand** | 1 | `#c2b280` | Powder: falls down, piles diagonally, sinks through liquids |
| **Wood** | 7 | `#8B6914` | Static solid. Flammable (5% ignition chance from adjacent fire) |
| **Stone** | 8 | `#7f8c8d` | Static solid. Dissolvable by acid (10% chance) |

### Liquids
| Element | Key | Color | Behavior |
|---|---|---|---|
| **Water** | 2 | `#3498db` | Falls, spreads sideways. Extinguishes fire → produces steam |
| **Oil** | 4 | `#8B4513` | Falls, spreads sideways. **Floats on water** (swaps upward). Highly flammable (50% ignition) |
| **Acid** | 5 | `#2ecc71` | Falls, spreads sideways. Dissolves sand, wood, plant, stone (10% chance). Self-consumes (50% on dissolve → smoke) |

### Gas/Energy
| Element | Key | Color | Behavior |
|---|---|---|---|
| **Fire** | 3 | `#e74c3c` | Rises, random flicker colors. Dies (5%/frame → smoke 30%, empty 70%). Ignites neighbors. |

### Emergent (not directly drawable)
| Element | Color | Source | Behavior |
|---|---|---|---|
| **Steam** | `#bdc3c7` | Fire + Water | Rises, drifts sideways. Condenses back to water (1%/frame) |
| **Smoke** | `#555555` | Fire death, Acid reactions | Rises, drifts sideways. Fades to nothing (2%/frame) |

### Eraser
| Element | Key | Effect |
|---|---|---|
| **Erase** | 0 | Removes any element |

## Element Interactions

### Fire Interactions
| Fire + | Result | Chance |
|---|---|---|
| Oil | Oil → Fire | 50% per frame |
| Plant | Plant → Fire | 20% per frame |
| Wood | Wood → Fire | 5% per frame |
| Water | Both → Steam | 100% (immediate) |

### Acid Interactions
| Acid + | Result | Chance |
|---|---|---|
| Sand | Sand dissolved | 10% per frame |
| Wood | Wood dissolved | 10% per frame |
| Plant | Plant dissolved | 10% per frame |
| Stone | Stone dissolved | 10% per frame |
| (self) | Acid → Smoke | 50% on successful dissolve |

### Plant Growth
| Condition | Result | Chance |
|---|---|---|
| Plant adjacent to Water | Water → Plant | 2% per frame |

### Liquid Density
- Oil floats on water (swap when oil is below water)
- Sand sinks through all liquids (swap)

## Physics Rules

### Powder (Sand)
1. Fall straight down if empty below
2. Sink through liquid below (swap)
3. Diagonal fall (random left/right) if blocked below

### Liquid (Water, Oil, Acid)
1. Fall straight down if empty
2. Diagonal fall if blocked below
3. Spread sideways (random direction) if blocked below and diagonally

### Gas (Steam, Smoke)
1. Rise straight up if empty above
2. Diagonal rise if blocked above
3. Drift sideways if blocked above and diagonally

### Fire
1. Random chance to die (5%) → smoke or empty
2. Rise if empty above (30% chance to move up)
3. Ignite flammable neighbors
4. Extinguished by water → steam

## Brush System
- **Size:** 1–10 radius (adjustable via slider or `[`/`]` keys)
- **Shape:** Circle (dx²+dy² ≤ r²)
- **Density:** 70% fill (30% skip for natural look)
- **Continuous Drawing:** Bresenham line interpolation between mouse positions
- **Erase Mode:** Fills circle with EMPTY (100% density)

## Visual Details
- **Color Variation:** ±15 RGB per cell (each cell gets unique shade at creation)
- **Fire Flicker:** Random color each frame from `[#e74c3c, #ff6600, #ffcc00, #ff3300]`
- **Background:** Dark `rgb(8,8,8)`
- **Rendering:** ImageData pixel manipulation → off-screen buffer → scaled to canvas
- **Image Rendering:** `pixelated` CSS for crisp pixels

## Controls
| Input | Action |
|---|---|
| Click + drag | Paint selected element |
| Number keys 0–8 | Select element |
| `[` / `]` | Decrease/increase brush size |
| C | Clear canvas |
| R | Clear canvas (restart alias) |
| Escape | Pause/resume simulation |

### Touch
- Touch + drag: Paint element
- All other controls via UI panel buttons

## UI Panel
- **Element Buttons:** Row of labeled buttons with colored borders
- **Active indicator:** CSS class on selected element
- **Brush slider:** Range input 1–10
- **Clear button:** Resets entire simulation
- **Pause button:** Toggles simulation (drawing still works when paused)

## Technical
- **Canvas:** 800×600 (200×150 simulation, 4× upscale)
- **Data:** `Uint8Array` (element types) + `Uint32Array` (packed RGB colors) + `Uint32Array` (frame update flags)
- **Frame Flag:** Prevents double-updating cells that moved this frame
- **Performance:** Direct pixel manipulation via ImageData, single draw call per frame
- **Boundaries:** Out-of-bounds reads return STONE (implicit walls)
