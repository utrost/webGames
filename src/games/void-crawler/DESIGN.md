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

## 2. Spieler-Charakter

### Basis-Stats
| Stat | Startwert | Beschreibung |
|---|---|---|
| HP | 100 | Lebenspunkte. 0 = Tod, Run endet. |
| O₂ | 200 | Sauerstoff-Einheiten. Sinkt jede Runde um 1. 0 = schneller HP-Drain (5/Runde). |
| ATK | 5 | Basis-Nahkampfschaden |
| DEF | 0 | Schadensreduktion (von Rüstung) |
| SIGHT | 7 | FOV-Radius in Tiles |
| SPEED | 1 | Aktionen pro Runde (1 = Standard, 2 = Doppelzug) |

### Aktionen pro Runde
Der Spieler hat **1 Aktion** pro Runde (2 mit Speed-Upgrade):
- **Move** — 1 Tile in 4/8 Richtungen
- **Attack** — Nahkampf (Bump-to-Attack) oder Fernwaffe
- **Use Item** — Verbraucht die Aktion
- **Wait** — Runde überspringen (O₂ sinkt trotzdem)
- **Interact** — Tür öffnen, Terminal lesen, Aufzug benutzen

---

## 3. Bestiary — Gegner

### Tier 1 (Deck 1–3)
| Gegner | Symbol | HP | ATK | Verhalten | Loot |
|---|---|---|---|---|---|
| **Maintenance Drone** | 🤖 | 15 | 3 | Patrouilliert feste Route. Greift an bei Sichtkontakt. | Scrap (1–3) |
| **Void Rat** | 🐀 | 8 | 2 | Schnell (2 Moves/Runde). Flieht unter 50% HP. | Nichts |
| **Corrupted Crewman** | 👤 | 25 | 5 | Wandert ziellos. Bump-Attack. Langsam. | Keycard (10%), O₂-Tank (20%) |

### Tier 2 (Deck 4–6)
| Gegner | Symbol | HP | ATK | Verhalten | Loot |
|---|---|---|---|---|---|
| **Security Bot** | 🛡️ | 40 | 8 | Steht still bis alarmiert, dann Verfolgung. Fernkampf (Laser, Range 4). | Weapon Mod (15%), Credits (5–10) |
| **Acid Crawler** | 🕷️ | 20 | 4 | Hinterlässt Säure-Trail (2 Schaden/Tile). Greift Gruppen an. | Acid Vial (30%) |
| **Flickering Shade** | 👻 | 30 | 10 | Unsichtbar außerhalb von 3 Tiles. Teleportiert. Hoher Schaden, wenig HP. | Cloak Fragment (5%) |

### Tier 3 (Deck 7–9)
| Gegner | Symbol | HP | ATK | Verhalten | Loot |
|---|---|---|---|---|---|
| **Brood Mother** | 🕸️ | 60 | 6 | Spawnt Void Rats (max 3). Selbst langsam. | Rare Mod (25%), Credits (10–20) |
| **Reactor Golem** | ⚡ | 80 | 12 | Langsam, massiv. Explodiert bei Tod (3×3 Area, 15 Schaden). | Power Cell (50%), Scrap (5–10) |
| **Hive Node** | 🧠 | 50 | 0 | Stationär. Buffed alle Gegner im Raum (+3 ATK). Muss priorisiert werden. | Neural Link (10%) |

### Boss (Deck 10)
| Gegner | HP | ATK | Mechanik |
|---|---|---|---|
| **The Confluence** | 200 | 15 | Multi-Phase. Phase 1: Tentakel-Angriffe (Reach 2). Phase 2: Spawnt Shades. Phase 3: Raum schrumpft jede Runde. |

---

## 4. Equipment & Items

### Waffen
| Waffe | ATK | Range | Spezial | Fundort |
|---|---|---|---|---|
| **Wrench** (Start) | 5 | 1 | — | Startausrüstung |
| **Stun Baton** | 7 | 1 | 20% Chance: Gegner verliert nächste Runde | Deck 1–3 |
| **Laser Pistol** | 6 | 5 | Fernkampf, 10 Schuss Magazin | Deck 2–4 |
| **Plasma Cutter** | 10 | 1 | Ignoriert 50% DEF | Deck 4–6 |
| **Rail Rifle** | 12 | 8 | Fernkampf, durchschlägt Gegner in Linie, 5 Schuss | Deck 6–8 |
| **Arc Welder** | 8 | 2 | Trifft alle Gegner in 3×3 Area | Deck 7–9 |
| **Null Lance** | 20 | 3 | Einzigartig. Nur auf Deck 9+. 3 Schuss gesamt. | Deck 9–10 |

