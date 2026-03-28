import { describe, it, expect } from 'vitest';
import { calcLaunchSpeed, angleToVector, calcKnockbackVelocity } from './knockback';

describe('calcLaunchSpeed', () => {
  it('equals base at 0% damage', () => {
    expect(calcLaunchSpeed(200, 2, 0, 1)).toBe(200);
  });

  it('increases with damage percent', () => {
    const low = calcLaunchSpeed(200, 2, 50, 1);
    const high = calcLaunchSpeed(200, 2, 150, 1);
    expect(high).toBeGreaterThan(low);
  });

  it('heavier fighters (weight > 1) launch less far', () => {
    const light = calcLaunchSpeed(200, 2, 100, 0.8);
    const heavy = calcLaunchSpeed(200, 2, 100, 1.4);
    expect(light).toBeGreaterThan(heavy);
  });
});

describe('angleToVector', () => {
  it('0 degrees points right: x≈1, y≈0', () => {
    const v = angleToVector(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('90 degrees points up: x≈0, y≈-1 (screen coords)', () => {
    const v = angleToVector(90);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(-1);
  });

  it('180 degrees points left: x≈-1, y≈0', () => {
    const v = angleToVector(180);
    expect(v.x).toBeCloseTo(-1);
    expect(v.y).toBeCloseTo(0);
  });
});

describe('calcKnockbackVelocity', () => {
  it('x is positive when attacker faces right and angle is 0', () => {
    const v = calcKnockbackVelocity(300, 2, 0, 0, 1, true);
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeCloseTo(0);
  });

  it('x flips when attacker faces left', () => {
    const right = calcKnockbackVelocity(300, 2, 0, 0, 1, true);
    const left = calcKnockbackVelocity(300, 2, 0, 0, 1, false);
    expect(left.x).toBeLessThan(0);
    expect(Math.abs(left.x)).toBeCloseTo(Math.abs(right.x));
  });
});
