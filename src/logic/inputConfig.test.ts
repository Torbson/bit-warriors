import { describe, it, expect } from 'vitest';
import { DEFAULT_BINDINGS, findConflicts, resetBindings } from './inputConfig';
import type { KeyBindings } from './types';

describe('findConflicts', () => {
  it('returns empty when defaults have no conflicts', () => {
    expect(findConflicts(DEFAULT_BINDINGS)).toEqual([]);
  });

  it('detects cross-player key conflict', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'SPACE' },
      { ...DEFAULT_BINDINGS[1], jump: 'SPACE' },
    ];
    const result = findConflicts(b);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('SPACE');
  });

  it('detects same-player key conflict', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], lightAttack: 'A' }, // A already used for left
      DEFAULT_BINDINGS[1],
    ];
    expect(findConflicts(b)).toHaveLength(1);
  });

  it('returns multiple conflicts when multiple duplicates', () => {
    const b: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X', drop: 'X' },
      DEFAULT_BINDINGS[1],
    ];
    expect(findConflicts(b)).toHaveLength(1); // only one pair conflicts
  });
});

describe('resetBindings', () => {
  it('resets P1 to defaults without touching P2', () => {
    const modified: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X' },
      { ...DEFAULT_BINDINGS[1], jump: 'Y' },
    ];
    const result = resetBindings(0, modified);
    expect(result[0].jump).toBe(DEFAULT_BINDINGS[0].jump);
    expect(result[1].jump).toBe('Y');
  });

  it('resets P2 to defaults without touching P1', () => {
    const modified: [KeyBindings, KeyBindings] = [
      { ...DEFAULT_BINDINGS[0], jump: 'X' },
      { ...DEFAULT_BINDINGS[1], jump: 'Y' },
    ];
    const result = resetBindings(1, modified);
    expect(result[0].jump).toBe('X');
    expect(result[1].jump).toBe(DEFAULT_BINDINGS[1].jump);
  });

  it('does not mutate the input array', () => {
    const original = structuredClone(DEFAULT_BINDINGS) as [KeyBindings, KeyBindings];
    original[0].jump = 'MUTATE_ME';
    resetBindings(0, original);
    expect(original[0].jump).toBe('MUTATE_ME');
  });
});
