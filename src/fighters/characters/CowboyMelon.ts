import Phaser from 'phaser';
import { Fighter } from '../Fighter';
import type { FighterStats } from '../../logic/types';

export class CowboyMelon extends Fighter {
  readonly characterName = 'cowboymelon';
  readonly stats: FighterStats = {
    moveSpeed: 280,
    jumpForce: -560,
    doubleJumpForce: -480,
    weight: 1.1,
    attacks: [
      // ── Unarmed ────────────────────────────────────────────────
      {
        id: 'light_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'light',
        activeFrames: [2, 7], hitbox: { x: 32, y: -8, w: 44, h: 32 },
        damage: 5, knockbackBase: 140, knockbackScaling: 1.1, knockbackAngle: 25,
        animation: 'light_neutral',
      },
      {
        id: 'light_up', requiresWeapon: false, aimDirection: 'up', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -10, y: -56, w: 36, h: 44 },
        damage: 6, knockbackBase: 160, knockbackScaling: 1.2, knockbackAngle: 82,
        animation: 'light_up',
      },
      {
        id: 'light_down', requiresWeapon: false, aimDirection: 'down', inputType: 'light',
        activeFrames: [3, 7], hitbox: { x: -12, y: 20, w: 40, h: 36 },
        damage: 5, knockbackBase: 130, knockbackScaling: 1.0, knockbackAngle: 270,
        animation: 'light_down',
      },
      {
        id: 'heavy_neutral', requiresWeapon: false, aimDirection: 'neutral', inputType: 'heavy',
        activeFrames: [5, 11], hitbox: { x: 36, y: -12, w: 56, h: 40 },
        damage: 14, knockbackBase: 260, knockbackScaling: 2.0, knockbackAngle: 28,
        animation: 'heavy_neutral',
      },
      {
        id: 'heavy_up', requiresWeapon: false, aimDirection: 'up', inputType: 'heavy',
        activeFrames: [4, 10], hitbox: { x: -12, y: -64, w: 36, h: 52 },
        damage: 16, knockbackBase: 300, knockbackScaling: 2.4, knockbackAngle: 88,
        animation: 'heavy_up',
      },
      {
        id: 'heavy_down', requiresWeapon: false, aimDirection: 'down', inputType: 'heavy',
        activeFrames: [5, 10], hitbox: { x: -14, y: 24, w: 44, h: 44 },
        damage: 12, knockbackBase: 220, knockbackScaling: 1.8, knockbackAngle: 275,
        animation: 'heavy_down',
      },
      // ── Armed (grappling hook) ──────────────────────────────────
      {
        id: 'armed_light_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'light',
        activeFrames: [1, 6], hitbox: { x: 40, y: -10, w: 70, h: 28 },
        damage: 8, knockbackBase: 180, knockbackScaling: 1.4, knockbackAngle: 20,
        animation: 'armed_light_neutral',
      },
      {
        id: 'armed_light_up', requiresWeapon: true, aimDirection: 'up', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -8, y: -70, w: 32, h: 56 },
        damage: 9, knockbackBase: 200, knockbackScaling: 1.5, knockbackAngle: 80,
        animation: 'armed_light_up',
      },
      {
        id: 'armed_light_down', requiresWeapon: true, aimDirection: 'down', inputType: 'light',
        activeFrames: [2, 6], hitbox: { x: -10, y: 24, w: 36, h: 50 },
        damage: 8, knockbackBase: 170, knockbackScaling: 1.3, knockbackAngle: 268,
        animation: 'armed_light_down',
      },
      {
        id: 'armed_heavy_neutral', requiresWeapon: true, aimDirection: 'neutral', inputType: 'heavy',
        activeFrames: [4, 12], hitbox: { x: 44, y: -14, w: 90, h: 36 },
        damage: 18, knockbackBase: 340, knockbackScaling: 2.6, knockbackAngle: 22,
        animation: 'armed_heavy_neutral',
      },
      {
        id: 'armed_heavy_up', requiresWeapon: true, aimDirection: 'up', inputType: 'heavy',
        activeFrames: [5, 11], hitbox: { x: -10, y: -80, w: 36, h: 68 },
        damage: 20, knockbackBase: 360, knockbackScaling: 2.8, knockbackAngle: 86,
        animation: 'armed_heavy_up',
      },
      {
        id: 'armed_heavy_down', requiresWeapon: true, aimDirection: 'down', inputType: 'heavy',
        activeFrames: [5, 12], hitbox: { x: -14, y: 28, w: 48, h: 64 },
        damage: 16, knockbackBase: 300, knockbackScaling: 2.2, knockbackAngle: 272,
        animation: 'armed_heavy_down',
      },
    ],
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cowboymelon_placeholder');
    this.init();
  }
}
