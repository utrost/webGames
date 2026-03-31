# Void Crawler — Game Design Document

> *Roguelite Sci-Fi Horror. Turn-based. Pixel-Tiles. Neon-Retro.*

---

## 1. Setting & Lore

### Prämisse
Die Forschungsstation **EREBUS-7** im Orbit um den Jupitermond Europa hat den Kontakt abgebrochen. Du bist ein **Salvage Operator** — ein lizenzierter Bergungstaucher, der verlassene Stationen nach verwertbarem Material durchsucht. Was du auf EREBUS-7 findest, ist mehr als defekte Systeme.

### Atmosphäre
- Stille. Kein Soundtrack, nur ambientes Summen, metallisches Knarzen, fernes Tropfen.
- Licht nur durch deine Helm-Lampe (FOV) und flackernde Notbeleuchtung.
- Logbuch-Fragmente der Crew erzählen die Geschichte rückwärts — je tiefer du gehst, desto klarer wird das Bild.

### Decks (Zonen)
| Deck | Name | Thema | Neue Mechanik |
|---|---|---|---|
| 1–2 | **Crew Quarters** | Wohnräume, Korridore, Kantine | Tutorial, wenig Gegner |
| 3–4 | **Research Labs** | Labore, Containment, Probenräume | Säurepfützen, verschlossene Türen (Keycards) |
| 5–6 | **Engineering** | Reaktor, Wartungsschächte, Rohre | Dampffallen, Stromfelder, dunklere Räume |
| 7–8 | **Deep Storage** | Frachträume, Kryokammern | Größere Räume, Horden-Spawns |
| 9–10 | **The Core** | Unbekannt, organisch überwuchert | Boss-Gegner, Endgame |

---

## 2. Core Systems

### Deck Threat Level (DTL)
Zentraler Skalierungs-Multiplikator für alles im Spiel.

```
DTL = Deck-Nummer × (1.0 + Modifier-Bonus)
```

Deck 1 = DTL 1.0, Deck 5 = DTL 5.0, Deck 7 mit "Infested" (+0.3) = DTL 9.1.

### Spieler-Aktionen (Turn-based)
Der Spieler hat **1 Aktion** pro Runde (2 mit Speed-Upgrade):
- **Move** — 1 Tile in 4/8 Richtungen
- **Attack** — Nahkampf (Bump-to-Attack) oder Fernwaffe
- **Use Item** — Verbraucht die Aktion
- **Wait** — Runde überspringen (O₂ sinkt trotzdem)
- **Interact** — Tür öffnen, Terminal lesen, Aufzug benutzen

### Basis-Stats
| Stat | Startwert | Beschreibung |
|---|---|---|
| HP | 100 | Lebenspunkte. 0 = Tod, Run endet. |
| O₂ | 200 | Sauerstoff. Sinkt jede Runde um 1.5. Bei 0 = 5 HP-Drain/Runde. |
| ATK | 5 | Basis-Nahkampfschaden |
| DEF | 0 | Schadensreduktion (von Rüstung) |
| SIGHT | 7 | FOV-Radius in Tiles |
| SPEED | 1 | Aktionen pro Runde (1 = Standard, 2 = Doppelzug) |
| Resistenzen | 0% alle | Elementar-Resistenzen (siehe Abschnitt 5) |

---

## 3. Generative Systeme

### Philosophie
Keine fixen Tabellen. Alles wird aus Bausteinen zusammengesetzt. JSON-Datendateien sind die Design-Hebel — Balance-Änderungen ohne Code.

### Architektur
```
src/games/void-crawler/
  generators/
    MonsterFactory.js    — DNA → Stats + Sprite + Name
    ItemFactory.js       — Basis + Rarity + Affixe → Item
    DeckFactory.js       — rot.js + Modifier + Theming
    EncounterFactory.js  — Event-Pool + Platzierung
    NameGenerator.js     — Template-basiert
  data/
    bodies.json          — Körper-Templates + Resistenzen
    behaviors.json       — KI-Verhaltensbausteine
    abilities.json       — Fähigkeiten-Pool + Skalierung
    affixes.json         — Prefix/Suffix-Tabellen
    elements.json        — Elementar-System-Konfiguration
    events.json          — Encounter-Templates
    names.json           — Wortlisten
    scaling.json         — DTL-Kurven + Formeln
```

---

## 4. Monster-System

### DNA-Generator

Jeder Gegner wird aus Bausteinen zusammengesetzt:

```
Monster = Körper + Verhalten + Fähigkeit(en) + Element + Visuell
```

