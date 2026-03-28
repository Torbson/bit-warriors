import type { State } from '../../logic/StateMachine';
import type { StateKey } from '../../logic/types';
import type { Fighter } from '../Fighter';
import { HITSTUN_BASE_MS } from '../../logic/constants';

export class HitstunState implements State<Fighter> {
  private elapsed = 0;
  private duration = HITSTUN_BASE_MS;

  enter(f: Fighter): void {
    this.elapsed = 0;
    this.duration = HITSTUN_BASE_MS + f.damagePercent * 2;
    f.playAnim('hitstun');
  }

  update(_f: Fighter, delta: number): StateKey | null {
    this.elapsed += delta;
    if (this.elapsed >= this.duration) return 'FALL';
    return null;
  }

  exit(_f: Fighter) {}
}
