# Bit Warriors — Design Spec
**Date:** 2026-03-28
**Status:** Approved for implementation

---

## 1. Concept

A 2D platform fighter (Brawlhalla-style) featuring comical illustrated characters based on hand-drawn sketches by the developer's son, brought to life via AI image generation. The game runs in the browser first and is packaged as native iOS/Android apps from the same codebase via Capacitor.

**Visual identity:**
- **Characters:** illustrated/comical art style (reference: CowboyMelon — a watermelon with cowboy hat, mustache, stick arms/legs, cowboy boots, grappling hook). Each character is AI-generated from a child's sketch, background-removed, and cut into a sprite sheet.
- **Backgrounds:** pixel art night cityscape style (reference: dense blue/purple skyline, warm amber lit windows, misty parallax layers).
- **Platforms:** pixel art, matching the background aesthetic.
- **UI:** functional styling for v1; 90s pixel art skin deferred to a later pass.

---

## 2. Prototype Scope (v1)

| In scope | Deferred |
|---|---|
| PvP fighting mode (2 players, same device) | Co-op boss fight mode |
| 2 characters (CowboyMelon + 1 TBD) | Additional characters |
| 1 stage: Downtown Rumble | Additional stages |
| Stock lives + damage % system | Level editor (Mario Maker style) |
| Weapon pickups | Online multiplayer |
| Configurable key bindings | 90s pixel art UI skin |
| Mobile touch controls overlay | |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Game framework | Phaser 3 |
| Language | TypeScript |
| Bundler / dev server | Vite |
| Mobile packaging | Capacitor (iOS + Android) |
| Stage design | JSON (hand-authored for v1, editor later) |
| Sprite sheets | Aseprite → Phaser atlas JSON |
| Settings persistence | localStorage |

---

## 4. Project Structure

```
bit-warriors/
├── src/
│   ├── scenes/          # One file per Phaser Scene
│   ├── fighters/        # Fighter base class + one subclass per character
│   ├── systems/         # InputSystem, CombatSystem, StageSystem
│   ├── ui/              # HUD, menus, touch controls overlay
│   └── assets/          # Sprites, audio, tilemaps, stage JSON
├── capacitor.config.ts
├── vite.config.ts
└── docs/
```

---

## 5. Scene Flow

```
Boot → Preload → MainMenu → CharacterSelect → Settings → Game → Result
```

- **Boot:** minimal asset load (logo, loading bar sprite)
- **Preload:** all game assets with progress bar
- **MainMenu:** start game, go to settings
- **CharacterSelect:** each player picks a fighter
- **Settings:** key binding configuration (accessible from MainMenu and pause)
- **Game:** the fight — owns fighters, stage, HUD, camera
- **Result:** winner screen, rematch / back to menu

---

## 6. Fighter Architecture

### 6.1 Class hierarchy

```
Fighter (base)
├── CowboyMelon
└── [Character2]
```

`Fighter` provides the state machine, physics body, input handling, hitbox/hurtbox management, and animation dispatch. Each subclass defines its own stats and attack data.

**Character stats (defined per subclass):**
- `moveSpeed`, `jumpForce`, `weight`
- `attacks[]` — array of attack definitions (see §7)

### 6.2 State Machine

```
IDLE ──► RUN
  │        │
  └────────┴──► JUMP ──► DOUBLE_JUMP ──► FALL
                  │            │           │
                  └────────────┴───────────┘
                               │
                            ATTACK ──► (back to previous grounded/air state)
                               │
                           HITSTUN ──► LAUNCHED ──► DEAD
```

ARMED is a modifier flag, not a separate state. When a fighter holds a weapon, `fighter.isArmed = true`; all states remain the same but attacks resolve against the weapon's `AttackDef` entries instead of bare-hands entries.

**States:**

