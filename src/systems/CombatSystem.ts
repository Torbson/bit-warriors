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
