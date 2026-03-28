import Phaser from 'phaser';
import { StateMachine } from '../logic/StateMachine';
import type { FighterStats, PlayerInput, AttackDef, AimDirection } from '../logic/types';
import { STARTING_STOCKS } from '../logic/constants';
import { calcKnockbackVelocity } from '../logic/knockback';
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
