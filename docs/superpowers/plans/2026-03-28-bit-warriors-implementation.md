# Bit Warriors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable 2-player browser platform fighter with configurable controls, one stage, and two characters, deployable as iOS/Android via Capacitor.

**Architecture:** Phaser 3 game with pure-logic layer (`src/logic/`) that is fully unit-tested with Vitest, and a Phaser-integrated layer (`src/scenes/`, `src/fighters/`, `src/systems/`, `src/ui/`) that is manually tested. State machine, knockback formula, attack resolution, and input config live in the pure layer with no Phaser imports.

**Tech Stack:** Phaser 3, TypeScript, Vite, Vitest, Capacitor (iOS + Android)

---

## File Map

```
bit-warriors/
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── capacitor.config.ts
├── .gitignore
├── src/
│   ├── main.ts                              # Phaser game config + boot
│   ├── logic/                               # Pure TS — no Phaser imports, fully tested
│   │   ├── types.ts                         # All shared interfaces
│   │   ├── constants.ts                     # Game-wide numeric constants
│   │   ├── StateMachine.ts                  # Generic state machine
│   │   ├── StateMachine.test.ts
│   │   ├── knockback.ts                     # Knockback formula
│   │   ├── knockback.test.ts
│   │   ├── attackResolver.ts                # Which AttackDef fires given input+aim+armed
│   │   ├── attackResolver.test.ts
│   │   ├── inputConfig.ts                   # Binding storage, defaults, conflict detection
│   │   └── inputConfig.test.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── CharacterSelectScene.ts
│   │   ├── SettingsScene.ts
│   │   ├── GameScene.ts
│   │   └── ResultScene.ts
│   ├── fighters/
│   │   ├── Fighter.ts                       # Abstract base class (Phaser Sprite)
│   │   ├── states/
│   │   │   ├── IdleState.ts
│   │   │   ├── RunState.ts
│   │   │   ├── JumpState.ts
│   │   │   ├── DoubleJumpState.ts
│   │   │   ├── FallState.ts
│   │   │   ├── AttackState.ts
│   │   │   ├── HitstunState.ts
│   │   │   ├── LaunchedState.ts
│   │   │   └── DeadState.ts
│   │   └── characters/
│   │       └── CowboyMelon.ts
│   ├── systems/
│   │   ├── InputSystem.ts                   # Keyboard→PlayerInput, touch→PlayerInput
│   │   ├── CombatSystem.ts                  # Hitbox/hurtbox overlap each frame
│   │   ├── StageSystem.ts                   # Load JSON, create platforms + parallax
│   │   └── WeaponSystem.ts                  # Weapon spawns, pickups, respawn timer
│   └── ui/
│       ├── HUD.ts                           # Stock icons + damage %
│       └── TouchControls.ts                 # Mobile joystick + buttons overlay
└── public/
    └── assets/
        ├── stages/
        │   └── downtown-rumble.json
        └── backgrounds/                     # Placeholder colour PNGs for now
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/main.ts`

- [ ] **Step 1: Initialise project and install dependencies**

Run in `/Users/user/Documents/git/bit-warriors`:
```bash
pnpm init
pnpm add phaser@^3.87.0
pnpm add -D vite typescript vitest @vitest/ui
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 2: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bit Warriors</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    #game canvas { display: block; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 3: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/logic/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Write `.gitignore`**

```
node_modules/
dist/
.superpowers/
ios/
android/
*.env
```

- [ ] **Step 7: Add scripts to `package.json`**

Edit the `"scripts"` block:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "cap:sync": "cap sync",
  "cap:ios": "cap open ios",
  "cap:android": "cap open android"
}
```

- [ ] **Step 8: Write `src/main.ts` with empty scene stubs**

```typescript
import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    this.add.text(100, 100, 'Bit Warriors — scaffolding OK', { color: '#ffffff', fontSize: '32px' });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a1a',
  scene: [BootScene],
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

- [ ] **Step 9: Verify dev server runs**

```bash
pnpm dev
```

Expected: Vite prints a local URL. Open it — see white text "Bit Warriors — scaffolding OK" on dark background.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding — Vite + Phaser 3 + TypeScript + Vitest"
```

---

## Task 2: Shared Types + Input Config

**Files:**
- Create: `src/logic/types.ts`
- Create: `src/logic/constants.ts`
- Create: `src/logic/inputConfig.ts`
- Create: `src/logic/inputConfig.test.ts`

- [ ] **Step 1: Write `src/logic/types.ts`**

```typescript
export type StateKey =
  | 'IDLE' | 'RUN' | 'JUMP' | 'DOUBLE_JUMP' | 'FALL'
  | 'ATTACK' | 'HITSTUN' | 'LAUNCHED' | 'DEAD';

export type AimDirection = 'up' | 'neutral' | 'down';
export type InputType = 'light' | 'heavy';

export interface AttackDef {
  id: string;
  requiresWeapon: boolean;
  aimDirection: AimDirection;
  inputType: InputType;
  activeFrames: [number, number]; // animation frame indices
  hitbox: { x: number; y: number; w: number; h: number }; // relative to fighter centre
  damage: number;           // added to target damagePercent
  knockbackBase: number;
  knockbackScaling: number;
  knockbackAngle: number;   // degrees; 0=right, 90=up, 180=left
  animation: string;        // Phaser animation key
}

export interface FighterStats {
  moveSpeed: number;
  jumpForce: number;       // negative pixels/s (upward)
  doubleJumpForce: number;
  weight: number;          // 1.0 = average; heavier = launched less far
  attacks: AttackDef[];
}

export interface PlayerInput {
  axis: { x: -1 | 0 | 1; y: -1 | 0 | 1 }; // held each frame
  jumpPressed: boolean;    // rising edge only
  dropPressed: boolean;
  lightPressed: boolean;
  heavyPressed: boolean;
}

export interface KeyBindings {
  left: string;
  right: string;
  aimUp: string;
  aimDown: string;
  jump: string;
  drop: string;
  lightAttack: string;
  heavyAttack: string;
}

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  w: number;
  type: 'solid' | 'passthrough';
}

export interface StageData {
  name: string;
  background: string;
  platforms: PlatformDef[];
  blastZones: { left: number; right: number; top: number; bottom: number };
  weaponSpawns: { x: number; y: number }[];
  spawnPoints: { player: number; x: number; y: number }[];
}
```

- [ ] **Step 2: Write `src/logic/constants.ts`**

```typescript
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GRAVITY = 800;
export const PLATFORM_HEIGHT = 16;
export const STARTING_STOCKS = 3;
export const WEAPON_RESPAWN_MS = 10_000;
export const WEAPON_DROP_CHANCE = 0.3;
export const HITSTUN_BASE_MS = 250;
export const LAUNCHED_RECOVERY_SPEED = 120; // px/s — speed at which launched state ends
export const RESPAWN_DELAY_MS = 2_000;
export const PASSTHROUGH_GRACE_MS = 300; // window after drop-through where platform is ignored
```

- [ ] **Step 3: Write `src/logic/inputConfig.ts`**

```typescript
import type { KeyBindings } from './types';

const STORAGE_KEY = 'bw_keybindings_v1';

export const DEFAULT_BINDINGS: [KeyBindings, KeyBindings] = [
  {
    left: 'A', right: 'D', aimUp: 'W', aimDown: 'S',
    jump: 'SPACE', drop: 'C', lightAttack: 'F', heavyAttack: 'G',
  },
  {
    left: 'LEFT', right: 'RIGHT', aimUp: 'UP', aimDown: 'DOWN',
    jump: 'NUMPAD_0', drop: 'NUMPAD_DECIMAL', lightAttack: 'COMMA', heavyAttack: 'PERIOD',
  },
];

export function loadBindings(): [KeyBindings, KeyBindings] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_BINDINGS);
    return JSON.parse(raw) as [KeyBindings, KeyBindings];
  } catch {
    return structuredClone(DEFAULT_BINDINGS);
  }
}

export function saveBindings(bindings: [KeyBindings, KeyBindings]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

export function resetBindings(
  player: 0 | 1,
  bindings: [KeyBindings, KeyBindings],
): [KeyBindings, KeyBindings] {
  const copy = structuredClone(bindings) as [KeyBindings, KeyBindings];
  copy[player] = structuredClone(DEFAULT_BINDINGS[player]);
  return copy;
}

/** Returns human-readable conflict descriptions, empty if none. */
export function findConflicts(bindings: [KeyBindings, KeyBindings]): string[] {
  const seen = new Map<string, string>(); // key → "P1.jump" etc.
  const conflicts: string[] = [];
  bindings.forEach((b, pi) => {
    (Object.entries(b) as [keyof KeyBindings, string][]).forEach(([action, key]) => {
      const label = `P${pi + 1}.${action}`;
      if (seen.has(key)) {
        conflicts.push(`${key} conflicts: ${seen.get(key)} vs ${label}`);
      } else {
        seen.set(key, label);
      }
    });
  });
  return conflicts;
}
```

