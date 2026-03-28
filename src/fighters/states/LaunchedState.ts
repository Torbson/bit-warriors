import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { LAUNCHED_RECOVERY_SPEED } from '../../logic/constants';

export class LaunchedState implements State<Fighter> {
  enter(f: Fighter) { f.playAnim('launched'); f.canDoubleJump = false; }

  update(f: Fighter): StateKey | null {
    const body = f.body as Phaser.Physics.Arcade.Body;
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (speed < LAUNCHED_RECOVERY_SPEED && body.blocked.down) return 'IDLE';
    return null;
  }

  exit(_f: Fighter) {}
}
