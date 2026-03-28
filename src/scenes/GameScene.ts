import Phaser from 'phaser';
import { InputSystem } from '../systems/InputSystem';
import { StageSystem } from '../systems/StageSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { HUD } from '../ui/HUD';
import { TouchControls } from '../ui/TouchControls';
import { CowboyMelon } from '../fighters/characters/CowboyMelon';
import type { Fighter } from '../fighters/Fighter';
import type { StageData } from '../logic/types';

export class GameScene extends Phaser.Scene {
  private inputSystem!: InputSystem;
  private stageSystem!: StageSystem;
  private combatSystem!: CombatSystem;
  private weaponSystem!: WeaponSystem;
  private hud!: HUD;
  private fighters!: [Fighter, Fighter];

  constructor() { super('Game'); }

  create(): void {
    const stageData = this.cache.json.get('downtown-rumble') as StageData;

    // Background must be added first so platforms render on top
    const bg = this.add.image(640, 360, 'bg_city').setScrollFactor(0);
    bg.setDisplaySize(1280, 720);

    this.inputSystem = new InputSystem(this.input.keyboard!);
    this.stageSystem = new StageSystem(this);
    this.stageSystem.load(stageData);
    this.combatSystem = new CombatSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.weaponSystem.load(stageData);

    // Spawn fighters
    const sp1 = stageData.spawnPoints.find(s => s.player === 1)!;
    const sp2 = stageData.spawnPoints.find(s => s.player === 2)!;
    const p1 = new CowboyMelon(this, sp1.x, sp1.y);
    const p2 = new CowboyMelon(this, sp2.x, sp2.y);
    p2.setTint(0xe24a4a);
    p1.setSpawn(sp1.x, sp1.y);
    p2.setSpawn(sp2.x, sp2.y);
    p1.name = 'p1';
    p2.name = 'p2';
    this.fighters = [p1, p2];

    // Solid platform colliders
    const solid = this.stageSystem.getSolidGroup();
    this.physics.add.collider(p1, solid);
    this.physics.add.collider(p2, solid);

    // Pass-through platform colliders
    const passthrough = this.stageSystem.getPassthroughGroup();
    this.physics.add.collider(p1, passthrough, undefined, () => {
      return !this.stageSystem.isDropThroughActive(p1.name) &&
             (p1.body as Phaser.Physics.Arcade.Body).velocity.y >= 0;
    });
    this.physics.add.collider(p2, passthrough, undefined, () => {
      return !this.stageSystem.isDropThroughActive(p2.name) &&
             (p2.body as Phaser.Physics.Arcade.Body).velocity.y >= 0;
    });

    // HUD
    this.hud = new HUD(this);
    this.hud.create(p1, p2);

    // Touch controls (no-ops on desktop)
    const touchControls = new TouchControls(this, this.inputSystem);
    touchControls.create();

    this.physics.world.gravity.y = 800;
  }

  update(_time: number, delta: number): void {
    const now = Date.now();
    const [p1, p2] = this.fighters;

    const in1 = this.inputSystem.getInput(0);
    const in2 = this.inputSystem.getInput(1);

    if (in1.dropPressed) this.stageSystem.startDropThrough(p1.name);
    if (in2.dropPressed) this.stageSystem.startDropThrough(p2.name);

    p1.update(in1, delta);
    p2.update(in2, delta);

    this.combatSystem.update(this.fighters);
    this.weaponSystem.update(this.fighters, now);
    this.hud.update(p1, p2);

    // Blast zone check
    for (const f of this.fighters) {
      if (f.getState() === 'DEAD') continue;
      if (this.stageSystem.isOutOfBounds(f.x, f.y)) {
        f.loseStock();
        if (f.stocks <= 0) {
          this.endGame(f === p1 ? p2 : p1);
        }
      }
    }
  }

  private endGame(winner: Fighter): void {
    this.scene.start('Result', { winnerName: winner.characterName });
  }
}