| Baustein | Pool |
|---|---|
| **Körper** | Insektoid, Humanoid, Drohne, Amorphe Masse, Parasit, Schwarm |
| **Verhalten** | Patrol, Hunt, Wander, Lurk, Flee, Guard, Support, Swarm-KI |
| **Fähigkeit** | Acid Trail, Teleport, Self-Destruct, Shield, Spawn, Buff Aura, Ranged, Regeneration |
| **Element** | Kinetic, Thermal, Cryo, Shock, Acid (oder keins) |
| **Visuell** | Farbton (Tier-abhängig), Glitch-Effekt, Pulsieren, Flackern |

→ 6×8×8×5×4 = **7.680+ Kombinationen**, gefiltert nach Deck-Tier und Synergie-Regeln.

### Stat-Skalierung mit DTL

```
Monster-HP   = Basis-HP   × (1 + 0.25 × DTL)
Monster-ATK  = Basis-ATK  × (1 + 0.20 × DTL)
Monster-DEF  = Basis-DEF  + floor(DTL / 3)
Monster-XP   = Basis-XP   × (1 + 0.15 × DTL)
```

| Körper | Basis-HP | Basis-ATK | Basis-DEF | Rolle |
|---|---|---|---|---|
| Insektoid | 12 | 4 | 1 | Schneller DPS |
| Humanoid | 20 | 5 | 2 | Allrounder |
| Drohne | 15 | 6 | 3 | Ranged/Patrol |
| Amorphe Masse | 30 | 3 | 0 | Tank, langsam |
| Parasit | 8 | 3 | 0 | Debuffer, fragil |
| Schwarm | 6 | 2 | 0 | Viele Instanzen |

### Evolution nach Deck-Tier

| DTL | Monster-Evolution |
|---|---|
| 1–2 | Basis-DNA: 1 Verhalten, 0–1 Fähigkeiten, kein Element |
| 3–4 | +1 Fähigkeit, elementarer Schaden möglich |
| 5–6 | **Mutation**: 2 Fähigkeiten gleichzeitig, Elite-Varianten (10%) |
| 7–8 | **Chimären**: 2 Körper-Templates gemischt, gemischte Gruppen (Tank+DPS+Support). Resistenz = max(A,B), Schwäche = min(A,B) |
| 9–10 | **Abominations**: 3 Fähigkeiten, einzigartige KI-Kombos, Mini-Boss-Stats |

### Elite- und Champion-System

| Variante | Ab Deck | Chance | Modifikatoren | Drop |
|---|---|---|---|---|
| **Elite** | 3 | 10% | ×2 HP, ×1.5 ATK, +1 Fähigkeit | Garantiert Rare+ |
| **Champion** | 7 | 5% | ×3 HP, einzigartiger Name, +2 Fähigkeiten | Garantiert Epic+ |

### Schwarm-Skalierung

| Deck | Formation |
|---|---|
| 1–3 | Einzelne Gegner |
| 4–6 | Packs (2–3 gleicher Typ) |
| 7–9 | Gemischte Gruppen (Tank + DPS + Support) |
| 10 | Koordinierte Squads mit Hive-Node-Kommandant |

### Fähigkeiten-Skalierung

| Fähigkeit | Deck 1–3 | Deck 4–6 | Deck 7–10 |
|---|---|---|---|
| **Acid Trail** | 1 Schaden/Tile | 2 Schaden, 3 Tiles lang | 3 Schaden, 5 Tiles, 10 Runden |
| **Teleport** | Alle 8 Runden | Alle 5 Runden | Alle 3 Runden + Angriff nach TP |
| **Shield** | Absorbiert 10 Schaden | 20 Schaden, regeneriert | 30 Schaden, reflektiert 20% |
| **Spawn** | 1 Minion, max 2 | 2 Minions, max 4 | 3 Minions, max 6, mutiert |
| **Buff Aura** | +2 ATK Nachbarn | +3 ATK + 10% DEF | +5 ATK + Regeneration |
| **Self-Destruct** | 3×3, 10 Schaden | 5×5, 20 Schaden | 5×5, 30 Schaden + Status |
| **Ranged** | Range 3, 3 ATK | Range 5, Piercing | Range 7, Chain (2. Ziel) |
| **Regeneration** | 1 HP/Runde | 2 HP/Runde | 3 HP/Runde + heilt Nachbarn |

### Gegner-KI-Verhalten

| Verhalten | Beschreibung |
|---|---|
| **Patrol** | Feste Route. Standard für Drohnen. |
| **Hunt** | A*-Pathfinding zum Spieler. Aktiviert bei Sicht/Lärm. |
| **Wander** | Zufällige Bewegung. |
| **Lurk** | Unsichtbar bis Spieler in Range. Überraschungsangriff. |
| **Flee** | Weg vom Spieler. Bei niedrigen HP. |
| **Guard** | Stationär. Angriff bei Range. |
| **Support** | Buffed/heilt andere Gegner. |
| **Swarm-KI** | Koordiniert mit Artgenossen. Umzingeln. |