- [ ] **Step 4: Write `src/logic/inputConfig.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { DEFAULT_BINDINGS, findConflicts, resetBindings } from './inputConfig';
import type { KeyBindings } from './types';

describe('findConflicts', () => {
  it('returns empty when defaults have no conflicts', () => {
    expect(findConflicts(DEFAULT_BINDINGS)).toEqual([]);
  });

  it('detects cross-player key conflict', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'SPACE' },
      { ...DEFAULT_BINDINGS[1], jump: 'SPACE' },
    ];
    const result = findConflicts(b);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('SPACE');
  });

  it('detects same-player key conflict', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], lightAttack: 'A' }, // A already used for left
      DEFAULT_BINDINGS[1],
    ];
    expect(findConflicts(b)).toHaveLength(1);
  });

  it('returns multiple conflicts when multiple duplicates', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X', drop: 'X' },
      DEFAULT_BINDINGS[1],
    ];
    expect(findConflicts(b)).toHaveLength(1); // only one pair conflicts
  });
});

describe('resetBindings', () => {
  it('resets P1 to defaults without touching P2', () => {
    const modified: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X' },
      { ...DEFAULT_BINDINGS[1], jump: 'Y' },
    ];
    const result = resetBindings(0, modified);
    expect(result[0].jump).toBe(DEFAULT_BINDINGS[0].jump);
    expect(result[1].jump).toBe('Y');
  });

  it('resets P2 to defaults without touching P1', () => {
    const modified: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X' },
      { ...DEFAULT_BINDINGS[1], jump: 'Y' },
    ];
    const result = resetBindings(1, modified);
    expect(result[0].jump).toBe('X');
    expect(result[1].jump).toBe(DEFAULT_BINDINGS[1].jump);
  });

  it('does not mutate the input array', () => {
    const original = structuredClone(DEFAULT_BINDINGS) as [KeyBindings, KeyBindings];
    original[0].jump = 'MUTATE_ME';
    resetBindings(0, original);
    expect(original[0].jump).toBe('MUTATE_ME');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm test
```

Expected output:
```
✓ src/logic/inputConfig.test.ts (5)
Test Files  1 passed (1)
Tests       5 passed (5)
```

- [ ] **Step 6: Commit**

```bash
git add src/logic/types.ts src/logic/constants.ts src/logic/inputConfig.ts src/logic/inputConfig.test.ts
git commit -m "feat: shared types, constants, and input config with tests"
```

---

## Task 3: State Machine

**Files:**
- Create: `src/logic/StateMachine.ts`
- Create: `src/logic/StateMachine.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/logic/StateMachine.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { StateMachine } from './StateMachine';
import type { StateKey } from './types';

interface Ctx { value: number }

function makeState(returns: StateKey | null = null) {
  return { enter: vi.fn(), update: vi.fn().mockReturnValue(returns), exit: vi.fn() };
}

describe('StateMachine', () => {
  it('starts in IDLE', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState());
    expect(sm.current).toBe('IDLE');
  });

  it('calls exit on old state and enter on new state during transition', () => {
    const idle = makeState();
    const run = makeState(null);
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle).register('RUN', run);
    const ctx = { value: 0 };
    sm.transition(ctx, 'RUN');
    expect(idle.exit).toHaveBeenCalledWith(ctx);
    expect(run.enter).toHaveBeenCalledWith(ctx);
    expect(sm.current).toBe('RUN');
  });

  it('auto-transitions when update returns a new key', () => {
    const idle = makeState('RUN');
    const run = makeState(null);
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle).register('RUN', run);
    sm.update({ value: 0 }, 16);
    expect(sm.current).toBe('RUN');
  });

  it('stays put when update returns null', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState(null));
    sm.update({ value: 0 }, 16);
    expect(sm.current).toBe('IDLE');
  });

  it('throws on transition to unregistered state', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState());
    expect(() => sm.transition({ value: 0 }, 'RUN')).toThrow('Unknown state: RUN');
  });

  it('does not transition if update returns current state', () => {
    const idle = makeState('IDLE');
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle);
    sm.update({ value: 0 }, 16);
    expect(idle.exit).not.toHaveBeenCalled(); // no re-entry
    expect(sm.current).toBe('IDLE');
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module './StateMachine'`

- [ ] **Step 3: Write `src/logic/StateMachine.ts`**

```typescript
import type { StateKey } from './types';

export interface State<T> {
  enter(ctx: T): void;
  update(ctx: T, delta: number): StateKey | null;
  exit(ctx: T): void;
}

export class StateMachine<T> {
  private states = new Map<StateKey, State<T>>();
  current: StateKey = 'IDLE';

  register(key: StateKey, state: State<T>): this {
    this.states.set(key, state);
    return this;
  }

  transition(ctx: T, key: StateKey): void {
    if (!this.states.has(key)) throw new Error(`Unknown state: ${key}`);
    this.states.get(this.current)?.exit(ctx);
    this.current = key;
    this.states.get(key)!.enter(ctx);
  }

  update(ctx: T, delta: number): void {
    const next = this.states.get(this.current)?.update(ctx, delta) ?? null;
    if (next !== null && next !== this.current) {
      this.transition(ctx, next);
    }
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test
```

Expected:
```
✓ src/logic/StateMachine.test.ts (6)
✓ src/logic/inputConfig.test.ts (5)
Test Files  2 passed (2)
Tests       11 passed (11)
```

- [ ] **Step 5: Commit**

```bash
git add src/logic/StateMachine.ts src/logic/StateMachine.test.ts
git commit -m "feat: generic state machine with tests"
```

---

## Task 4: Knockback + Attack Resolver

**Files:**
- Create: `src/logic/knockback.ts`
- Create: `src/logic/knockback.test.ts`
- Create: `src/logic/attackResolver.ts`
- Create: `src/logic/attackResolver.test.ts`

- [ ] **Step 1: Write failing knockback tests**

Create `src/logic/knockback.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcLaunchSpeed, angleToVector, calcKnockbackVelocity } from './knockback';

describe('calcLaunchSpeed', () => {
  it('equals base at 0% damage', () => {
    expect(calcLaunchSpeed(200, 2, 0, 1)).toBe(200);
  });

  it('increases with damage percent', () => {
    const low = calcLaunchSpeed(200, 2, 50, 1);
    const high = calcLaunchSpeed(200, 2, 150, 1);
    expect(high).toBeGreaterThan(low);
  });

  it('heavier fighters (weight > 1) launch less far', () => {
    const light = calcLaunchSpeed(200, 2, 100, 0.8);
    const heavy = calcLaunchSpeed(200, 2, 100, 1.4);
    expect(light).toBeGreaterThan(heavy);
  });
});

describe('angleToVector', () => {
  it('0 degrees points right: x≈1, y≈0', () => {
    const v = angleToVector(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('90 degrees points up: x≈0, y≈-1 (screen coords)', () => {
    const v = angleToVector(90);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(-1);
  });

  it('180 degrees points left: x≈-1, y≈0', () => {
    const v = angleToVector(180);
    expect(v.x).toBeCloseTo(-1);
    expect(v.y).toBeCloseTo(0);
  });
});

describe('calcKnockbackVelocity', () => {
  it('x is positive when attacker faces right and angle is 0', () => {
    const v = calcKnockbackVelocity(300, 2, 0, 0, 1, true);
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeCloseTo(0);
  });

  it('x flips when attacker faces left', () => {
    const right = calcKnockbackVelocity(300, 2, 0, 0, 1, true);
    const left = calcKnockbackVelocity(300, 2, 0, 0, 1, false);
    expect(left.x).toBeLessThan(0);
    expect(Math.abs(left.x)).toBeCloseTo(Math.abs(right.x));
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module './knockback'`

- [ ] **Step 3: Write `src/logic/knockback.ts`**

```typescript
export function calcLaunchSpeed(
  base: number,
  scaling: number,
  targetDamagePercent: number,
  targetWeight: number,
): number {
  return (base + targetDamagePercent * scaling) / targetWeight;
}

/** Converts degrees to a unit vector. y is inverted for screen space (up = negative y). */
export function angleToVector(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad), y: -Math.sin(rad) };
}

export function calcKnockbackVelocity(
  base: number,
  scaling: number,
  angleDeg: number,
  targetDamagePercent: number,
  targetWeight: number,
  attackerFacingRight: boolean,
): { x: number; y: number } {
  const speed = calcLaunchSpeed(base, scaling, targetDamagePercent, targetWeight);
  const dir = angleToVector(angleDeg);
  const flip = attackerFacingRight ? 1 : -1;
  return { x: dir.x * speed * flip, y: dir.y * speed };
}
```

- [ ] **Step 4: Write failing attack resolver tests**

