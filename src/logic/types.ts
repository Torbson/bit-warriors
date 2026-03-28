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