### Alarm-System
- Kampfgeräusche alarmieren Gegner in **Nachbarräumen**
- Alarmierte Gegner wechseln zu **Hunt**
- Silencer-Affix verhindert Alarm
- Flares ziehen Gegner an (Ablenkung)

### Boss: The Confluence (Deck 10)

| Phase | HP | Mechanik |
|---|---|---|
| 1 | 200 | Tentakel-Angriffe (Reach 2), rotiert Elemente jede 3. Runde |
| 2 | ab 120 HP | Spawnt Shades (Chimären), Acid-Zonen auf dem Boden |
| 3 | ab 50 HP | Raum schrumpft jede Runde, alle Elemente gleichzeitig |

### Namens-Generator

```
Monster: [Adjektiv] + [Körper-Name]
         "Flickering Brood-Drone"
         "Corroded Hunter-Swarm"
         "Superheated Amorphic Mass"

Elite:   "Elite [Name]"
Champion: Einzigartiger Name aus Pool: "NEREUS", "CHARYBDIS", "TETHYS"...
```

---

## 5. Elementar-System

### 5 Schadenstypen

| Element | Symbol | Farbe | Hex | Status-Effekt |
|---|---|---|---|---|
| **Kinetic** | ⚙️ | Weiß | `#cccccc` | Keiner. Basis-Schaden. |
| **Thermal** | 🔥 | Orange | `#ff6600` | **Burn**: 2 Schaden/Runde, 3 Runden (refresht, stackt nicht) |
| **Cryo** | ❄️ | Hellblau | `#00bfff` | **Chill**: -50% Geschwindigkeit, 3 Runden. 2× Chill = **Freeze** (1 Runde Stun) |
| **Shock** | ⚡ | Gelb | `#ffe100` | **Overload**: Nächster Treffer +30%. Kettet auf Nachbar-Tile (50%) |
| **Acid** | ☣️ | Giftgrün | `#00ff00` | **Corrode**: -2 DEF, 5 Runden (stackt bis max -5). Durability ×2 Verlust |

### Schadensberechnung

```
Roher Schaden      = Waffen-ATK × (1 + Element-Bonus)
Resistenz          = Ziel-Resistenz für Element (0%–90% Cap)
Nach Resistenz     = Roher Schaden × (1 - Resistenz/100)
Finaler Schaden    = max(1, Nach Resistenz - Ziel-DEF)
```

Negative Resistenz = Schwäche (nimmt MEHR Schaden). -30% Thermal = 130% Feuerschaden.

### Spieler-Resistenzen

Basiswert: **0% auf alles.** Aufbau durch Rüstung, Affixe, Upgrades.

| Quelle | Resistenz | Werte |
|---|---|---|
| Rüstungs-Affix (z.B. "Fireproof") | 1 Element | 10–25% je nach iLvl |
| Hazmat-Rüstungsbasis | Acid + Thermal | 30% + 20% |
| Exo-Frame-Basis | Kinetic + Shock | 20% + 15% |
| Void Armor-Basis | Alle | 10% pauschal |
| Permanentes Upgrade: Hardened Suit | Wählbar 1 Element | +10% pro Stufe (3 Stufen) |
| Encounter-Buff (Medizinstation) | Alle | +15% für aktuelles Deck |
| Set-Bonus: Xenohunter | Acid | 50% |

**Resistenz-Cap: 90%** — Vollimmunität gibt es nicht.

### Gegner-Resistenzen (Basis nach Körper-Template)

| Körper | Kinetic | Thermal | Cryo | Shock | Acid |
|---|---|---|---|---|---|
| **Drohne** | 20% | 0% | 0% | **-30%** | 10% |
| **Insektoid** | 0% | **-20%** | 10% | 0% | **50%** |
| **Humanoid** | 0% | 0% | 0% | 0% | 0% |
| **Amorphe Masse** | **40%** | **-30%** | **30%** | 10% | **-20%** |
| **Parasit** | 0% | **-20%** | **-20%** | 0% | 20% |
| **Schwarm** | **-20%** | **-30%** | 10% | **-30%** | 0% |

### Resistenz-Skalierung mit DTL

```
Effektive Resistenz = Basis-Resistenz + floor(DTL × 2)    (positive Werte)
Effektive Schwäche  = Basis-Schwäche  + floor(DTL × 1)    (negative Werte, milder)
```

→ Deck 10: Drohne hat 40% Kinetic-Resistenz, aber immer noch -20% Shock-Schwäche.

### Element-Synergien (Combo-System)