Create `src/logic/attackResolver.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveAttack } from './attackResolver';
import type { AttackDef } from './types';

const ATTACKS: AttackDef[] = [
  {
    id: 'light_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'light',
    activeFrames: [2, 8], hitbox: { x: 30, y: -10, w: 40, h: 30 },
    damage: 5, knockbackBase: 150, knockbackScaling: 1.2, knockbackAngle: 30, animation: 'light_neutral',
  },
  {
    id: 'heavy_up', requiresWeapon: false, aimDirection: 'up', inputType: 'heavy',
    activeFrames: [4, 10], hitbox: { x: -10, y: -60, w: 30, h: 40 },
    damage: 12, knockbackBase: 280, knockbackScaling: 2.2, knockbackAngle: 88, animation: 'heavy_up',
  },
  {
    id: 'armed_light_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'light',
    activeFrames: [1, 6], hitbox: { x: 40, y: -10, w: 70, h: 30 },
    damage: 9, knockbackBase: 200, knockbackScaling: 1.6, knockbackAngle: 25, animation: 'armed_light_neutral',
  },
];

describe('resolveAttack', () => {
  it('returns unarmed attack when not armed', () => {
    expect(resolveAttack(ATTACKS, 'light', 'neutral', false)?.id).toBe('light_neutral');
  });

  it('returns armed attack when armed', () => {
    expect(resolveAttack(ATTACKS, 'light', 'neutral', true)?.id).toBe('armed_light_neutral');
  });

  it('returns undefined when no match exists', () => {
    expect(resolveAttack(ATTACKS, 'light', 'down', false)).toBeUndefined();
  });

  it('never returns armed attack when not armed', () => {
    const result = resolveAttack(ATTACKS, 'light', 'neutral', false);
    expect(result?.requiresWeapon).toBe(false);
  });

  it('matches by aim direction', () => {
    expect(resolveAttack(ATTACKS, 'heavy', 'up', false)?.id).toBe('heavy_up');
  });
});
```

- [ ] **Step 5: Write `src/logic/attackResolver.ts`**

```typescript
import type { AttackDef, AimDirection, InputType } from './types';

export function resolveAttack(
  attacks: AttackDef[],
  inputType: InputType,
  aimDirection: AimDirection,
  isArmed: boolean,
): AttackDef | undefined {
  return attacks.find(
    (a) =>
      a.inputType === inputType &&
      a.aimDirection === aimDirection &&
      a.requiresWeapon === isArmed,
  );
}
```

- [ ] **Step 6: Run all tests**

```bash
pnpm test
```

Expected:
```
✓ src/logic/attackResolver.test.ts (5)
✓ src/logic/knockback.test.ts (6)
✓ src/logic/StateMachine.test.ts (6)
✓ src/logic/inputConfig.test.ts (5)
Test Files  4 passed (4)
Tests       22 passed (22)
```

- [ ] **Step 7: Commit**

```bash
git add src/logic/knockback.ts src/logic/knockback.test.ts src/logic/attackResolver.ts src/logic/attackResolver.test.ts
git commit -m "feat: knockback formula and attack resolver with tests"
```

---

## Task 5: Stage JSON + StageSystem

**Files:**
- Create: `public/assets/stages/downtown-rumble.json`
- Create: `src/systems/StageSystem.ts`

- [ ] **Step 1: Write `public/assets/stages/downtown-rumble.json`**

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

- [ ] **Step 2: Create placeholder background PNGs**

Run this once to create 1280×720 placeholder images for each parallax layer:
```bash
mkdir -p public/assets/backgrounds
```

Then in `PreloadScene` (Task 12) we will generate these with Phaser Graphics. For now just make the directory.

- [ ] **Step 3: Write `src/systems/StageSystem.ts`**

```typescript
import Phaser from 'phaser';
import type { StageData, PlatformDef } from '../logic/types';
import { PLATFORM_HEIGHT, PASSTHROUGH_GRACE_MS } from '../logic/constants';

export class StageSystem {
  private scene: Phaser.Scene;
  private solidGroup!: Phaser.Physics.Arcade.StaticGroup;
  private passthroughGroup!: Phaser.Physics.Arcade.StaticGroup;
  private blastZones!: StageData['blastZones'];
  private passthroughTimers = new Map<string, number>(); // fighter id → timestamp

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  load(data: StageData): void {
    this.blastZones = data.blastZones;
    this.solidGroup = this.scene.physics.add.staticGroup();
    this.passthroughGroup = this.scene.physics.add.staticGroup();

    for (const p of data.platforms) {
      this.createPlatform(p);
    }
  }

  private createPlatform(p: PlatformDef): void {
    const group = p.type === 'solid' ? this.solidGroup : this.passthroughGroup;
    // Use a rectangle graphics texture named 'platform'
    const rect = this.scene.add.rectangle(
      p.x + p.w / 2,
      p.y + PLATFORM_HEIGHT / 2,
      p.w,
      PLATFORM_HEIGHT,
      p.type === 'solid' ? 0x7a4aaa : 0x4a7a30,
    );
    this.scene.physics.add.existing(rect, true);
    group.add(rect);
  }

  getSolidGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.solidGroup;
  }

  getPassthroughGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.passthroughGroup;
  }

  getBlastZones(): StageData['blastZones'] {
    return this.blastZones;
  }

  /** Call when a fighter presses Drop Through. Disables passthrough collision for them briefly. */
  startDropThrough(fighterId: string): void {
    this.passthroughTimers.set(fighterId, Date.now() + PASSTHROUGH_GRACE_MS);
  }

  isDropThroughActive(fighterId: string): boolean {
    const until = this.passthroughTimers.get(fighterId) ?? 0;
    return Date.now() < until;
  }

  isOutOfBounds(x: number, y: number): boolean {
    const bz = this.blastZones;
    return x < bz.left || x > bz.right || y < bz.top || y > bz.bottom;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add public/assets/stages/downtown-rumble.json src/systems/StageSystem.ts
git commit -m "feat: stage JSON for Downtown Rumble and StageSystem"
```

---

## Task 6: InputSystem

**Files:**
- Create: `src/systems/InputSystem.ts`

- [ ] **Step 1: Write `src/systems/InputSystem.ts`**

```typescript
import Phaser from 'phaser';
import type { PlayerInput, KeyBindings } from '../logic/types';
import { loadBindings } from '../logic/inputConfig';

type KeyMap = Record<keyof KeyBindings, Phaser.Input.Keyboard.Key>;

export class InputSystem {
  private keyMaps: [KeyMap, KeyMap];
  private prevJump: [boolean, boolean] = [false, false];
  private prevDrop: [boolean, boolean] = [false, false];
  private prevLight: [boolean, boolean] = [false, false];
  private prevHeavy: [boolean, boolean] = [false, false];

  // Touch state injected by TouchControls
  private touchInput: [Partial<PlayerInput>, Partial<PlayerInput>] = [{}, {}];

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    const bindings = loadBindings();
    this.keyMaps = [
      this.buildKeyMap(keyboard, bindings[0]),
      this.buildKeyMap(keyboard, bindings[1]),
    ];
  }

  private buildKeyMap(kb: Phaser.Input.Keyboard.KeyboardPlugin, b: KeyBindings): KeyMap {
    const codes = Phaser.Input.Keyboard.KeyCodes as Record<string, number>;
    const addKey = (name: string) => kb.addKey(codes[name] ?? name);
    return {
      left: addKey(b.left), right: addKey(b.right),
      aimUp: addKey(b.aimUp), aimDown: addKey(b.aimDown),
      jump: addKey(b.jump), drop: addKey(b.drop),
      lightAttack: addKey(b.lightAttack), heavyAttack: addKey(b.heavyAttack),
    };
  }

  /** Must be called once per frame in GameScene.update() */
  update(): void {
    // track previous state for rising-edge detection handled in getInput()
  }

  getInput(player: 0 | 1): PlayerInput {
    const km = this.keyMaps[player];
    const touch = this.touchInput[player];

    const leftDown = km.left.isDown;
    const rightDown = km.right.isDown;
    const upDown = km.aimUp.isDown;
    const downDown = km.aimDown.isDown;

    const jumpDown = km.jump.isDown;
    const dropDown = km.drop.isDown;
    const lightDown = km.lightAttack.isDown;
    const heavyDown = km.heavyAttack.isDown;

    // Rising edge
    const jumpPressed = jumpDown && !this.prevJump[player];
    const dropPressed = dropDown && !this.prevDrop[player];
    const lightPressed = lightDown && !this.prevLight[player];
    const heavyPressed = heavyDown && !this.prevHeavy[player];

    this.prevJump[player] = jumpDown;
    this.prevDrop[player] = dropDown;
    this.prevLight[player] = lightDown;
    this.prevHeavy[player] = heavyDown;

    const axisX = (touch.axis?.x ?? 0) || (rightDown ? 1 : leftDown ? -1 : 0);
    const axisY = (touch.axis?.y ?? 0) || (downDown ? 1 : upDown ? -1 : 0);

    return {
      axis: { x: axisX as -1 | 0 | 1, y: axisY as -1 | 0 | 1 },
      jumpPressed: jumpPressed || (touch.jumpPressed ?? false),
      dropPressed: dropPressed || (touch.dropPressed ?? false),
      lightPressed: lightPressed || (touch.lightPressed ?? false),
      heavyPressed: heavyPressed || (touch.heavyPressed ?? false),
    };
  }

  /** Called by TouchControls to inject mobile input for one player. */
  setTouchInput(player: 0 | 1, input: Partial<PlayerInput>): void {
    this.touchInput[player] = input;
  }

  /** Call after loading new bindings from SettingsScene. */
  rebuild(keyboard: Phaser.Input.Keyboard.KeyboardPlugin): void {
    const bindings = loadBindings();
    this.keyMaps = [
      this.buildKeyMap(keyboard, bindings[0]),
      this.buildKeyMap(keyboard, bindings[1]),
    ];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/InputSystem.ts
git commit -m "feat: InputSystem — keyboard bindings and rising-edge detection"
```

