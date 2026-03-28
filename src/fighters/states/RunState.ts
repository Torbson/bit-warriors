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