| State | Description |
|---|---|
| `IDLE` | Standing still, accepting all input |
| `RUN` | Moving left or right |
| `JUMP` | First jump — upward velocity applied |
| `DOUBLE_JUMP` | Second jump while airborne (press Jump again) |
| `FALL` | Airborne, descending, no jump remaining |
| `ATTACK` | Attack active; hitbox live for N frames |
| `ARMED` | Flag (`isArmed`), not a state. Weapon held — attacks resolve against weapon AttackDefs |
| `HITSTUN` | Took a hit; input locked briefly |
| `LAUNCHED` | Knockback airborne; input locked until recovery or blast zone |
| `DEAD` | Stock lost; respawn sequence plays |

**Rules:**
- `Up` / `Down` axis keys = aim direction, **not** jump or drop
- `Jump` key pressed while grounded → `JUMP`; pressed again while airborne → `DOUBLE_JUMP`
- `Drop Through` key while on a pass-through platform → fall through it
- Attack direction = character facing + current aim axis (up / neutral / down)
- Entering `ARMED` when a weapon is picked up; reverting to unarmed on weapon drop
- Taking a hit while `ARMED` → chance to drop the weapon onto the stage

---

## 7. Combat System

### 7.1 Hitbox / Hurtbox

- Every fighter has a permanent **hurtbox** (body — can be hit)
- Each attack spawns a temporary **hitbox** for its active frames
- `CombatSystem` checks hitbox-vs-hurtbox overlaps every frame
- One hit registered per attack swing (hit cooldown per pair)

### 7.2 Attack definition

```ts
interface AttackDef {
  id: string;               // e.g. "light_side", "heavy_up"
  requiresWeapon: boolean;  // true = only available while isArmed
  aimDirection: 'up' | 'neutral' | 'down';
  inputType: 'light' | 'heavy';
  activeFrames: [number, number]; // frame range within animation
  hitbox: { x: number; y: number; w: number; h: number }; // relative to fighter
  damage: number;           // added to target's damage %
  knockbackBase: number;
  knockbackScaling: number;
  knockbackAngle: number;   // degrees, 0 = right
  animation: string;        // Phaser animation key
}
```

### 7.3 Knockback formula

```
launch_speed = knockbackBase + (target.damagePercent × knockbackScaling)
launch_velocity = Vector2.fromAngle(knockbackAngle × facingMultiplier) × launch_speed
```

Higher accumulated `damagePercent` → greater launch distance. At 0% a hit barely moves the target; at 150%+ any hit can send them off stage.

### 7.4 Weapon pickups

- Weapons spawn at designated stage spawn points
- Respawn timer: ~10 seconds after pickup or drop
- While `ARMED`: light/heavy attacks use the weapon's `AttackDef` entries
- On hit received while armed: configurable drop chance (default 30%)
- Dropped weapons land on the stage as collectibles

---

## 8. Stage: Downtown Rumble

### 8.1 Layout

```
                    [TOP PLATFORM]
                   ─────────────────
           [MID-L]                      [MID-R]
          ──────────                  ──────────

[BUILDING LEFT]──────────────────────────────[BUILDING RIGHT]
               ─────────────────────────────
                        [GROUND]
```

**Platform list:**

| ID | Type | Description |
|---|---|---|
| ground | solid | Low center strip connecting both buildings |
| roof-left | solid | Top of left highrise |
| roof-right | solid | Top of right highrise |
| mid-left | pass-through | Fire escape, left-center |
| mid-right | pass-through | Fire escape, right-center |
| top-center | pass-through | Between rooftops, "BIT WARRIORS" billboard above |

### 8.2 Stage JSON format

```json
{
  "name": "Downtown Rumble",
  "background": "downtown-rumble",
  "platforms": [
    { "id": "ground",      "x": 190, "y": 580, "w": 900, "type": "solid" },
    { "id": "roof-left",   "x": 0,   "y": 260, "w": 200, "type": "solid" },
    { "id": "roof-right",  "x": 1080,"y": 220, "w": 200, "type": "solid" },
    { "id": "mid-left",    "x": 300, "y": 440, "w": 110, "type": "passthrough" },
    { "id": "mid-right",   "x": 870, "y": 420, "w": 100, "type": "passthrough" },
    { "id": "top-center",  "x": 575, "y": 300, "w": 130, "type": "passthrough" }
  ],
  "blastZones": { "left": -200, "right": 1480, "top": -200, "bottom": 820 },
  "weaponSpawns": [{ "x": 640, "y": 270 }],
  "spawnPoints": [
    { "player": 1, "x": 350, "y": 540 },
    { "player": 2, "x": 930, "y": 540 }
  ]
}
```