### Rüstung
| Rüstung | DEF | Spezial | Fundort |
|---|---|---|---|
| **Salvage Suit** (Start) | 0 | — | Startausrüstung |
| **Reinforced Suit** | 3 | — | Deck 2–4 |
| **Hazmat Suit** | 2 | Immun gegen Säure/Gift | Deck 3–5 |
| **Tactical Vest** | 5 | +1 Inventarslot | Deck 5–7 |
| **Exo-Frame** | 8 | -20% O₂-Verbrauch | Deck 7–9 |
| **Void Armor** | 12 | Reflektiert 20% Schaden | Deck 9–10 |

### Verbrauchsgegenstände
| Item | Effekt | Stapelbar |
|---|---|---|
| **O₂-Tank** | +50 O₂ | Ja (max 5) |
| **Medkit** | +30 HP | Ja (max 3) |
| **Stim Pack** | Nächste 5 Runden: SPEED 2 | Ja (max 2) |
| **Flare** | SIGHT +5 für 10 Runden, lockt Gegner an | Ja (max 3) |
| **EMP Grenade** | Deaktiviert Drohnen/Bots in 5×5 Area für 5 Runden | Ja (max 2) |
| **Acid Vial** | Wirft Säurepfütze (3×3, 3 Runden, 2 Schaden/Runde) | Ja (max 3) |
| **Repair Kit** | Repariert Waffe (+5 Haltbarkeit) | Ja (max 2) |

### Schlüssel-Items (kein Inventarplatz)
| Item | Effekt |
|---|---|
| **Keycard (Farbe)** | Öffnet Türen der entsprechenden Sicherheitsstufe |
| **Logbuch-Fragment** | Story-Element. Sammlung = Lore-Completion. |
| **Station Map** | Zeigt vollständige Minimap des aktuellen Decks |

### Weapon Mods (1 Slot pro Waffe)
| Mod | Effekt |
|---|---|
| **Overcharge** | +3 ATK, Waffe verliert doppelt Haltbarkeit |
| **Silencer** | Angriffe alarmieren keine Gegner in Nachbarräumen |
| **Cryo Cell** | 15% Chance: Gegner einfrieren (2 Runden) |
| **Vampiric Siphon** | Heilt 10% des verursachten Schadens |
| **Neural Link** | FOV zeigt Gegner-HP-Balken |

---

## 5. Inventar

- **6 Slots** (erweiterbar auf 8 mit Tactical Vest)
- 1 Waffen-Slot (aktive Waffe, immer ausgerüstet)
- 1 Rüstungs-Slot (aktive Rüstung, immer ausgerüstet)
- Verbrauchsgegenstände stapelbar (siehe Limits oben)
- Voller Rucksack = Tauschen oder Wegwerfen

---

## 6. Kampfsystem

### Schadensberechnung
```
Schaden = max(1, Waffen-ATK + Spieler-ATK-Bonus - Gegner-DEF)
```
Minimum 1 Schaden pro Treffer (kein Nullschaden).

### Nahkampf (Bump-to-Attack)
- Spieler bewegt sich auf Gegner-Tile → Angriff statt Bewegung
- Gegner-KI macht dasselbe

### Fernkampf
- Benötigt Fernwaffe + Munition
- Sichtlinie (Line-of-Sight) muss frei sein
- Aktion: Richtung wählen → Projektil trifft erstes Ziel in Linie
- Rail Rifle: Durchschlag (trifft alle in der Linie)

### Waffenhaltbarkeit
- Jede Waffe hat **Durability** (Stun Baton: 30, Laser Pistol: 10 Schuss, etc.)
- Nahkampfwaffen verlieren 1 Durability pro Treffer
- Fernwaffen verlieren 1 pro Schuss
- Durability 0 = Waffe zerstört, zurück zum Wrench
- Repair Kit stellt +5 Durability wieder her

### Gegner-KI
| Verhalten | Beschreibung |
|---|---|
| **Patrol** | Bewegt sich auf vordefinierten Pfaden. Standard für Drohnen. |
| **Wander** | Zufällige Bewegung. Standard für korrumpierte Crew. |
| **Hunt** | A*-Pathfinding zum Spieler. Aktiviert bei Sichtkontakt oder Lärm. |
| **Flee** | Bewegt sich weg vom Spieler. Bei niedrigen HP (Void Rats). |
| **Guard** | Stationär. Greift an wenn Spieler in Range. Security Bots im Idle. |
| **Support** | Buffed/heilt andere Gegner. Hive Nodes. |