| Combo | Auslöser | Effekt |
|---|---|---|
| **Meltdown** | Thermal + Acid | Explosion: 50% Schaden auf alle Nachbar-Tiles |
| **Shatter** | Cryo + Kinetic (Melee only) | Gefrorenes Ziel: ×1.5 Kinetic-Nahkampf-Schaden, Freeze endet |
| **EMP Surge** | Shock + Shock (Kette) | Alle Drohnen/Bots in 5×5: 3 Runden deaktiviert |
| **Flash Freeze** | Cryo + Cryo (2 Quellen) | Freeze 3 Runden statt 1 |
| **Toxic Cloud** | Thermal + Acid (auf Tile) | Säurepfütze → Gaswolke (3×3, 3 Runden, blockiert Sicht) |

### Umgebungs-Element-Interaktionen

| Deck-Modifier | Element | Interaktion |
|---|---|---|
| **Flooded** | Shock-Verstärker | Shock kettet auf ALLE Ziele im Wasser |
| **Decompressed** | Cryo | Offene Bereiche: passiver Cryo-Schaden (1/Runde) |
| **Reactor Leak** | Thermal | Bestimmte Korridore: Thermal-DoT-Zonen |
| **Overgrown** | Acid | Ranken sind Acid-resistent, nehmen ×2 Thermal |
| **Unstable** | Kinetic | Kollaps = massiver Kinetic-AoE |

---

## 6. Equipment-System

### Item Level & Rarity

Jedes Item hat ein **Item Level (iLvl) = Deck wo es droppt**.

| Rarity | Farbe | Hex | Affixe | Drop-Rate |
|---|---|---|---|---|
| **Common** | Grau | `#888888` | 0 | Deck 1: 80% → Deck 10: 10% |
| **Uncommon** | Grün | `#39ff14` | 1 | 18% → 25% |
| **Rare** | Blau | `#00bfff` | 2 | 2% → 30% |
| **Epic** | Magenta | `#ff00ff` | 3 | 0% → 25% |
| **Legendary** | Gold | `#ffd700` | 3 + Unique Passive | 0% → 10% |

### Waffen-Generator

```
Waffe = Basis-Typ × iLvl × Rarity × Element × 0–3 Affixe
```

**Stat-Skalierung:**
```
Waffen-ATK   = Basis-ATK × (1 + 0.15 × iLvl)
Durability   = Basis-Dur × (1 + 0.10 × iLvl)
Affix-Stärke = Basis-Effekt × (1 + 0.20 × iLvl)
```

**Waffen-Basen (freigeschaltet nach iLvl):**

| Ab iLvl | Nahkampf | Fernkampf |
|---|---|---|
| 1 | Wrench, Pipe, Baton | — |
| 3 | Blade, Taser | Pistol |
| 5 | Plasma Cutter, Hammer | Rifle, Shotgun |
| 7 | Arc Welder, Chainsaw | Rail Gun, Launcher |
| 9 | Void Scythe, Singularity Hammer | Null Lance |

**Waffen-Element:** Jede Waffe kann ein Element tragen (oder Kinetic als Default). Element wird durch Basis oder Affix bestimmt.

### Rüstungs-Generator

```
Rüstung = Basis-Typ × iLvl × Rarity × 0–3 Attribute × Element-Resistenzen
```

**Stat-Skalierung:**
```
Rüstungs-DEF = Basis-DEF × (1 + 0.20 × iLvl)
```

**Rüstungs-Basen:**

| Ab iLvl | Basis | Basis-DEF | Eingebaute Resistenz |
|---|---|---|---|
| 1 | Salvage Suit | 1 | — |
| 3 | Reinforced Suit | 3 | — |
| 3 | Hazmat Suit | 2 | Acid 30%, Thermal 20% |
| 5 | Tactical Vest | 4 | +1 Inventarslot |
| 5 | Exo-Frame | 5 | Kinetic 20%, Shock 15%, -20% O₂-Verbrauch |
| 7 | Combat Plating | 7 | Kinetic 25% |
| 7 | Shield-Belt | 3 | Notfall-Schild (1 tödlichen Treffer absorbieren) |
| 9 | Void Armor | 10 | Alle 10%, reflektiert 20% Schaden |

**Rüstungs-Attribute (zufällig, 0–3 je nach Rarity):**

| Attribut | Effekt | Skalierung mit iLvl |
|---|---|---|
| O₂-Effizienz | Weniger O₂-Verbrauch | -5% bis -30% |
| Dornen | Nahkampf-Angreifer nehmen Schaden | 1–8 Schaden |
| Regeneration | HP-Heilung alle X Runden | alle 20→10→5 Runden |
| Resistenz (Element) | Reduziert spezifischen Elementarschaden | 10%–25% |
| Agilität | Dodge-Chance | 3%–15% |
| Magnetisch | Loot-Pickup-Radius | +1–3 Tiles |
| Tarnfeld | Gegner erkennen dich erst bei Distanz X | SIGHT-1 bis SIGHT-4 |
| Notfall-Schild | Absorbiert tödlichen Treffer (einmalig) | +1 Ladung pro 3 iLvl |

