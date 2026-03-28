import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  create(data: { winnerName: string }): void {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 80, `${data.winnerName} WINS!`, {
      fontSize: '56px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeButton(cx, cy + 60, 'REMATCH', () => this.scene.start('Game'));
    this.makeButton(cx, cy + 140, 'MAIN MENU', () => this.scene.start('MainMenu'));
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