---

## Task 7: Fighter Base Class + States

**Files:**
- Create: `src/fighters/Fighter.ts`
- Create: `src/fighters/states/IdleState.ts`
- Create: `src/fighters/states/RunState.ts`
- Create: `src/fighters/states/JumpState.ts`
- Create: `src/fighters/states/DoubleJumpState.ts`
- Create: `src/fighters/states/FallState.ts`
- Create: `src/fighters/states/AttackState.ts`
- Create: `src/fighters/states/HitstunState.ts`
- Create: `src/fighters/states/LaunchedState.ts`
- Create: `src/fighters/states/DeadState.ts`

- [ ] **Step 1: Write all state files**

`src/fighters/states/IdleState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class IdleState implements State<Fighter> {
  enter(f: Fighter) { f.setVelocityX(0); f.playAnim('idle'); }
  update(f: Fighter): StateKey | null {
    const { axis, jumpPressed } = f.getInput();
    if (jumpPressed) return 'JUMP';
    if (axis.x !== 0) return 'RUN';
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down) return 'FALL';
    return null;
  }
  exit(_f: Fighter) {}
}
```

`src/fighters/states/RunState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class RunState implements State<Fighter> {
  enter(f: Fighter) { f.playAnim('run'); }
  update(f: Fighter): StateKey | null {
    const { axis, jumpPressed, lightPressed, heavyPressed } = f.getInput();
    if (jumpPressed) return 'JUMP';
    if (lightPressed || heavyPressed) return 'ATTACK';
    if (axis.x === 0) return 'IDLE';
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down) return 'FALL';
    f.setVelocityX(axis.x * f.stats.moveSpeed);
    f.setFlipX(axis.x < 0);
    f.facingRight = axis.x > 0;
    return null;
  }
  exit(_f: Fighter) {}
}
```

`src/fighters/states/JumpState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class JumpState implements State<Fighter> {
  enter(f: Fighter) {
    f.setVelocityY(f.stats.jumpForce);
    f.playAnim('jump');
    f.canDoubleJump = true;
  }
  update(f: Fighter): StateKey | null {
    const { jumpPressed, lightPressed, heavyPressed } = f.getInput();
    if (jumpPressed && f.canDoubleJump) return 'DOUBLE_JUMP';
    if (lightPressed || heavyPressed) return 'ATTACK';
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 0) return 'FALL';
    this.applyAirControl(f);
    return null;
  }
  exit(_f: Fighter) {}
  private applyAirControl(f: Fighter): void {
    const { axis } = f.getInput();
    if (axis.x !== 0) {
      f.setVelocityX(axis.x * f.stats.moveSpeed);
      f.setFlipX(axis.x < 0);
      f.facingRight = axis.x > 0;
    }
  }
}
```

`src/fighters/states/DoubleJumpState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class DoubleJumpState implements State<Fighter> {
  enter(f: Fighter) {
    f.setVelocityY(f.stats.doubleJumpForce);
    f.playAnim('double_jump');
    f.canDoubleJump = false;
  }
  update(f: Fighter): StateKey | null {
    const { lightPressed, heavyPressed } = f.getInput();
    if (lightPressed || heavyPressed) return 'ATTACK';
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 0) return 'FALL';
    const { axis } = f.getInput();
    if (axis.x !== 0) {
      f.setVelocityX(axis.x * f.stats.moveSpeed);
      f.setFlipX(axis.x < 0);
      f.facingRight = axis.x > 0;
    }
    return null;
  }
  exit(_f: Fighter) {}
}
```

`src/fighters/states/FallState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class FallState implements State<Fighter> {
  enter(f: Fighter) { f.playAnim('fall'); }
  update(f: Fighter): StateKey | null {
    const { jumpPressed, lightPressed, heavyPressed } = f.getInput();
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (jumpPressed && f.canDoubleJump) return 'DOUBLE_JUMP';
    if (lightPressed || heavyPressed) return 'ATTACK';
    if (body.blocked.down) return 'IDLE';
    const { axis } = f.getInput();
    if (axis.x !== 0) {
      f.setVelocityX(axis.x * f.stats.moveSpeed);
      f.setFlipX(axis.x < 0);
      f.facingRight = axis.x > 0;
    }
    return null;
  }
  exit(_f: Fighter) {}
}
```

`src/fighters/states/AttackState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey, AttackDef } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { resolveAttack } from '../../logic/attackResolver';

export class AttackState implements State<Fighter> {
  private currentAttack: AttackDef | null = null;
  private frameCount = 0;

  enter(f: Fighter): void {
    const { lightPressed, heavyPressed } = f.getInput();
    const inputType = heavyPressed ? 'heavy' : 'light';
    const aim = f.getAimDirection();
    this.currentAttack = resolveAttack(f.stats.attacks, inputType, aim, f.isArmed) ?? null;
    this.frameCount = 0;
    if (this.currentAttack) {
      f.playAnim(this.currentAttack.animation, true);
      f.activeAttack = this.currentAttack;
    }
  }

  update(f: Fighter, delta: number): StateKey | null {
    if (!this.currentAttack) return 'IDLE';
    this.frameCount++;
    const [start, end] = this.currentAttack.activeFrames;
    f.hitboxActive = this.frameCount >= start && this.frameCount <= end;

    // Animation complete?
    if (!f.anims.isPlaying || f.anims.currentFrame?.index === f.anims.currentAnim?.frames.length - 1) {
      f.hitboxActive = false;
      f.activeAttack = null;
      const body = f.body as Phaser.Physics.Arcade.Body;
      return body.blocked.down ? 'IDLE' : 'FALL';
    }
    return null;
  }

  exit(f: Fighter): void {
    f.hitboxActive = false;
    f.activeAttack = null;
  }
}
```

`src/fighters/states/HitstunState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { HITSTUN_BASE_MS } from '../../logic/constants';

export class HitstunState implements State<Fighter> {
  private elapsed = 0;
  private duration = HITSTUN_BASE_MS;

  enter(f: Fighter): void {
    this.elapsed = 0;
    this.duration = HITSTUN_BASE_MS + f.damagePercent * 2;
    f.playAnim('hitstun');
  }

  update(_f: Fighter, delta: number): StateKey | null {
    this.elapsed += delta;
    if (this.elapsed >= this.duration) return 'FALL';
    return null;
  }

  exit(_f: Fighter) {}
}
```

`src/fighters/states/LaunchedState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { LAUNCHED_RECOVERY_SPEED } from '../../logic/constants';

export class LaunchedState implements State<Fighter> {
  enter(f: Fighter) { f.playAnim('launched'); f.canDoubleJump = false; }

  update(f: Fighter): StateKey | null {
    const body = f.body as Phaser.Physics.Arcade.Body;
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (speed < LAUNCHED_RECOVERY_SPEED && body.blocked.down) return 'IDLE';
    return null;
  }

  exit(_f: Fighter) {}
}
```

`src/fighters/states/DeadState.ts`:
```typescript
import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { RESPAWN_DELAY_MS } from '../../logic/constants';

export class DeadState implements State<Fighter> {
  private elapsed = 0;

  enter(f: Fighter): void {
    this.elapsed = 0;
    f.setActive(false).setVisible(false);
    f.setVelocity(0, 0);
  }

  update(f: Fighter, delta: number): StateKey | null {
    this.elapsed += delta;
    if (this.elapsed >= RESPAWN_DELAY_MS) {
      f.respawn();
      return 'IDLE';
    }
    return null;
  }

  exit(_f: Fighter) {}
}
```

- [ ] **Step 2: Write `src/fighters/Fighter.ts`**