### Waffen-Affixe (Prefixes + Suffixes)

**Freigeschaltet nach iLvl:**

| Ab iLvl | Affix-Tier | Beispiele |
|---|---|---|
| 1 | **Basis** | Reinforced (+Dur), Sharp (+ATK), Silent (kein Alarm) |
| 3 | **Elemental** | Searing (Thermal), Cryo, Shocking, Corrosive (Acid) |
| 5 | **Advanced** | Vampiric (Lifesteal), Adaptive (+DEF skaliert), Piercing (ignoriert DEF) |
| 7 | **Rare** | Phase-Shift (TP nach Kill), Chain Lightning, Nanite Repair (Selbstheilung) |
| 9 | **Legendary** | Void-Touched (skaliert mit fehlender O₂), Sentient (stärker pro Kill), Quantum (Random-Effekt pro Angriff) |

### Equipment-Sets (ab Deck 5)

| Set (2 Teile) | Bonus |
|---|---|
| **Engineer's Rig** (Frame + Welder) | +20% Repair, Drohnen -30% Schaden |
| **Xenohunter Kit** (Hazmat + Blade) | +25% vs. Organische, Acid-Resistenz 50% |
| **Ghost Protocol** (Tarnfeld + Silent-Waffe) | Erster Angriff pro Raum = ×2 Schaden |
| **Cryo Operative** (Cryo-Waffe + Exo-Frame) | Chill-Dauer +2 Runden, Freeze-Chance +15% |
| **Firestarter** (Thermal-Waffe + Combat Plating) | Burn-Schaden ×2, Thermal-Resistenz 25% |
| **Void Walker** (Void Armor + Null Lance) | +10% alle Resistenzen, Schaden skaliert mit fehlendem O₂ |
| **Salvage King** (Magnetisch-Rüstung + Vampiric-Waffe) | Loot-Radius +2, Lifesteal +5% |
| **Circuit Breaker** (Shock-Waffe + Shield-Belt) | Overload kettet auf 3 Ziele, Notfall-Schild +1 Ladung |
| **Cryo Operator** (Cryo-Waffe + Exo-Frame) | Chill-Dauer +2 Runden, Cryo-Resistenz 30% |
| **Reactor Tech** (Combat Plating + Launcher) | Explosion-Schaden +40%, Self-Destruct-Resistenz 50% |
| **Void Walker** (Void Armor + Null Lance) | +15% alle Resistenzen, O₂-Verbrauch -10% |
| **Field Medic** (Shield-Belt + Repair Kit in Inventar) | Regeneration 3 HP/10 Runden, Medkit-Effizienz +50% |
| **Scavenger's Fortune** (Magnetisch-Rüstung + Salvage Efficiency Upgrade) | +30% Credits, Loot-Rarity +1 Stufe Chance |

### Verbrauchsgegenstände

| Item | Effekt | Stack-Limit |
|---|---|---|
| O₂-Tank | +50 O₂ | 5 |
| Medkit | +30 HP | 3 |
| Stim Pack | SPEED 2 für 5 Runden | 2 |
| Flare | SIGHT +5, 10 Runden, lockt Gegner | 3 |
| EMP Grenade | Drohnen/Bots in 5×5: 5 Runden deaktiviert | 2 |
| Acid Vial | Säurepfütze 3×3, 3 Runden, 2 Schaden/Runde | 3 |
| Repair Kit | +5 Durability auf Waffe | 2 |
| Thermal Charge | Feuerwand 1×5, 3 Runden, 4 Schaden/Runde | 2 |
| Cryo Mine | Platzierbar, Freeze-Explosion bei Kontakt (3×3) | 2 |

### Schlüssel-Items (kein Inventarplatz)

| Item | Effekt |
|---|---|
| Keycard (Farbstufe) | Öffnet Türen der entsprechenden Sicherheitsstufe |
| Logbuch-Fragment | Story-Element, permanent, überlebt Tod |
| Station Map | Vollständige Minimap des aktuellen Decks |

### Inventar
- **6 Slots** (erweiterbar auf 8 mit Tactical Vest)
- 1 Waffen-Slot (aktive Waffe)
- 1 Rüstungs-Slot (aktive Rüstung)
- Verbrauchsgegenstände stapelbar (siehe Limits)
- Voller Rucksack = Tauschen oder Wegwerfen

### Namens-Generator

```
Waffe:    [Prefix] + [Basis] + [Suffix]
          "Searing Plasma Cutter of the Void"
          "Cryo Rail Rifle of Endurance"
          "Sentient Void Scythe of Phase-Shift"
```

