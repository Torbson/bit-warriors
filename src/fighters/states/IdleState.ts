import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';

export class IdleState implements State<Fighter> {
  enter(f: Fighter) { f.setVelocityX(0); f.playAnim('idle'); }
  update(f: Fighter): StateKey | null {
    const { axis, jumpPressed } = f.getInput();
    if (jumpPressed) return 'JUMP';
    if (axis.x !== 0) return 'RUN';
    const body = f.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down) return 'FALL';
    return null;
  }
  exit(_f: Fighter) {}
}