### Alarm-System
- Kampfgeräusche alarmieren Gegner in **Nachbarräumen** (nicht das ganze Deck)
- Alarmierte Gegner wechseln zu **Hunt**-Verhalten
- Silencer-Mod verhindert Alarm
- Flares ziehen Gegner an (nützlich als Ablenkung)

---

## 7. Sauerstoff-System

### Regeln
- Start: **200 O₂**
- Verbrauch: **1 O₂ pro Runde** (Standard)
- Exo-Frame: **0.8 O₂ pro Runde** (aufgerundet jede 5. Runde kostenlos)
- O₂ = 0: **5 HP Schaden pro Runde** (Erstickung)
- O₂-Tanks: +50 O₂, max 5 im Inventar

### Strategische Funktion
O₂ ist der **Zeitdruck**. Es verhindert:
- Endloses Erkunden (irgendwann muss man zum Aufzug)
- Übervorsichtiges Spielen (Warten kostet O₂)
- Backtracking (jeder Schritt zählt)

### O₂-Quellen
- **O₂-Tanks** (Loot, Shops)
- **Ventilation Stations** (1 pro Deck, +30 O₂, einmalig)
- **Permanentes Upgrade:** Startkapazität erhöhen (220, 240, ...)

---

## 8. Progression (Meta-Game)

### Credits
- Gewonnen durch: Gegner besiegen, Loot verkaufen, Decks abschließen
- **Behalten bei Tod** (das macht es zum Roguelite)
- Ausgegeben im **Salvage Shop** (zwischen Runs)

### Salvage Shop — Permanente Upgrades
| Upgrade | Stufen | Kosten | Effekt |
|---|---|---|---|
| **Reinforced Hull** | 5 | 50/100/200/400/800 | +10 Start-HP pro Stufe |
| **Extended Tanks** | 5 | 40/80/160/320/640 | +20 Start-O₂ pro Stufe |
| **Combat Training** | 3 | 100/300/600 | +2 Basis-ATK pro Stufe |
| **Sensor Array** | 3 | 80/200/500 | +1 SIGHT pro Stufe |
| **Salvage Efficiency** | 3 | 60/150/400 | +20% Credits aus Loot |
| **Emergency Stim** | 1 | 500 | Starte mit 1 Stim Pack |
| **Quick Reflexes** | 1 | 1000 | 15% Chance Angriffe zu dodgen |
| **Deep Scanner** | 1 | 750 | Aufzug-Position auf Minimap sichtbar |
| **Heirloom Wrench** | 1 | 300 | Wrench hat +3 ATK (Start-Waffe verbessert) |

### Logbuch-Completion
- 20 Logbuch-Fragmente verteilt über alle Decks
- Gefundene Fragmente sind **permanent** (überleben Tod)
- 100% Completion = alternatives Ende freigeschaltet

### Run-Statistiken
Nach jedem Run: Decks erreicht, Gegner besiegt, Schritte, O₂ verbraucht, Todesursache. Highscore-Tabelle via StorageManager.

---

## 9. Prozedurale Generierung

### Deck-Layout (rot.js)
- **Algorithmus:** `ROT.Map.Digger` (Räume + Korridore)
- Räume: 5–12 pro Deck, Größe 4×4 bis 10×10
- Korridore: 1–2 Tiles breit
- **Garantien pro Deck:**
  - 1 Aufzug (Abstieg)
  - 1 Ventilation Station
  - 1–3 Loot-Räume
  - Mindestens 1 erreichbarer Pfad vom Start zum Aufzug

### Gegner-Platzierung
- Budget-System: Jedes Deck hat ein **Threat Budget** (steigt pro Deck)
- Gegner kosten unterschiedlich viel Budget
- Platzierung: In Räumen, nie im Startbereich (3-Tile-Radius safe)

### Loot-Verteilung
- Loot-Tabellen pro Deck-Tier (bessere Items tiefer)
- Garantiertes Equipment-Upgrade alle 2 Decks
- Rare Items: Gewichtete Wahrscheinlichkeit, nie garantiert

---

## 10. HUD & UI

### In-Game HUD
```
┌──────────────────────────────────────────┐
│ HP: ████████░░ 80/100    O₂: ████████░░  │
│ Deck: 3  |  ⚔ Stun Baton (22/30)        │
│ [I]nventory  [M]ap  [L]og               │
└──────────────────────────────────────────┘
```