---

## 7. Kampfsystem

### Nahkampf (Bump-to-Attack)
- Spieler bewegt sich auf Gegner-Tile → Angriff statt Bewegung
- Gegner-KI macht dasselbe

### Fernkampf
- Benötigt Fernwaffe + Munition/Durability
- Sichtlinie (Line-of-Sight) muss frei sein
- Richtung wählen → Projektil trifft erstes Ziel
- Piercing/Chain-Affixe: trifft mehrere Ziele

### Waffenhaltbarkeit
- Jede Waffe hat **Durability**
- Nahkampf: -1 pro Treffer
- Fernkampf: -1 pro Schuss
- Durability 0 = Waffe zerstört, zurück zum Wrench
- **Wrench hat infinite Durability** — Fallback-Waffe kann nicht zerstört werden
- Repair Kit: +5 Durability

### Vollständige Schadensformel

```
1. Basis-ATK        = Waffen-ATK + Spieler-ATK-Bonus
2. Element-Bonus    = Affix-Multiplikator (z.B. Searing: +20% als Thermal)
3. Roher Schaden    = Basis-ATK × (1 + Element-Bonus)
4. Resistenz        = Ziel-Resistenz (kann negativ sein = Schwäche)
5. Nach Resistenz   = Roher Schaden × (1 - Resistenz/100)
6. Nach DEF         = max(1, Nach Resistenz - Ziel-DEF)
7. Combo-Bonus      = ×2 bei Shatter, +50% AoE bei Meltdown, etc.
8. Elite-Bonus      = Spieler-Buffs vs. Elite/Champion
9. Finaler Schaden  = floor(Nach DEF × Combo-Bonus × Elite-Bonus)
```

Minimum: **1 Schaden** pro Treffer (kein Nullschaden).

---

## 8. Sauerstoff-System

### Regeln
| Regel | Wert |
|---|---|
| Start-O₂ | 200 (+ permanente Upgrades) |
| Verbrauch | 1.5 O₂ / Runde (Standard) |
| Exo-Frame | 1.2 O₂ / Runde |
| O₂ = 0 | 5 HP Schaden / Runde (Erstickung) |
| O₂-Tank | +50 O₂ |
| Ventilation Station | +30 O₂, 1× pro Deck |

### Strategische Funktion
O₂ ist der **Zeitdruck**:
- Verhindert endloses Erkunden
- Bestraft übervorsichtiges Spielen
- Macht Backtracking teuer
- Erzwingt Risiko-vs-Reward-Entscheidungen

### Modifizierter O₂-Verbrauch

| Situation | O₂/Runde |
|---|---|
| Standard | 1.5 |
| Exo-Frame | 1.2 |
| Decompressed-Deck | ×1.5 / ×2.0 / ×2.5 (nach DTL) |
| Flooded-Tile | 3.0 |
| Sprint (Stim Pack) | 2.0 |
| Warten | 1.5 (keine Einsparung) |

---

## 9. Prozedurale Deck-Generierung

### Layout (rot.js)
- **Algorithmus:** `ROT.Map.Digger` (Räume + Korridore)
- Räume: 5–12 pro Deck, Größe 4×4 bis 10×10
- Korridore: 1–2 Tiles breit
- **Garantien:** 1 Aufzug, 1 Ventilation Station, 1–3 Loot-Räume, erreichbarer Pfad Start→Aufzug

### Gegner-Platzierung
- **Threat Budget** pro Deck (steigt mit DTL)
- Gegner kosten unterschiedlich viel Budget
- Nie im Startbereich (3-Tile-Radius safe)

### Loot-Verteilung
- Loot-Tabellen pro iLvl/Rarity
- Garantiertes Equipment-Upgrade alle 2 Decks
- Rare Items: gewichtete Wahrscheinlichkeit

### Deck-Modifier

Jeder Run: 2–3 Modifier zufällig auf Decks verteilt. Modifier skalieren mit DTL:

| Modifier | Deck 1–3 | Deck 4–6 | Deck 7–10 |
|---|---|---|---|
| **Dark** | SIGHT -2 | SIGHT -3 | SIGHT -4, Flares seltener |
| **Infested** | +30% Gegner | +50%, Pack-Spawns | +80%, Schwarm-KI |
| **Decompressed** | O₂ ×1.5 | O₂ ×2.0 | O₂ ×2.5, explosive Dekompression |
| **Flooded** | 20% Tiles Wasser | 40%, Strömung | 60%, Gegner schwimmen schneller |
| **Lockdown** | 30% Türen zu | 50%, Keycards seltener | 70%, Timer-Schlösser |
| **Overgrown** | Ranken blockieren | Regenerieren in 10 Runden | Greifen an (1 ATK), spawnen Parasiten |