```typescript
import Phaser from 'phaser';
import { StateMachine } from '../logic/StateMachine';
import type { FighterStats, PlayerInput, AttackDef, AimDirection } from '../logic/types';
import { STARTING_STOCKS } from '../logic/constants';
import { IdleState } from './states/IdleState';
import { RunState } from './states/RunState';
import { JumpState } from './states/JumpState';
import { DoubleJumpState } from './states/DoubleJumpState';
import { FallState } from './states/FallState';
import { AttackState } from './states/AttackState';
import { HitstunState } from './states/HitstunState';
import { LaunchedState } from './states/LaunchedState';
import { DeadState } from './states/DeadState';

export abstract class Fighter extends Phaser.Physics.Arcade.Sprite {
  abstract readonly stats: FighterStats;
  abstract readonly characterName: string;

  damagePercent = 0;
  stocks = STARTING_STOCKS;
  isArmed = false;
  facingRight = true;
  canDoubleJump = false;
  hitboxActive = false;
  activeAttack: AttackDef | null = null;

  private sm!: StateMachine<Fighter>;
  private currentInput: PlayerInput = {
    axis: { x: 0, y: 0 },
    jumpPressed: false, dropPressed: false, lightPressed: false, heavyPressed: false,
  };
  private spawnX = 0;
  private spawnY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.spawnX = x;
    this.spawnY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    // Slight narrower hurtbox than sprite for fairness
    body.setSize(40, 60);
  }

  init(): void {
    this.sm = new StateMachine<Fighter>();
    this.sm
      .register('IDLE', new IdleState())
      .register('RUN', new RunState())
      .register('JUMP', new JumpState())
      .register('DOUBLE_JUMP', new DoubleJumpState())
      .register('FALL', new FallState())
      .register('ATTACK', new AttackState())
      .register('HITSTUN', new HitstunState())
      .register('LAUNCHED', new LaunchedState())
      .register('DEAD', new DeadState());
    this.sm.transition(this, 'IDLE');
  }

  update(input: PlayerInput, delta: number): void {
    this.currentInput = input;
    this.sm.update(this, delta);
  }

  getInput(): PlayerInput { return this.currentInput; }

  getState(): string { return this.sm.current; }

  getAimDirection(): AimDirection {
    if (this.currentInput.axis.y < 0) return 'up';
    if (this.currentInput.axis.y > 0) return 'down';
    return 'neutral';
  }

  receiveHit(attack: AttackDef, attackerFacingRight: boolean): void {
    if (this.sm.current === 'DEAD') return;
    this.damagePercent += attack.damage;
    const { calcKnockbackVelocity } = require('../logic/knockback');
    const vel = calcKnockbackVelocity(
      attack.knockbackBase, attack.knockbackScaling,
      attack.knockbackAngle, this.damagePercent,
      this.stats.weight, attackerFacingRight,
    );
    this.setVelocity(vel.x, vel.y);
    if (Math.abs(vel.x) > 600 || Math.abs(vel.y) > 600) {
      this.sm.transition(this, 'LAUNCHED');
    } else {
      this.sm.transition(this, 'HITSTUN');
    }
  }

  loseStock(): void {
    this.stocks -= 1;
    this.sm.transition(this, 'DEAD');
  }

  respawn(): void {
    this.damagePercent = 0;
    this.isArmed = false;
    this.setPosition(this.spawnX, this.spawnY);
    this.setVelocity(0, 0);
    this.setActive(true).setVisible(true);
  }

  setSpawn(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
  }

  playAnim(key: string, ignoreIfPlaying = false): void {
    const fullKey = `${this.characterName}_${key}`;
    if (this.anims.exists(fullKey)) {
      this.play(fullKey, ignoreIfPlaying);
    }
    // If animation doesn't exist yet (no art), silently skip
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/fighters/
git commit -m "feat: Fighter base class and all state implementations"
```

---

## Task 8: CowboyMelon Character

**Files:**
- Create: `src/fighters/characters/CowboyMelon.ts`

- [ ] **Step 1: Write `src/fighters/characters/CowboyMelon.ts`**

```typescript
import Phaser from 'phaser';
import { Fighter } from '../Fighter';
import type { FighterStats } from '../../logic/types';

export class CowboyMelon extends Fighter {
  readonly characterName = 'cowboymelon';
  readonly stats: FighterStats = {
    moveSpeed: 280,
    jumpForce: -560,
    doubleJumpForce: -480,
    weight: 1.1, // slightly heavy
    attacks: [
      // ── Unarmed ────────────────────────────────────────────────
      {
        id: 'light_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'light',
        activeFrames: [2, 7], hitbox: { x: 32, y: -8, w: 44, h: 32 },
        damage: 5, knockbackBase: 140, knockbackScaling: 1.1, knockbackAngle: 25,
        animation: 'light_neutral',
      },
      {
        id: 'light_up', requiresWeapon: false, aimDirection: 'up', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -10, y: -56, w: 36, h: 44 },
        damage: 6, knockbackBase: 160, knockbackScaling: 1.2, knockbackAngle: 82,
        animation: 'light_up',
      },
      {
        id: 'light_down', requiresWeapon: false, aimDirection: 'down', inputType: 'light',
        activeFrames: [3, 7], hitbox: { x: -12, y: 20, w: 40, h: 36 },
        damage: 5, knockbackBase: 130, knockbackScaling: 1.0, knockbackAngle: 270,
        animation: 'light_down',
      },
      {
        id: 'heavy_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'heavy',
        activeFrames: [5, 11], hitbox: { x: 36, y: -12, w: 56, h: 40 },
        damage: 14, knockbackBase: 260, knockbackScaling: 2.0, knockbackAngle: 28,
        animation: 'heavy_neutral',
      },
      {
        id: 'heavy_up', requiresWeapon: false, aimDirection: 'up', inputType: 'heavy',
        activeFrames: [4, 10], hitbox: { x: -12, y: -64, w: 36, h: 52 },
        damage: 16, knockbackBase: 300, knockbackScaling: 2.4, knockbackAngle: 88,
        animation: 'heavy_up',
      },
      {
        id: 'heavy_down', requiresWeapon: false, aimDirection: 'down', inputType: 'heavy',
        activeFrames: [5, 10], hitbox: { x: -14, y: 24, w: 44, h: 44 },
        damage: 12, knockbackBase: 220, knockbackScaling: 1.8, knockbackAngle: 275,
        animation: 'heavy_down',
      },
      // ── Armed (grappling hook) ──────────────────────────────────
      {
        id: 'armed_light_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'light',
        activeFrames: [1, 6], hitbox: { x: 40, y: -10, w: 70, h: 28 },
        damage: 8, knockbackBase: 180, knockbackScaling: 1.4, knockbackAngle: 20,
        animation: 'armed_light_neutral',
      },
      {
        id: 'armed_light_up', requiresWeapon: true, aimDirection: 'up', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -8, y: -70, w: 32, h: 56 },
        damage: 9, knockbackBase: 200, knockbackScaling: 1.5, knockbackAngle: 80,
        animation: 'armed_light_up',
      },
      {
        id: 'armed_light_down', requiresWeapon: true, aimDirection: 'down', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -10, y: 24, w: 36, h: 50 },
        damage: 8, knockbackBase: 170, knockbackScaling: 1.3, knockbackAngle: 268,
        animation: 'armed_light_down',
      },
      {
        id: 'armed_heavy_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'heavy',
        activeFrames: [4, 12], hitbox: { x: 44, y: -14, w: 90, h: 36 },
        damage: 18, knockbackBase: 340, knockbackScaling: 2.6, knockbackAngle: 22,
        animation: 'armed_heavy_neutral',
      },
      {
        id: 'armed_heavy_up', requiresWeapon: true, aimDirection: 'up', inputType: 'heavy',
        activeFrames: [5, 11], hitbox: { x: -10, y: -80, w: 36, h: 68 },
        damage: 20, knockbackBase: 360, knockbackScaling: 2.8, knockbackAngle: 86,
        animation: 'armed_heavy_up',
      },
      {
        id: 'armed_heavy_down', requiresWeapon: true, aimDirection: 'down', inputType: 'heavy',
        activeFrames: [5, 12], hitbox: { x: -14, y: 28, w: 48, h: 64 },
        damage: 16, knockbackBase: 300, knockbackScaling: 2.2, knockbackAngle: 272,
        animation: 'armed_heavy_down',
      },
    ],
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 'cowboymelon_placeholder' is generated in PreloadScene
    super(scene, x, y, 'cowboymelon_placeholder');
    this.init();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/fighters/characters/CowboyMelon.ts
git commit -m "feat: CowboyMelon character with full attack set"
```

---

## Task 9: CombatSystem + WeaponSystem

**Files:**
- Create: `src/systems/CombatSystem.ts`
- Create: `src/systems/WeaponSystem.ts`

- [ ] **Step 1: Write `src/systems/CombatSystem.ts`**

```typescript
import Phaser from 'phaser';
import type { Fighter } from '../fighters/Fighter';

export class CombatSystem {
  private scene: Phaser.Scene;
  /** Set of "attackerId_defenderId" pairs hit in this swing — prevents double hits */
  private hitCooldowns = new Set<string>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Call each frame after all fighters have updated their state. */
  update(fighters: Fighter[]): void {
    this.hitCooldowns.clear();

    for (const attacker of fighters) {
      if (!attacker.hitboxActive || !attacker.activeAttack) continue;
      const attack = attacker.activeAttack;

      for (const defender of fighters) {
        if (defender === attacker) continue;
        if (defender.getState() === 'DEAD') continue;

        const key = `${attacker.name}_${defender.name}`;
        if (this.hitCooldowns.has(key)) continue;

        if (this.checkOverlap(attacker, defender)) {
          this.hitCooldowns.add(key);
          defender.receiveHit(attack, attacker.facingRight);
          if (defender.isArmed && Math.random() < 0.3) {
            defender.isArmed = false;
            // WeaponSystem will see isArmed=false and spawn a drop
          }
        }
      }
    }
  }

  private checkOverlap(attacker: Fighter, defender: Fighter): boolean {
    const a = attacker.activeAttack!;
    const flip = attacker.facingRight ? 1 : -1;

    const hbX = attacker.x + a.hitbox.x * flip;
    const hbY = attacker.y + a.hitbox.y;
    const hbW = a.hitbox.w;
    const hbH = a.hitbox.h;

    const body = defender.body as Phaser.Physics.Arcade.Body;
    const dx = Math.abs(defender.x - hbX);
    const dy = Math.abs(defender.y - hbY);

    return dx < (hbW / 2 + body.halfWidth) && dy < (hbH / 2 + body.halfHeight);
  }
}
```