### Minimap (M)
- Zeigt erforschte Bereiche
- Aktuelle Position markiert
- Aufzug markiert (wenn Deep Scanner)
- Halbdurchsichtig, toggle-bar

### Inventar (I)
- Grid-Ansicht, 6–8 Slots
- Waffe + Rüstung separat angezeigt
- Use / Drop / Inspect per Tastatur

### Logbuch (L)
- Letzte 20 Nachrichten (Kampflog, Loot, Story)
- Scrollbar

### Zwischen-Run-Screen
- Run-Statistiken
- Credits gewonnen
- Salvage Shop (Upgrades kaufen)
- "Deploy Again" / "Quit to Lobby"

---

## 11. Steuerung

| Taste | Aktion |
|---|---|
| WASD / Pfeiltasten | Bewegen (4-Richtungen) |
| Q/E/Z/C oder Numpad | Diagonale Bewegung (8-Richtungen) |
| Space | Warten (1 Runde überspringen) |
| F | Fernwaffe abfeuern (Richtung wählen) |
| I | Inventar öffnen/schließen |
| M | Minimap toggle |
| L | Logbuch toggle |
| 1–6 | Quick-Use Inventarslot |
| Enter | Interagieren (Tür, Terminal, Aufzug) |
| Esc | Pause-Menü |

### Touch-Support (Mobile)
- Swipe: Bewegung
- Tap auf Gegner in Range: Angriff
- Buttons am unteren Rand: Inventar, Map, Wait, Fire

---

## 12. Neon-Retro Art Direction

### Palette
| Element | Farbe | Hex |
|---|---|---|
| Boden (sichtbar) | Dunkles Blaugrau | `#1a1a2e` |
| Boden (erinnert) | Noch dunkler | `#0f0f1a` |
| Wände | Neon Cyan | `#00fff5` |
| Spieler | Neon Grün | `#39ff14` |
| Gegner (Tier 1) | Orange | `#ff6600` |
| Gegner (Tier 2) | Rot | `#ff0040` |
| Gegner (Tier 3) | Magenta | `#ff00ff` |
| Items | Gelb | `#ffe100` |
| Aufzug | Weiß pulsierend | `#ffffff` |
| Säure/Gift | Giftgrün | `#00ff00` |
| O₂ HUD | Cyan→Rot Gradient | |

### Tile-Größe
- **16×16 Pixel**, skaliert auf Canvas (×2 oder ×3 je nach Viewport)
- Placeholder: farbige Blöcke mit 1-2px Detail
- Langfristig: Pixel-Art Spritesheet

### Effekte
- Sanfter CRT-Scanline-Overlay (CSS)
- Glow auf Spieler + Items (Canvas Shadow)
- Flicker auf beschädigter Beleuchtung
- Partikel bei Kampf (shared ParticleSystem)

---

## 13. Audio-Konzept

Minimalistisch. Horror lebt von Stille.

| Event | Sound |
|---|---|
| Schritte | Metallisches Klicken, variiert |
| Angriff (Nahkampf) | Kurzer Impact |
| Angriff (Fern) | Laser-Zap |
| Treffer einstecken | Dumpfer Schlag + kurzer Alarm |
| Item aufheben | Helles Ping |
| Tür öffnen | Hydraulisches Zischen |
| O₂ niedrig (<50) | Atmung wird hörbar |
| O₂ kritisch (<20) | Alarm-Piepen |
| Gegner in Sicht | Subtiler Sting |
| Aufzug | Mechanisches Grollen |
| Tod | Static → Stille |
| Ambient | Tiefes Brummen, gelegentliches Knarzen |

Generiert via Web Audio API (AudioManager), keine externen Dateien nötig.

---

## 14. Balancing-Richtwerte

| Metrik | Zielwert |
|---|---|
| Run-Dauer (erfahren) | 20–30 Minuten |
| Run-Dauer (Anfänger) | 5–10 Minuten (stirbt Deck 2–3) |
| O₂ pro Deck | ~40–60 Runden Budget |
| Gegner pro Deck | 5–15, steigend |
| Credits pro Run (Deck 3 Tod) | 30–60 |
| Credits pro Run (Deck 10 Clear) | 300–500 |
| Vollständiges Upgrade-Set | ~15–20 erfolgreiche Runs |
| Erster Deck-10-Clear | Nach ~10 Runs mit Upgrades |

---

*Dokument erstellt: 2026-03-31. Referenz für Implementierung Phase 1.*
