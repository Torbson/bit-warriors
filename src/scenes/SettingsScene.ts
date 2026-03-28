import Phaser from 'phaser';
import {
  loadBindings, saveBindings, resetBindings, findConflicts,
} from '../logic/inputConfig';
import type { KeyBindings } from '../logic/types';

type ActionKey = keyof KeyBindings;
const ACTIONS: ActionKey[] = ['left', 'right', 'aimUp', 'aimDown', 'jump', 'drop', 'lightAttack', 'heavyAttack'];
const ACTION_LABELS: Record<ActionKey, string> = {
  left: 'Left', right: 'Right', aimUp: 'Aim Up', aimDown: 'Aim Down',
  jump: 'Jump (×2 = double)', drop: 'Drop Through', lightAttack: 'Light Attack', heavyAttack: 'Heavy Attack',
};

export class SettingsScene extends Phaser.Scene {
  private bindings!: [KeyBindings, KeyBindings];
  private waitingFor: { player: 0 | 1; action: ActionKey } | null = null;
  private badges: Phaser.GameObjects.Text[] = [];
  private conflictText!: Phaser.GameObjects.Text;

  constructor() { super('Settings'); }

  create(): void {
    this.bindings = loadBindings();
    this.cameras.main.setBackgroundColor('#0d1117');

    this.add.text(640, 30, 'CONTROLS', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.buildColumns();

    this.conflictText = this.add.text(640, 660, '', {
      fontSize: '13px', color: '#ff9944', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.makeButton(200, 620, '↺ Reset P1', () => { this.bindings = resetBindings(0, this.bindings); this.refreshBadges(); });
    this.makeButton(1080, 620, '↺ Reset P2', () => { this.bindings = resetBindings(1, this.bindings); this.refreshBadges(); });
    this.makeButton(640, 700, '← Back', () => { saveBindings(this.bindings); this.scene.start('MainMenu'); });

    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => this.handleKeydown(ev));

    this.refreshConflicts();
  }

  private buildColumns(): void {
    const playerColors = ['#4a90e2', '#e24a4a'];
    const columnX = [200, 1080];

    for (const pi of [0, 1] as const) {
      this.add.text(columnX[pi], 70, `PLAYER ${pi + 1}`, {
        fontSize: '20px', color: playerColors[pi], fontFamily: 'monospace',
      }).setOrigin(0.5);

      this.add.text(columnX[pi], 95, '── AXIS ──', {
        fontSize: '11px', color: '#555555', fontFamily: 'monospace',
      }).setOrigin(0.5);

      ACTIONS.forEach((action, ai) => {
        const y = 120 + ai * 58 + (ai >= 4 ? 20 : 0);
        if (ai === 4) {
          this.add.text(columnX[pi], 120 + 4 * 58 + 2, '── ACTIONS ──', {
            fontSize: '11px', color: '#555555', fontFamily: 'monospace',
          }).setOrigin(0.5);
        }
        this.add.text(columnX[pi] - 80, y, ACTION_LABELS[action], {
          fontSize: '13px', color: '#8b949e', fontFamily: 'monospace',
        }).setOrigin(1, 0.5);

        const badge = this.add.text(columnX[pi] + 20, y, this.bindings[pi][action], {
          fontSize: '13px', color: '#e6edf3', fontFamily: 'monospace',
          backgroundColor: '#21262d', padding: { x: 10, y: 4 },
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        const capturedPi = pi;
        const capturedAction = action;
        badge.on('pointerdown', () => {
          if (this.waitingFor) {
            const prev = this.badges[this.waitingFor.player * 8 + ACTIONS.indexOf(this.waitingFor.action)];
            prev?.setColor('#e6edf3').setBackgroundColor('#21262d');
          }
          this.waitingFor = { player: capturedPi, action: capturedAction };
          badge.setText('press key…').setColor('#ff9944').setBackgroundColor('#2a1800');
        });
        badge.on('pointerover', () => { if (this.waitingFor?.action !== action) badge.setColor('#ffffff'); });
        badge.on('pointerout', () => { if (this.waitingFor?.action !== action) badge.setColor('#e6edf3'); });

        this.badges[pi * 8 + ai] = badge;
      });
    }
  }

  private handleKeydown(ev: KeyboardEvent): void {
    if (!this.waitingFor) return;
    ev.preventDefault();

    const phaserKeyName = this.eventKeyToPhaserName(ev);
    const { player, action } = this.waitingFor;
    this.bindings[player][action] = phaserKeyName;
    this.waitingFor = null;
    this.refreshBadges();
    this.refreshConflicts();
    saveBindings(this.bindings);
  }

  private eventKeyToPhaserName(ev: KeyboardEvent): string {
    const map: Record<string, string> = {
      ' ': 'SPACE', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
      'ArrowUp': 'UP', 'ArrowDown': 'DOWN', ',': 'COMMA', '.': 'PERIOD',
    };
    return map[ev.key] ?? ev.key.toUpperCase();
  }

  private refreshBadges(): void {
    ACTIONS.forEach((action, ai) => {
      for (const pi of [0, 1] as const) {
        this.badges[pi * 8 + ai]?.setText(this.bindings[pi][action]).setColor('#e6edf3').setBackgroundColor('#21262d');
      }
    });
  }

  private refreshConflicts(): void {
    const c = findConflicts(this.bindings);
    this.conflictText.setText(c.length ? `⚠ ${c.join(' | ')}` : '');
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '16px', color: '#3a7a3a', fontFamily: 'monospace',
      backgroundColor: '#1a2a1a', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#66cc66'));
    btn.on('pointerout', () => btn.setColor('#3a7a3a'));
    btn.on('pointerdown', cb);
  }
}