- [ ] **Step 2: Write `src/systems/WeaponSystem.ts`**

```typescript
import Phaser from 'phaser';
import type { StageData } from '../logic/types';
import { WEAPON_RESPAWN_MS } from '../logic/constants';
import type { Fighter } from '../fighters/Fighter';

interface WeaponPickup {
  sprite: Phaser.GameObjects.Rectangle;
  spawnX: number;
  spawnY: number;
  respawnAt: number | null; // null = currently on stage
}

export class WeaponSystem {
  private scene: Phaser.Scene;
  private pickups: WeaponPickup[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  load(data: StageData): void {
    for (const sp of data.weaponSpawns) {
      const sprite = this.scene.add.rectangle(sp.x, sp.y, 24, 24, 0xffd700);
      this.scene.physics.add.existing(sprite);
      this.pickups.push({ sprite, spawnX: sp.x, spawnY: sp.y, respawnAt: null });
    }
  }

  update(fighters: Fighter[], now: number): void {
    for (const pickup of this.pickups) {
      // Respawn
      if (pickup.respawnAt !== null && now >= pickup.respawnAt) {
        pickup.sprite.setPosition(pickup.spawnX, pickup.spawnY);
        pickup.sprite.setVisible(true).setActive(true);
        pickup.respawnAt = null;
      }

      if (!pickup.sprite.active) continue;

      // Check collection
      for (const f of fighters) {
        if (f.isArmed || f.getState() === 'DEAD') continue;
        const dx = Math.abs(f.x - pickup.sprite.x);
        const dy = Math.abs(f.y - pickup.sprite.y);
        if (dx < 36 && dy < 36) {
          f.isArmed = true;
          pickup.sprite.setVisible(false).setActive(false);
          pickup.respawnAt = now + WEAPON_RESPAWN_MS;
          break;
        }
      }
    }

    // Handle weapon drops: if a fighter just lost their weapon, drop it at their position
    for (const f of fighters) {
      if (!f.isArmed) {
        // We rely on CombatSystem having set isArmed=false; nothing else to do here
        // The weapon stays invisible until respawn timer expires
      }
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/systems/CombatSystem.ts src/systems/WeaponSystem.ts
git commit -m "feat: CombatSystem (hitbox overlap) and WeaponSystem (pickups + respawn)"
```

---

## Task 10: HUD

**Files:**
- Create: `src/ui/HUD.ts`

- [ ] **Step 1: Write `src/ui/HUD.ts`**

```typescript
import Phaser from 'phaser';
import type { Fighter } from '../fighters/Fighter';
import { STARTING_STOCKS } from '../logic/constants';

export class HUD {
  private scene: Phaser.Scene;
  private p1StockIcons: Phaser.GameObjects.Ellipse[] = [];
  private p2StockIcons: Phaser.GameObjects.Ellipse[] = [];
  private p1DmgText!: Phaser.GameObjects.Text;
  private p2DmgText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(p1: Fighter, p2: Fighter): void {
    const style = { fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' };

    // P1 — top left
    this.scene.add.text(16, 12, `P1 · ${p1.characterName}`, { ...style, color: '#4a90e2' }).setScrollFactor(0);
    for (let i = 0; i < STARTING_STOCKS; i++) {
      const dot = this.scene.add.ellipse(20 + i * 18, 38, 12, 12, 0x4a90e2).setScrollFactor(0);
      this.p1StockIcons.push(dot);
    }
    this.p1DmgText = this.scene.add.text(16, 50, '0%', { ...style, color: '#ff9900', fontSize: '20px' }).setScrollFactor(0);

    // P2 — top right
    this.scene.add.text(1264, 12, `P2 · ${p2.characterName}`, { ...style, color: '#e24a4a', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
    for (let i = 0; i < STARTING_STOCKS; i++) {
      const dot = this.scene.add.ellipse(1264 - i * 18, 38, 12, 12, 0xe24a4a).setScrollFactor(0);
      this.p2StockIcons.push(dot);
    }
    this.p2DmgText = this.scene.add.text(1264, 50, '0%', { ...style, color: '#ff9900', fontSize: '20px', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
  }

  update(p1: Fighter, p2: Fighter): void {
    this.p1DmgText.setText(`${Math.round(p1.damagePercent)}%`);
    this.p2DmgText.setText(`${Math.round(p2.damagePercent)}%`);

    this.p1StockIcons.forEach((icon, i) => icon.setAlpha(i < p1.stocks ? 1 : 0.15));
    this.p2StockIcons.forEach((icon, i) => icon.setAlpha(i < p2.stocks ? 1 : 0.15));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/HUD.ts
git commit -m "feat: HUD — stock icons and damage percentage display"
```

---

## Task 11: GameScene — First Playable

**Files:**
- Modify: `src/main.ts`
- Create: `src/scenes/GameScene.ts`
- Create: `src/scenes/BootScene.ts` (placeholder)
- Create: `src/scenes/PreloadScene.ts`

- [ ] **Step 1: Write `src/scenes/PreloadScene.ts`**

This generates placeholder textures until real art arrives:

```typescript
import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload(): void {
    // Load stage data
    this.load.json('downtown-rumble', 'assets/stages/downtown-rumble.json');
  }

  create(): void {
    // Generate placeholder character textures
    this.makeCharTexture('cowboymelon_placeholder', 0x5aaa4f, 48, 72);
    this.makeCharTexture('character2_placeholder', 0x4a70e2, 48, 72);

    // Generate placeholder background layers
    this.makeBgLayer('bg_sky', 0x0a0010, 1280, 720);
    this.makeBgLayer('bg_far', 0x1a0535, 1280, 300);
    this.makeBgLayer('bg_mid', 0x2a1050, 1280, 400);
    this.makeBgLayer('bg_near', 0x1e1535, 1280, 500);

    this.scene.start('MainMenu');
  }

  private makeCharTexture(key: string, color: number, w: number, h: number): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x000000, 0.3);
    g.fillRect(8, 8, 12, 14); // left eye
    g.fillRect(28, 8, 12, 14); // right eye
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeBgLayer(key: string, color: number, w: number, h: number): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
```

- [ ] **Step 2: Write `src/scenes/GameScene.ts`**

```typescript
import Phaser from 'phaser';
import { InputSystem } from '../systems/InputSystem';
import { StageSystem } from '../systems/StageSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { HUD } from '../ui/HUD';
import { CowboyMelon } from '../fighters/characters/CowboyMelon';
import type { Fighter } from '../fighters/Fighter';
import type { StageData } from '../logic/types';

export class GameScene extends Phaser.Scene {
  private inputSystem!: InputSystem;
  private stageSystem!: StageSystem;
  private combatSystem!: CombatSystem;
  private weaponSystem!: WeaponSystem;
  private hud!: HUD;
  private fighters!: [Fighter, Fighter];

  constructor() { super('Game'); }

  create(): void {
    const stageData = this.cache.json.get('downtown-rumble') as StageData;

    // Systems
    this.inputSystem = new InputSystem(this.input.keyboard!);
    this.stageSystem = new StageSystem(this);
    this.stageSystem.load(stageData);
    this.combatSystem = new CombatSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.weaponSystem.load(stageData);

    // Background layers (parallax)
    this.add.image(640, 360, 'bg_sky').setScrollFactor(0);
    this.add.image(640, 500, 'bg_far').setScrollFactor(0.1);
    this.add.image(640, 450, 'bg_mid').setScrollFactor(0.3);
    this.add.image(640, 400, 'bg_near').setScrollFactor(0.6);

    // Spawn fighters
    const sp1 = stageData.spawnPoints.find(s => s.player === 1)!;
    const sp2 = stageData.spawnPoints.find(s => s.player === 2)!;
    const p1 = new CowboyMelon(this, sp1.x, sp1.y);
    // P2 is also CowboyMelon until second character is added
    const p2 = new CowboyMelon(this, sp2.x, sp2.y);
    p2.setTint(0xe24a4a);
    p1.setSpawn(sp1.x, sp1.y);
    p2.setSpawn(sp2.x, sp2.y);
    p1.name = 'p1';
    p2.name = 'p2';
    this.fighters = [p1, p2];

    // Physics colliders — solid platforms
    const solid = this.stageSystem.getSolidGroup();
    this.physics.add.collider(p1, solid);
    this.physics.add.collider(p2, solid);

    // Pass-through platforms
    const passthrough = this.stageSystem.getPassthroughGroup();
    this.physics.add.collider(p1, passthrough, undefined, (sprite) => {
      return !this.stageSystem.isDropThroughActive(p1.name) &&
             (p1.body as Phaser.Physics.Arcade.Body).velocity.y >= 0;
    });
    this.physics.add.collider(p2, passthrough, undefined, (sprite) => {
      return !this.stageSystem.isDropThroughActive(p2.name) &&
             (p2.body as Phaser.Physics.Arcade.Body).velocity.y >= 0;
    });

    // HUD
    this.hud = new HUD(this);
    this.hud.create(p1, p2);

    // Physics world
    this.physics.world.gravity.y = 800;
  }

  update(_time: number, delta: number): void {
    const now = Date.now();
    const [p1, p2] = this.fighters;

    const in1 = this.inputSystem.getInput(0);
    const in2 = this.inputSystem.getInput(1);

    // Handle drop-through trigger
    if (in1.dropPressed) this.stageSystem.startDropThrough(p1.name);
    if (in2.dropPressed) this.stageSystem.startDropThrough(p2.name);

    p1.update(in1, delta);
    p2.update(in2, delta);

    this.combatSystem.update(this.fighters);
    this.weaponSystem.update(this.fighters, now);
    this.hud.update(p1, p2);

    // Blast zone check
    for (const f of this.fighters) {
      if (f.getState() === 'DEAD') continue;
      if (this.stageSystem.isOutOfBounds(f.x, f.y)) {
        f.loseStock();
        if (f.stocks <= 0) {
          this.endGame(f === p1 ? p2 : p1);
        }
      }
    }
  }

  private endGame(winner: Fighter): void {
    this.scene.start('Result', { winnerName: winner.characterName });
  }
}
```