### 8.3 Background parallax layers

| Layer | Scroll factor | Content |
|---|---|---|
| 1 | 0.1 | Night sky, stars |
| 2 | 0.3 | Distant skyline silhouette |
| 3 | 0.6 | Mid highrises, lit windows |
| 4 | 1.0 | Foreground buildings, neon signs (fixed) |

All layers painted in pixel art style matching the reference (deep blue/purple palette, warm amber windows, misty atmosphere).

---

## 9. Input System

### 9.1 Actions per player

| Group | Action | Description |
|---|---|---|
| Axis | Left | Move / aim left |
| Axis | Right | Move / aim right |
| Axis | Aim Up | Aim attacks upward |
| Axis | Aim Down | Aim attacks downward / crouch |
| Action | Jump | Jump; press again airborne = double jump |
| Action | Drop Through | Fall through pass-through platforms |
| Action | Light Attack | Fast, lower damage |
| Action | Heavy Attack | Slower, higher damage, more knockback |

### 9.2 Default bindings

| Action | Player 1 | Player 2 |
|---|---|---|
| Left | `A` | `←` |
| Right | `D` | `→` |
| Aim Up | `W` | `↑` |
| Aim Down | `S` | `↓` |
| Jump | `Space` | `Numpad 0` |
| Drop Through | `C` | `Numpad .` |
| Light Attack | `F` | `,` |
| Heavy Attack | `G` | `.` |

### 9.3 InputSystem interface

The `InputSystem` exposes a uniform `PlayerInput` object regardless of source (keyboard or touch). The game loop reads only this interface — it never references raw key codes directly.

```ts
interface PlayerInput {
  axis: { x: -1 | 0 | 1; y: -1 | 0 | 1 };
  jump: boolean;       // pressed this frame
  drop: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
}
```

### 9.4 Touch controls (mobile)

- Left thumb: virtual joystick → maps to `axis`
- Right thumb buttons: Jump, Drop, Light, Heavy
- Rendered as a Phaser UI overlay scene, sits above `GameScene`
- Same `PlayerInput` interface — game is unaware it's touch input

### 9.5 Settings screen

- Side-by-side P1 / P2 columns
- Click any key badge → enters "waiting for key" state (highlighted orange)
- Next keypress binds that action
- **Conflict detection:** warns if the same key is bound to two actions across both players
- Reset to defaults per player
- All bindings persisted to `localStorage` on change

---

## 10. HUD

- Top-left: P1 name, stock icons (●●●), damage %
- Top-right: P2 name, stock icons, damage %
- Centre: stock count remaining (shared reference)
- Damage % shown in orange, climbs as hits land
- Stock icon fades out on stock loss

---

## 11. Asset Pipeline

```
Son's sketch
    ↓
AI image generation (Midjourney / DALL·E)
    ↓
Background removal (remove.bg / Photoshop)
    ↓
Sprite sheet layout in Aseprite
    ↓
Export: PNG atlas + JSON frame data
    ↓
Phaser 3 atlas loader
```

**Required animation sets per character (~10 total):**
idle, run, jump, double-jump, fall, light-attack (3 directions), heavy-attack (3 directions), armed-light (3), armed-heavy (3), hitstun, launched, dead

---

## 12. Deferred Features

| Feature | Notes |
|---|---|
| Level editor | Block-based, Mario Maker style. Stage JSON format already supports it — editor just writes JSON. |
| Co-op boss fight mode | 2 players vs 1 large boss character (>64×64 sprite). Shares fighter architecture. |
| Additional characters | Son draws → AI generates → pipeline as above |
| Additional stages | JSON format ready |
| 90s pixel art UI skin | Full visual restyle of menus, HUD, settings screen |
| Online multiplayer | Out of scope until co-op mode is in |
