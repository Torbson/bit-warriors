import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create(): void {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 120, 'BIT WARRIORS', {
      fontSize: '64px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeButton(cx, cy, 'FIGHT', () => this.scene.start('CharacterSelect'));
    this.makeButton(cx, cy + 70, 'SETTINGS', () => this.scene.start('Settings'));
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '32px', color: '#aaaaaa', fontFamily: 'monospace',
      backgroundColor: '#222233', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', cb);
  }
}