- [ ] **Step 3: Write `src/scenes/BootScene.ts`**

```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Preload'); }
}
```

- [ ] **Step 4: Update `src/main.ts` to wire all scenes**

```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';

// Remaining scenes added in Task 12
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 800 }, debug: false },
  },
  scene: [BootScene, PreloadScene, GameScene],
  parent: 'game',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

// Jump straight to Game for development
new Phaser.Game(config);
```

- [ ] **Step 5: Also fix the dynamic `require()` in Fighter.ts**

The `require('../logic/knockback')` in `Fighter.receiveHit` is not valid in ES modules. Replace that method in `src/fighters/Fighter.ts`:

```typescript
// Add this import at the top of Fighter.ts:
import { calcKnockbackVelocity } from '../logic/knockback';

// Replace receiveHit with:
receiveHit(attack: AttackDef, attackerFacingRight: boolean): void {
  if (this.sm.current === 'DEAD') return;
  this.damagePercent += attack.damage;
  const vel = calcKnockbackVelocity(
    attack.knockbackBase, attack.knockbackScaling,
    attack.knockbackAngle, this.damagePercent,
    this.stats.weight, attackerFacingRight,
  );
  this.setVelocity(vel.x, vel.y);
  if (Math.abs(vel.x) > 600 || Math.abs(vel.y) > 600) {
    this.sm.transition(this, 'LAUNCHED');
  } else {
    this.sm.transition(this, 'HITSTUN');
  }
}
```

- [ ] **Step 6: Run dev server and verify manually**

```bash
pnpm dev
```

Open the URL. You should see:
- Dark background with coloured platform rectangles
- Two coloured rectangles (fighters) standing on the ground platform
- P1 (green) moves with A/D, jumps with Space, attacks with F/G
- P2 (red-tinted green) moves with arrow keys, jumps with Numpad 0
- Hitting the opponent increases their damage %
- Falling off the stage loses a stock (HUD icon fades)
- Game transitions to a (missing) Result scene after stocks depleted

- [ ] **Step 7: Run all unit tests**

```bash
pnpm test
```

Expected: all 22 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: first playable — two fighters on Downtown Rumble with combat and HUD"
```

---

## Task 12: Scene Chain + Settings UI

**Files:**
- Create: `src/scenes/MainMenuScene.ts`
- Create: `src/scenes/CharacterSelectScene.ts`
- Create: `src/scenes/SettingsScene.ts`
- Create: `src/scenes/ResultScene.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Write `src/scenes/MainMenuScene.ts`**

```typescript
import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create(): void {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 120, 'BIT WARRIORS', {
      fontSize: '64px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeButton(cx, cy, 'FIGHT', () => this.scene.start('CharacterSelect'));
    this.makeButton(cx, cy + 70, 'SETTINGS', () => this.scene.start('Settings'));
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '32px', color: '#aaaaaa', fontFamily: 'monospace',
      backgroundColor: '#222233', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', cb);
  }
}
```

- [ ] **Step 2: Write `src/scenes/CharacterSelectScene.ts`**

```typescript
import Phaser from 'phaser';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelect'); }

  create(): void {
    this.add.text(640, 80, 'SELECT CHARACTER', {
      fontSize: '40px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // For prototype: only CowboyMelon. Just start the game.
    this.add.text(640, 360, 'CowboyMelon vs CowboyMelon', {
      fontSize: '28px', color: '#5aaa4f', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.makeButton(640, 500, 'READY — FIGHT!', () => this.scene.start('Game'));
    this.makeButton(640, 580, '← BACK', () => this.scene.start('MainMenu'));
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '28px', color: '#aaaaaa', fontFamily: 'monospace',
      backgroundColor: '#222233', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', cb);
  }
}
```

- [ ] **Step 3: Write `src/scenes/ResultScene.ts`**

```typescript
import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  create(data: { winnerName: string }): void {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 80, `${data.winnerName} WINS!`, {
      fontSize: '56px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeButton(cx, cy + 60, 'REMATCH', () => this.scene.start('Game'));
    this.makeButton(cx, cy + 140, 'MAIN MENU', () => this.scene.start('MainMenu'));
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '32px', color: '#aaaaaa', fontFamily: 'monospace',
      backgroundColor: '#222233', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', cb);
  }
}
```

- [ ] **Step 4: Write `src/scenes/SettingsScene.ts`**

```typescript
import Phaser from 'phaser';
import {
  loadBindings, saveBindings, resetBindings, findConflicts, DEFAULT_BINDINGS,
} from '../logic/inputConfig';
import type { KeyBindings } from '../logic/types';

type ActionKey = keyof KeyBindings;
const ACTIONS: ActionKey[] = ['left', 'right', 'aimUp', 'aimDown', 'jump', 'drop', 'lightAttack', 'heavyAttack'];
const ACTION_LABELS: Record<ActionKey, string> = {
  left: 'Left', right: 'Right', aimUp: 'Aim Up', aimDown: 'Aim Down',
  jump: 'Jump (×2 = double)', drop: 'Drop Through', lightAttack: 'Light Attack', heavyAttack: 'Heavy Attack',
};

export class SettingsScene extends Phaser.Scene {
  private bindings!: [KeyBindings, KeyBindings];
  private waitingFor: { player: 0 | 1; action: ActionKey } | null = null;
  private badges: Phaser.GameObjects.Text[] = [];
  private conflictText!: Phaser.GameObjects.Text;

  constructor() { super('Settings'); }

  create(): void {
    this.bindings = loadBindings();
    this.cameras.main.setBackgroundColor('#0d1117');

    this.add.text(640, 30, 'CONTROLS', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.buildColumns();

    this.conflictText = this.add.text(640, 660, '', {
      fontSize: '13px', color: '#ff9944', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Reset buttons
    this.makeButton(200, 620, '↺ Reset P1', () => { this.bindings = resetBindings(0, this.bindings); this.refreshBadges(); });
    this.makeButton(1080, 620, '↺ Reset P2', () => { this.bindings = resetBindings(1, this.bindings); this.refreshBadges(); });

    // Back
    this.makeButton(640, 700, '← Back', () => { saveBindings(this.bindings); this.scene.start('MainMenu'); });

    // Keyboard capture for rebinding
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => this.handleKeydown(ev));

    this.refreshConflicts();
  }

  private buildColumns(): void {
    const playerColors = ['#4a90e2', '#e24a4a'];
    const columnX = [200, 1080];

    for (const pi of [0, 1] as const) {
      this.add.text(columnX[pi], 70, `PLAYER ${pi + 1}`, {
        fontSize: '20px', color: playerColors[pi], fontFamily: 'monospace',
      }).setOrigin(0.5);

      this.add.text(columnX[pi], 95, '── AXIS ──', {
        fontSize: '11px', color: '#555555', fontFamily: 'monospace',
      }).setOrigin(0.5);

      ACTIONS.forEach((action, ai) => {
        const y = 120 + ai * 58 + (ai >= 4 ? 20 : 0); // gap between axis and actions
        if (ai === 4) {
          this.add.text(columnX[pi], 120 + 4 * 58 + 2, '── ACTIONS ──', {
            fontSize: '11px', color: '#555555', fontFamily: 'monospace',
          }).setOrigin(0.5);
        }
        this.add.text(columnX[pi] - 80, y, ACTION_LABELS[action], {
          fontSize: '13px', color: '#8b949e', fontFamily: 'monospace',
        }).setOrigin(1, 0.5);

        const badge = this.add.text(columnX[pi] + 20, y, this.bindings[pi][action], {
          fontSize: '13px', color: '#e6edf3', fontFamily: 'monospace',
          backgroundColor: '#21262d', padding: { x: 10, y: 4 },
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        const capturedPi = pi;
        const capturedAction = action;
        badge.on('pointerdown', () => {
          if (this.waitingFor) {
            const prev = this.badges[this.waitingFor.player * 8 + ACTIONS.indexOf(this.waitingFor.action)];
            prev?.setColor('#e6edf3').setBackgroundColor('#21262d');
          }
          this.waitingFor = { player: capturedPi, action: capturedAction };
          badge.setText('press key…').setColor('#ff9944').setBackgroundColor('#2a1800');
        });
        badge.on('pointerover', () => { if (this.waitingFor?.action !== action) badge.setColor('#ffffff'); });
        badge.on('pointerout', () => { if (this.waitingFor?.action !== action) badge.setColor('#e6edf3'); });

        this.badges[pi * 8 + ai] = badge;
      });
    }
  }

  private handleKeydown(ev: KeyboardEvent): void {
    if (!this.waitingFor) return;
    ev.preventDefault();

    const phaserKeyName = this.eventKeyToPhaserName(ev);
    const { player, action } = this.waitingFor;
    this.bindings[player][action] = phaserKeyName;
    this.waitingFor = null;
    this.refreshBadges();
    this.refreshConflicts();
    saveBindings(this.bindings);
  }

  private eventKeyToPhaserName(ev: KeyboardEvent): string {
    const map: Record<string, string> = {
      ' ': 'SPACE', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
      'ArrowUp': 'UP', 'ArrowDown': 'DOWN', ',': 'COMMA', '.': 'PERIOD',
    };
    return map[ev.key] ?? ev.key.toUpperCase();
  }

  private refreshBadges(): void {
    ACTIONS.forEach((action, ai) => {
      for (const pi of [0, 1] as const) {
        this.badges[pi * 8 + ai]?.setText(this.bindings[pi][action]).setColor('#e6edf3').setBackgroundColor('#21262d');
      }
    });
  }

  private refreshConflicts(): void {
    const c = findConflicts(this.bindings);
    this.conflictText.setText(c.length ? `⚠ ${c.join(' | ')}` : '');
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '16px', color: '#3a7a3a', fontFamily: 'monospace',
      backgroundColor: '#1a2a1a', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#66cc66'));
    btn.on('pointerout', () => btn.setColor('#3a7a3a'));
    btn.on('pointerdown', cb);
  }
}
```

