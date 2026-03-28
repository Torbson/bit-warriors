import type { KeyBindings } from './types';

const STORAGE_KEY = 'bw_keybindings_v1';

export const DEFAULT_BINDINGS: [KeyBindings, KeyBindings] = [
  {
    left: 'A', right: 'D', aimUp: 'W', aimDown: 'S',
    jump: 'SPACE', drop: 'C', lightAttack: 'F', heavyAttack: 'G',
  },
  {
    left: 'LEFT', right: 'RIGHT', aimUp: 'UP', aimDown: 'DOWN',
    jump: 'NUMPAD_0', drop: 'NUMPAD_DECIMAL', lightAttack: 'COMMA', heavyAttack: 'PERIOD',
  },
];

export function loadBindings(): [KeyBindings, KeyBindings] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_BINDINGS);
    return JSON.parse(raw) as [KeyBindings, KeyBindings];
  } catch {
    return structuredClone(DEFAULT_BINDINGS);
  }
}

export function saveBindings(bindings: [KeyBindings, KeyBindings]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

export function resetBindings(
  player: 0 | 1,
  bindings: [KeyBindings, KeyBindings],
): [KeyBindings, KeyBindings] {
  const copy = structuredClone(bindings) as [KeyBindings, KeyBindings];
  copy[player] = structuredClone(DEFAULT_BINDINGS[player]);
  return copy;
}

/** Returns human-readable conflict descriptions, empty if none. */
export function findConflicts(bindings: [KeyBindings, KeyBindings]): string[] {
  const seen = new Map<string, string>(); // key → "P1.jump" etc.
  const conflicts: string[] = [];
  bindings.forEach((b, pi) => {
    (Object.entries(b) as [keyof KeyBindings, string][]).forEach(([action, key]) => {
      const label = `P${pi + 1}.${action}`;
      if (seen.has(key)) {
        conflicts.push(`${key} conflicts: ${seen.get(key)} vs ${label}`);
      } else {
        seen.set(key, label);
      }
    });
  });
  return conflicts;
}
