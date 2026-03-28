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

  update(f: Fighter, _delta: number): StateKey | null {
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
