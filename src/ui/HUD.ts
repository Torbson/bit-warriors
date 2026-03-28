import Phaser from 'phaser';
import type { Fighter } from '../fighters/Fighter';
import { STARTING_STOCKS } from '../logic/constants';

export class HUD {
  private scene: Phaser.Scene;
  private p1StockIcons: Phaser.GameObjects.Ellipse[] = [];
  private p2StockIcons: Phaser.GameObjects.Ellipse[] = [];
  private p1DmgText!: Phaser.GameObjects.Text;
  private p2DmgText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(p1: Fighter, p2: Fighter): void {
    const style = { fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' };

    // P1 — top left
    this.scene.add.text(16, 12, `P1 · ${p1.characterName}`, { ...style, color: '#4a90e2' }).setScrollFactor(0);
    for (let i = 0; i < STARTING_STOCKS; i++) {
      const dot = this.scene.add.ellipse(20 + i * 18, 38, 12, 12, 0x4a90e2).setScrollFactor(0);
      this.p1StockIcons.push(dot);
    }
    this.p1DmgText = this.scene.add.text(16, 50, '0%', { ...style, color: '#ff9900', fontSize: '20px' }).setScrollFactor(0);

    // P2 — top right
    this.scene.add.text(1264, 12, `P2 · ${p2.characterName}`, { ...style, color: '#e24a4a', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
    for (let i = 0; i < STARTING_STOCKS; i++) {
      const dot = this.scene.add.ellipse(1264 - i * 18, 38, 12, 12, 0xe24a4a).setScrollFactor(0);
      this.p2StockIcons.push(dot);
    }
    this.p2DmgText = this.scene.add.text(1264, 50, '0%', { ...style, color: '#ff9900', fontSize: '20px', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
  }

  update(p1: Fighter, p2: Fighter): void {
    this.p1DmgText.setText(`${Math.round(p1.damagePercent)}%`);
    this.p2DmgText.setText(`${Math.round(p2.damagePercent)}%`);

    this.p1StockIcons.forEach((icon, i) => icon.setAlpha(i < p1.stocks ? 1 : 0.15));
    this.p2StockIcons.forEach((icon, i) => icon.setAlpha(i < p2.stocks ? 1 : 0.15));
  }
}
