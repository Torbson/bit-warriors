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
