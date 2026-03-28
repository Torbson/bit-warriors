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
    const textureKey = p.type === 'solid' ? 'platform_solid' : 'platform_pass';
    const sprite = this.scene.add.tileSprite(
      p.x + p.w / 2,
      p.y + PLATFORM_HEIGHT / 2,
      p.w,
      PLATFORM_HEIGHT,
      textureKey,
    );
    this.scene.physics.add.existing(sprite, true);
    group.add(sprite);
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
