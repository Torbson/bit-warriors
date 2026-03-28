import Phaser from 'phaser';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelect'); }

  create(): void {
    this.add.text(640, 80, 'SELECT CHARACTER', {
      fontSize: '40px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // For prototype: only CowboyMelon. Just start the game.
    this.add.text(640, 360, 'CowboyMelon vs CowboyMelon', {
      fontSize: '28px', color: '#5aaa4f', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.makeButton(640, 500, 'READY — FIGHT!', () => this.scene.start('Game'));
    this.makeButton(640, 580, '← BACK', () => this.scene.start('MainMenu'));
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '28px', color: '#aaaaaa', fontFamily: 'monospace',
      backgroundColor: '#222233', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', cb);
  }
}
