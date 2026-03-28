import Phaser from 'phaser';
import type { PlayerInput } from '../logic/types';
import type { InputSystem } from '../systems/InputSystem';

export class TouchControls {
  private scene: Phaser.Scene;
  private inputSystem: InputSystem;
  private state: [Partial<PlayerInput>, Partial<PlayerInput>] = [{}, {}];

  constructor(scene: Phaser.Scene, inputSystem: InputSystem) {
    this.scene = scene;
    this.inputSystem = inputSystem;
  }

  create(): void {
    if (!this.scene.sys.game.device.input.touch) return; // desktop — skip

    // ── P1 joystick (bottom-left) ──────────────────────────────
    this.makeJoystick(120, 580, 0);

    // ── P1 buttons ─────────────────────────────────────────────
    this.makeActionButton(280, 620, '↑', 0, 'jumpPressed');
    this.makeActionButton(340, 580, 'L', 0, 'lightPressed');
    this.makeActionButton(400, 620, 'H', 0, 'heavyPressed');
    this.makeActionButton(340, 660, '↓', 0, 'dropPressed');

    // ── P2 joystick (bottom-right) ─────────────────────────────
    this.makeJoystick(1160, 580, 1);

    // ── P2 buttons ─────────────────────────────────────────────
    this.makeActionButton(880, 620, '↑', 1, 'jumpPressed');
    this.makeActionButton(940, 580, 'L', 1, 'lightPressed');
    this.makeActionButton(1000, 620, 'H', 1, 'heavyPressed');
    this.makeActionButton(940, 660, '↓', 1, 'dropPressed');
  }

  private makeJoystick(cx: number, cy: number, player: 0 | 1): void {
    const zone = this.scene.add.circle(cx, cy, 60, 0xffffff, 0.08).setScrollFactor(0).setInteractive();
    const thumb = this.scene.add.circle(cx, cy, 24, 0xffffff, 0.3).setScrollFactor(0);

    zone.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      const dx = Phaser.Math.Clamp(ptr.x - cx, -50, 50);
      const dy = Phaser.Math.Clamp(ptr.y - cy, -50, 50);
      thumb.setPosition(cx + dx, cy + dy);
      const axisX = (Math.abs(dx) > 15 ? Math.sign(dx) : 0) as -1 | 0 | 1;
      const axisY = (Math.abs(dy) > 15 ? Math.sign(dy) : 0) as -1 | 0 | 1;
      this.state[player] = { ...this.state[player], axis: { x: axisX, y: axisY } };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });

    zone.on('pointerup', () => {
      thumb.setPosition(cx, cy);
      this.state[player] = { ...this.state[player], axis: { x: 0, y: 0 } };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
  }

  private makeActionButton(
    x: number, y: number, label: string,
    player: 0 | 1, action: keyof Omit<PlayerInput, 'axis'>,
  ): void {
    const btn = this.scene.add.circle(x, y, 28, 0xffffff, 0.15).setScrollFactor(0).setInteractive();
    this.scene.add.text(x, y, label, { fontSize: '16px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5).setScrollFactor(0);

    btn.on('pointerdown', () => {
      this.state[player] = { ...this.state[player], [action]: true };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
    btn.on('pointerup', () => {
      this.state[player] = { ...this.state[player], [action]: false };
      this.inputSystem.setTouchInput(player, this.state[player]);
    });
  }
}