**Deck-exklusive Modifier (höhere Decks):**

| Ab Deck | Modifier | Effekt |
|---|---|---|
| 4 | **Unstable** | Alle 20 Runden: zufälliger Raum kollabiert |
| 6 | **Hunted** | Unsichtbarer Stalker folgt dir. Respawnt. |
| 8 | **Entropy** | Waffe/Rüstung verliert 1 Durability / 5 Runden passiv |
| 9 | **Singularity** | Gravitations-Anomalien: Tiles ziehen an/stoßen ab |

### Deck-Namens-Generator

```
"Deck 4 — Hydroponics Bay (Overgrown, Dark)"
"Deck 7 — Cargo Hold C (Infested, Hunted)"
```

### Encounter-Events (2–3 pro Deck)

| Event | Typ | Effekt |
|---|---|---|
| Überlebender | NPC | Tauschhandel |
| Beschädigter Replikator | Gamble | Random Item ODER Explosion |
| Sicherheitsterminal | Info | Gegner-Positionen für 20 Runden |
| Quarantäne-Raum | Arena | Gegnerwellen, danach Epic Loot |
| Defekte Luftschleuse | Timer | 5 Runden zum Entkommen oder O₂-Verlust |
| Medizinstation | Buff | +15% alle Resistenzen für aktuelles Deck |
| Waffenkammer | Loot | 3 Waffen zur Auswahl (höhere Rarity-Chance) |
| Kryokammer | Risk/Reward | Einfrieren: Heilt voll, aber O₂ -30 |
| Forschungslog | Lore | Logbuch-Fragment + kleine XP |
| Anomalie | Chaos | Zufälliger permanenter Buff ODER Debuff für den Run |

---

## 10. Progression (Meta-Game)

### Credits
- Gewonnen durch: Gegner, Loot, Deck-Abschluss
- **Überleben Tod** (Roguelite-Kern)
- Ausgegeben im **Salvage Shop** zwischen Runs

### Salvage Shop — Permanente Upgrades

| Upgrade | Stufen | Kosten | Effekt pro Stufe |
|---|---|---|---|
| Reinforced Hull | 5 | 50/100/200/400/800 | +10 Start-HP |
| Extended Tanks | 5 | 40/80/160/320/640 | +20 Start-O₂ |
| Combat Training | 3 | 100/300/600 | +2 Basis-ATK |
| Sensor Array | 3 | 80/200/500 | +1 SIGHT |
| Salvage Efficiency | 3 | 60/150/400 | +20% Credits |
| Hardened Suit | 3 | 120/300/750 | +10% Resistenz (1 wählbares Element) |
| Emergency Stim | 1 | 500 | Starte mit 1 Stim Pack |
| Quick Reflexes | 1 | 1000 | 15% Dodge-Chance |
| Deep Scanner | 1 | 750 | Aufzug auf Minimap sichtbar |
| Heirloom Wrench | 1 | 300 | Start-Wrench +3 ATK |

### Logbuch-Completion
- 20 Fragmente über alle Decks
- **Permanent** — überlebt Tod
- 100% = alternatives Ende freigeschaltet

### Run-Statistiken
Nach jedem Run: Decks erreicht, Gegner besiegt, Schaden verursacht/erlitten, O₂ verbraucht, Combos ausgelöst, Todesursache. Highscore via StorageManager.

---

## 11. Drop-Wahrscheinlichkeiten (DTL-Tabelle)

| Metrik | Deck 1 | Deck 3 | Deck 5 | Deck 7 | Deck 10 |
|---|---|---|---|---|---|
| Common | 80% | 60% | 40% | 25% | 10% |
| Uncommon | 18% | 28% | 32% | 30% | 25% |
| Rare | 2% | 10% | 20% | 28% | 30% |
| Epic | 0% | 2% | 7% | 15% | 25% |
| Legendary | 0% | 0% | 1% | 2% | 10% |
| O₂-Tank | 30% | 25% | 20% | 15% | 10% |
| Leerer Raum | 40% | 30% | 20% | 15% | 5% |
| Encounter | 10% | 15% | 20% | 25% | 30% |
| Elite-Gegner | 0% | 10% | 15% | 20% | 30% |
| Champion-Gegner | 0% | 0% | 2% | 5% | 10% |

---

## 12. Difficulty Curve — Zusammenfassung

```
Deck  1: Einführung. Schwache Einzelgegner. Viel O₂. Common Loot.
Deck  2: Erste Herausforderung. Packs. Erste Uncommons.
Deck  3: Elites möglich. Elementar-Schaden eingeführt. Keycards.
Deck  4: Modifier spürbar. Neue Waffen-Basen. Events häufiger.
Deck  5: Wendepunkt. Mutationen. Sets möglich. Rares häufig.
Deck  6: Hunted-Modifier. Gemischte Gruppen. O₂ wird knapp.
Deck  7: Chimären. Champions. Epic Drops. Combos nötig.
Deck  8: Entropy nagt an Ausrüstung. Taktik > Kraft.
Deck  9: Abominations. Legendarys. Singularity. Chaos.
Deck 10: The Confluence. Alles Maximum. Wer hier ankommt, hat verdient.
```

