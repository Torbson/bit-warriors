import { describe, it, expect } from 'vitest';
import { resolveAttack } from './attackResolver';
import type { AttackDef } from './types';

const ATTACKS: AttackDef[] = [
  {
    id: 'light_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'light',
    activeFrames: [2, 8], hitbox: { x: 30, y: -10, w: 40, h: 30 },
    damage: 5, knockbackBase: 150, knockbackScaling: 1.2, knockbackAngle: 30, animation: 'light_neutral',
  },
  {
    id: 'heavy_up', requiresWeapon: false, aimDirection: 'up', inputType: 'heavy',
    activeFrames: [4, 10], hitbox: { x: -10, y: -60, w: 30, h: 40 },
    damage: 12, knockbackBase: 280, knockbackScaling: 2.2, knockbackAngle: 88, animation: 'heavy_up',
  },
  {
    id: 'armed_light_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'light',
    activeFrames: [1, 6], hitbox: { x: 40, y: -10, w: 70, h: 30 },
    damage: 9, knockbackBase: 200, knockbackScaling: 1.6, knockbackAngle: 25, animation: 'armed_light_neutral',
  },
];

describe('resolveAttack', () => {
  it('returns unarmed attack when not armed', () => {
    expect(resolveAttack(ATTACKS, 'light', 'neutral', false)?.id).toBe('light_neutral');
  });

  it('returns armed attack when armed', () => {
    expect(resolveAttack(ATTACKS, 'light', 'neutral', true)?.id).toBe('armed_light_neutral');
  });

  it('returns undefined when no match exists', () => {
    expect(resolveAttack(ATTACKS, 'light', 'down', false)).toBeUndefined();
  });

  it('never returns armed attack when not armed', () => {
    const result = resolveAttack(ATTACKS, 'light', 'neutral', false);
    expect(result?.requiresWeapon).toBe(false);
  });

  it('matches by aim direction', () => {
    expect(resolveAttack(ATTACKS, 'heavy', 'up', false)?.id).toBe('heavy_up');
  });
});
