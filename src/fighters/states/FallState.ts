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