---

## 13. Steuerung

### Tastatur
| Taste | Aktion |
|---|---|
| WASD / Pfeiltasten | Bewegen (4 Richtungen) |
| Q/E/Z/C oder Numpad | Diagonale (8 Richtungen) |
| Space | Warten (1 Runde) |
| F | Fernwaffe (Richtung wählen) |
| I | Inventar |
| M | Minimap toggle |
| L | Logbuch toggle |
| 1–6 | Quick-Use Inventarslot |
| Enter | Interagieren |
| Esc | Pause |

### Touch (Mobile)
- Swipe: Bewegung
- Tap auf Gegner in Range: Angriff
- Buttons unten: Inventar, Map, Wait, Fire

---

## 14. Art Direction

### Pixel-Tiles
- **16×16 Pixel**, skaliert ×2/×3 je nach Viewport
- Placeholder-Phase: farbige Blöcke mit 1–2px Detail
- Langfristig: Pixel-Art Spritesheet

### Farbpalette

| Element | Farbe | Hex |
|---|---|---|
| Boden (sichtbar) | Dunkles Blaugrau | `#1a1a2e` |
| Boden (erinnert) | Dunkler | `#0f0f1a` |
| Wände | Neon Cyan | `#00fff5` |
| Spieler | Neon Grün | `#39ff14` |
| Gegner Tier 1 | Orange | `#ff6600` |
| Gegner Tier 2 | Rot | `#ff0040` |
| Gegner Tier 3 | Magenta | `#ff00ff` |
| Items | Gelb | `#ffe100` |
| Aufzug | Weiß pulsierend | `#ffffff` |
| Kinetic | Weiß | `#cccccc` |
| Thermal | Orange | `#ff6600` |
| Cryo | Hellblau | `#00bfff` |
| Shock | Gelb | `#ffe100` |
| Acid | Giftgrün | `#00ff00` |

### Rarity-Farben
- Common: `#888888`
- Uncommon: `#39ff14`
- Rare: `#00bfff`
- Epic: `#ff00ff`
- Legendary: `#ffd700`

### Effekte
- CRT-Scanline-Overlay (CSS)
- Glow auf Spieler + Items (Canvas Shadow)
- Flicker auf beschädigter Beleuchtung
- Element-Partikel bei Kampf (Funken, Eiskristalle, Säuretropfen)
- Partikel via shared ParticleSystem

---

## 15. Audio

Minimalistisch. Horror lebt von Stille.

| Event | Sound |
|---|---|
| Schritte | Metallisches Klicken, variiert |
| Nahkampf | Kurzer Impact |
| Fernkampf | Laser-Zap |
| Treffer einstecken | Dumpfer Schlag + Alarm |
| Elementar-Treffer | Zischen (Thermal), Krachen (Cryo), Surren (Shock), Brodeln (Acid) |
| Combo ausgelöst | Sattes Boom + Screenflash |
| Item aufheben | Helles Ping |
| Rare+ Item | Aufsteigendes Chime |
| Tür öffnen | Hydraulisches Zischen |
| O₂ niedrig (<50) | Atmung hörbar |
| O₂ kritisch (<20) | Alarm-Piepen |
| Gegner in Sicht | Subtiler Sting |
| Aufzug | Mechanisches Grollen |
| Tod | Static → Stille |
| Ambient | Tiefes Brummen, Knarzen |

Generiert via Web Audio API (AudioManager), keine externen Dateien.

---

## 16. Balancing-Richtwerte

| Metrik | Zielwert |
|---|---|
| Run-Dauer (erfahren) | 20–30 Minuten |
| Run-Dauer (Anfänger) | 5–10 Minuten (Tod Deck 2–3) |
| O₂ pro Deck | ~40–60 Runden |
| Gegner pro Deck | 5–15, steigend |
| Credits pro Run (Deck 3 Tod) | 80–120 |
| Credits pro Run (Deck 10 Clear) | 300–500 |
| Vollständiges Upgrade-Set | ~15–20 Runs |
| Erster Deck-10-Clear | Nach ~10 Runs |
| Elementar-Combos pro Run (erfahren) | 5–10 |
| Set-Completion | Frühestens Run 5 |

---

*Erstellt: 2026-03-31. Konsolidiert aus Basis-GDD, generativem System und Elementar-System.*
*Referenz für Implementierung Phase 1.*
