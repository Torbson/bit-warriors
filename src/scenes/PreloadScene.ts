import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload(): void {
    this.load.json('downtown-rumble', 'assets/stages/downtown-rumble.json');
    this.load.image('bg_city', 'assets/backgrounds/bg_city.png');
  }

  create(): void {
    this.makeCharTexture('cowboymelon_placeholder', 0x5aaa4f, 48, 72);
    this.makeCharTexture('character2_placeholder', 0x4a70e2, 48, 72);

    this.makePlatformTexture('platform_solid', false);
    this.makePlatformTexture('platform_pass', true);

    this.scene.start('MainMenu');
  }

  // ── Platform textures ──────────────────────────────────────────────────
  private makePlatformTexture(key: string, passthrough: boolean): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const W = 128, H = 16;

    if (!passthrough) {
      // Solid — structural steel I-beam (main walking surface)
      // Body: mid steel grey
      g.fillStyle(0x6a7c8e, 1); g.fillRect(0, 0, W, H);
      // Top flange: bright highlight strip — the load-bearing edge
      g.fillStyle(0xc8d8e8, 1); g.fillRect(0, 0, W, 3);
      // Sub-highlight
      g.fillStyle(0x9ab0c4, 1); g.fillRect(0, 3, W, 1);
      // Web centre line (recessed channel between flanges)
      g.fillStyle(0x48606e, 1); g.fillRect(0, 7, W, 2);
      // Bottom flange shadow
      g.fillStyle(0x2e404e, 1); g.fillRect(0, H - 3, W, 3);
      g.fillStyle(0x3a5060, 1); g.fillRect(0, H - 4, W, 1);
      // Rivet bolts every 16 px
      for (let rx = 8; rx < W; rx += 16) {
        g.fillStyle(0x1e2e3a, 1); g.fillRect(rx, 1, 3, 3);       // dark recess
        g.fillStyle(0xddeeff, 1); g.fillRect(rx, 1, 1, 1);       // specular glint
      }
      // Orange rust streak accent (construction steel look)
      g.fillStyle(0xc06020, 0.28); g.fillRect(0, 4, W, 3);
    } else {
      // Passthrough — open steel grating / scaffold plank
      // Base plate: warm steel
      g.fillStyle(0x7a8898, 1); g.fillRect(0, 0, W, H);
      // Top glint
      g.fillStyle(0xbccede, 1); g.fillRect(0, 0, W, 2);
      // Diamond-plate crosshatch (vertical bars + mid rail)
      for (let bx = 0; bx < W; bx += 8) {
        g.fillStyle(0x3a5060, 0.7); g.fillRect(bx, 2, 2, H - 4);
      }
      // Horizontal mid-rail
      g.fillStyle(0x384e5c, 0.9); g.fillRect(0, 7, W, 2);
      // Bottom shadow
      g.fillStyle(0x28383e, 1); g.fillRect(0, H - 2, W, 2);
      // Orange safety stripe near edges
      g.fillStyle(0xe07818, 0.70); g.fillRect(0, 0, 4, H);
      g.fillStyle(0xe07818, 0.70); g.fillRect(W - 4, 0, 4, H);
    }

    g.generateTexture(key, W, H);
    g.destroy();
  }

  private rng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ── Character placeholder ──────────────────────────────────────────────
  private makeCharTexture(key: string, color: number, w: number, h: number): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillRect(0, 0, w, h);
    g.fillStyle(0x000000, 0.3);
    g.fillRect(8, 8, 12, 14);
    g.fillRect(28, 8, 12, 14);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
