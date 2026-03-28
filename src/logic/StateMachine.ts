import type { StateKey } from './types';

export interface State<T> {
  enter(ctx: T): void;
  update(ctx: T, delta: number): StateKey | null;
  exit(ctx: T): void;
}

export class StateMachine<T> {
  private states = new Map<StateKey, State<T>>();
  current: StateKey = 'IDLE';

  register(key: StateKey, state: State<T>): this {
    this.states.set(key, state);
    return this;
  }

  transition(ctx: T, key: StateKey): void {
    if (!this.states.has(key)) throw new Error(`Unknown state: ${key}`);
    this.states.get(this.current)?.exit(ctx);
    this.current = key;
    this.states.get(key)!.enter(ctx);
  }

  update(ctx: T, delta: number): void {
    const next = this.states.get(this.current)?.update(ctx, delta) ?? null;
    if (next !== null && next !== this.current) {
      this.transition(ctx, next);
    }
  }
}
