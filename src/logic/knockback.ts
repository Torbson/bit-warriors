export function calcLaunchSpeed(
  base: number,
  scaling: number,
  targetDamagePercent: number,
  targetWeight: number,
): number {
  return (base + targetDamagePercent * scaling) / targetWeight;
}

/** Converts degrees to a unit vector. y is inverted for screen space (up = negative y). */
export function angleToVector(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad), y: -Math.sin(rad) };
}

export function calcKnockbackVelocity(
  base: number,
  scaling: number,
  angleDeg: number,
  targetDamagePercent: number,
  targetWeight: number,
  attackerFacingRight: boolean,
): { x: number; y: number } {
  const speed = calcLaunchSpeed(base, scaling, targetDamagePercent, targetWeight);
  const dir = angleToVector(angleDeg);
  const flip = attackerFacingRight ? 1 : -1;
  return { x: dir.x * speed * flip, y: dir.y * speed };
}
