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
  }
}
