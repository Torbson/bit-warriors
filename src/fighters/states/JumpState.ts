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
