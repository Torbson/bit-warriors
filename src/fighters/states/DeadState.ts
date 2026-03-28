import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { RESPAWN_DELAY_MS } from '../../logic/constants';

export class DeadState implements State<Fighter> {
  private elapsed = 0;

  enter(f: Fighter): void {
    this.elapsed = 0;
    f.setActive(false).setVisible(false);
    f.setVelocity(0, 0);
  }

  update(f: Fighter, delta: number): StateKey | null {
    this.elapsed += delta;
    if (this.elapsed >= RESPAWN_DELAY_MS) {
      f.respawn();
      return 'IDLE';
    }
    return null;
  }

  exit(_f: Fighter) {}
}
