import { describe, it, expect, vi } from 'vitest';
import { StateMachine } from './StateMachine';
import type { StateKey } from './types';

interface Ctx { value: number }

function makeState(returns: StateKey | null = null) {
  return { enter: vi.fn(), update: vi.fn().mockReturnValue(returns), exit: vi.fn() };
}

describe('StateMachine', () => {
  it('starts in IDLE', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState());
    expect(sm.current).toBe('IDLE');
  });

  it('calls exit on old state and enter on new state during transition', () => {
    const idle = makeState();
    const run = makeState(null);
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle).register('RUN', run);
    const ctx = { value: 0 };
    sm.transition(ctx, 'RUN');
    expect(idle.exit).toHaveBeenCalledWith(ctx);
    expect(run.enter).toHaveBeenCalledWith(ctx);
    expect(sm.current).toBe('RUN');
  });

  it('auto-transitions when update returns a new key', () => {
    const idle = makeState('RUN');
    const run = makeState(null);
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle).register('RUN', run);
    sm.update({ value: 0 }, 16);
    expect(sm.current).toBe('RUN');
  });

  it('stays put when update returns null', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState(null));
    sm.update({ value: 0 }, 16);
    expect(sm.current).toBe('IDLE');
  });

  it('throws on transition to unregistered state', () => {
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', makeState());
    expect(() => sm.transition({ value: 0 }, 'RUN')).toThrow('Unknown state: RUN');
  });

  it('does not transition if update returns current state', () => {
    const idle = makeState('IDLE');
    const sm = new StateMachine<Ctx>();
    sm.register('IDLE', idle);
    sm.update({ value: 0 }, 16);
    expect(idle.exit).not.toHaveBeenCalled(); // no re-entry
    expect(sm.current).toBe('IDLE');
  });
});
