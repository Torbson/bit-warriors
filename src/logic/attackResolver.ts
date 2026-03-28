import type { AttackDef, AimDirection, InputType } from './types';

export function resolveAttack(
  attacks: AttackDef[],
  inputType: InputType,
  aimDirection: AimDirection,
  isArmed: boolean,
): AttackDef | undefined {
  return attacks.find(
    (a) =>
      a.inputType === inputType &&
      a.aimDirection === aimDirection &&
      a.requiresWeapon === isArmed,
  );
}