- [ ] **Step 5: Update `src/main.ts` to include all scenes**

```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { SettingsScene } from './scenes/SettingsScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 800 }, debug: false },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, CharacterSelectScene, SettingsScene, GameScene, ResultScene],
  parent: 'game',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);
```

- [ ] **Step 6: Verify full flow manually**

```bash
pnpm dev
```

Navigate: Main Menu → Settings (rebind a key, verify conflict warning) → Back → Fight → CharacterSelect → Game → (lose stocks) → Result → Rematch.

- [ ] **Step 7: Run all tests**

```bash
pnpm test
```

Expected: 22 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/scenes/
git commit -m "feat: full scene chain — MainMenu, CharacterSelect, Settings, Result"
```

---

## Task 13: Capacitor + Touch Controls

**Files:**
- Create: `capacitor.config.ts`
- Create: `src/ui/TouchControls.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Install Capacitor**

```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
pnpm exec cap init "Bit Warriors" "com.bitwarriors.game" --web-dir dist
```

Expected: `capacitor.config.ts` created (or update manually in next step).

- [ ] **Step 2: Write `capacitor.config.ts`**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bitwarriors.game',
  appName: 'Bit Warriors',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};

export default config;
```

- [ ] **Step 3: Write `src/ui/TouchControls.ts`**

```typescript
import Phaser from 'phaser';
import type { PlayerInput } from '../logic/types';
import type { InputSystem } from '../systems/InputSystem';

export class TouchControls {
  private scene: Phaser.Scene;
  private inputSystem: InputSystem;
  private state: [Partial<PlayerInput>, Partial<PlayerInput>] = [{}, {}];

  constructor(scene: Phaser.Scene, inputSystem: InputSystem) {
    this.scene = scene;
    this.inputSystem = inputSystem;
  }

  create(): void {
    if (!this.scene.sys.game.device.input.touch) return; // desktop — skip

    const s = this.scene;

    // ── P1 joystick (bottom-left) ──────────────────────────────
    this.makeJoystick(120, 580, 0);

    // ── P1 buttons (bottom-left-right) ────────────────────────
    this.makeActionButton(280, 620, '↑', 0, 'jumpPressed');
    this.makeActionButton(340, 580, 'L', 0, 'lightPressed');
    this.makeActionButton(400, 620, 'H', 0, 'heavyPressed');
    this.makeActionButton(340, 660, '↓', 0, 'dropPressed');

    // ── P2 joystick (bottom-right) ─────────────────────────────
    this.makeJoystick(1160, 580, 1);

    // ── P2 buttons ─────────────────────────────────────────────
    this.makeActionButton(880, 620, '↑', 1, 'jumpPressed');
    this.makeActionButton(940, 580, 'L', 1, 'lightPressed');
    this.makeActionButton(1000, 620, 'H', 1, 'heavyPressed');
    this.makeActionButton(940, 660, '↓', 1, 'dropPressed');
  }

  private makeJoystick(cx: number, cy: number, player: 0 | 1): void {
    const zone = this.scene.add.circle(cx, cy, 60, 0xffffff, 0.08).setScrollFactor(0).setInteractive();
    const thumb = this.scene.add.circle(cx, cy, 24, 0xffffff, 0.3).setScrollFactor(0);

    zone.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      const dx = Phaser.Math.Clamp(ptr.x - cx, -50, 50);
      const dy = Phaser.Math.Clamp(ptr.y - cy, -50, 50);
      thumb.setPosition(cx + dx, cy + dy);
      const axisX = (Math.abs(dx) > 15 ? Math.sign(dx) : 0) as -1 | 0 | 1;
      const axisY = (Math.abs(dy) > 15 ? Math.sign(dy) : 0) as -1 | 0 | 1;
      this.state[player] = { ...this.state[player], axis: { x: axisX, y: axisY } };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });

    zone.on('pointerup', () => {
      thumb.setPosition(cx, cy);
      this.state[player] = { ...this.state[player], axis: { x: 0, y: 0 } };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
  }

  private makeActionButton(
    x: number, y: number, label: string,
    player: 0 | 1, action: keyof Omit<PlayerInput, 'axis'>,
  ): void {
    const btn = this.scene.add.circle(x, y, 28, 0xffffff, 0.15).setScrollFactor(0).setInteractive();
    this.scene.add.text(x, y, label, { fontSize: '16px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5).setScrollFactor(0);

    btn.on('pointerdown', () => {
      this.state[player] = { ...this.state[player], [action]: true };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
    btn.on('pointerup', () => {
      this.state[player] = { ...this.state[player], [action]: false };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
  }
}
```

- [ ] **Step 4: Add TouchControls to `src/scenes/GameScene.ts`**

Add import at the top:
```typescript
import { TouchControls } from '../ui/TouchControls';
```

Add at the end of `create()`:
```typescript
// Touch controls (no-ops on desktop)
const touchControls = new TouchControls(this, this.inputSystem);
touchControls.create();
```

- [ ] **Step 5: Build and add native platforms**

```bash
pnpm build
pnpm cap add ios
pnpm cap add android
pnpm cap sync
```

Expected: `ios/` and `android/` directories created.

- [ ] **Step 6: Test iOS build**

```bash
pnpm cap:ios
```

Expected: Xcode opens with the project. Run on simulator — game loads, touch controls appear, both joysticks respond.

- [ ] **Step 7: Run all tests one last time**

```bash
pnpm test
```

Expected: 22 tests pass.

- [ ] **Step 8: Final commit**

```bash
git add capacitor.config.ts src/ui/TouchControls.ts src/scenes/GameScene.ts
git commit -m "feat: Capacitor packaging + touch controls overlay for iOS/Android"
```

---

## Self-Review Checklist

| Spec requirement | Task |
|---|---|
| Phaser 3 + TypeScript + Vite | Task 1 |
| Capacitor iOS + Android | Task 13 |
| Boot → Preload → MainMenu → CharacterSelect → Settings → Game → Result | Tasks 11–12 |
| Fighter state machine (IDLE/RUN/JUMP/DOUBLE_JUMP/FALL/ATTACK/HITSTUN/LAUNCHED/DEAD) | Tasks 3, 7 |
| Up/Down = aim (not jump); Jump key separate; Drop Through key separate | Tasks 2, 6, 7 |
| Double jump on second Jump press | Task 7 (JumpState) |
| Knockback formula (base + damage% × scaling) / weight | Task 4 |
| Attack resolution by inputType + aimDirection + isArmed | Task 4 |
| 12 attack defs for CowboyMelon (6 unarmed + 6 armed) | Task 8 |
| Hitbox/hurtbox overlap detection | Task 9 |
| Weapon pickups + respawn timer | Task 9 |
| Stock lives (3 per player) + blast zone KO | Tasks 10, 11 |
| Damage % HUD | Task 10 |
| Configurable key bindings (8 per player) | Tasks 2, 12 |
| Conflict detection in Settings | Tasks 2, 12 |
| Persist bindings to localStorage | Tasks 2, 12 |
| Reset to defaults per player | Tasks 2, 12 |
| Pass-through platforms (jump through, drop through) | Task 5 |
| Stage JSON format | Task 5 |
| Downtown Rumble — 6 platforms, 1 weapon spawn, 2 spawns | Task 5 |
| Touch controls with virtual joystick + 4 buttons | Task 13 |
| Placeholder sprites until real art is ready | Task 11 |
