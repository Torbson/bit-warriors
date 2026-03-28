import Phaser from 'phaser';
import type { PlayerInput, KeyBindings } from '../logic/types';
import { loadBindings } from '../logic/inputConfig';

type KeyMap = Record<keyof KeyBindings, Phaser.Input.Keyboard.Key>;

export class InputSystem {
  private keyMaps: [KeyMap, KeyMap];
  private prevJump: [boolean, boolean] = [false, false];
  private prevDrop: [boolean, boolean] = [false, false];
  private prevLight: [boolean, boolean] = [false, false];
  private prevHeavy: [boolean, boolean] = [false, false];

  // Touch state injected by TouchControls
  private touchInput: [Partial<PlayerInput>, Partial<PlayerInput>] = [{}, {}];

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    const bindings = loadBindings();
    this.keyMaps = [
      this.buildKeyMap(keyboard, bindings[0]),
      this.buildKeyMap(keyboard, bindings[1]),
    ];
  }

  private buildKeyMap(kb: Phaser.Input.Keyboard.KeyboardPlugin, b: KeyBindings): KeyMap {
    const codes = Phaser.Input.Keyboard.KeyCodes as Record<string, number>;
    const addKey = (name: string) => kb.addKey(codes[name] ?? name);
    return {
      left: addKey(b.left), right: addKey(b.right),
      aimUp: addKey(b.aimUp), aimDown: addKey(b.aimDown),
      jump: addKey(b.jump), drop: addKey(b.drop),
      lightAttack: addKey(b.lightAttack), heavyAttack: addKey(b.heavyAttack),
    };
  }

  /** Must be called once per frame in GameScene.update() */
  update(): void {
    // track previous state for rising-edge detection handled in getInput()
  }

  getInput(player: 0 | 1): PlayerInput {
    const km = this.keyMaps[player];
    const touch = this.touchInput[player];

    const leftDown = km.left.isDown;
    const rightDown = km.right.isDown;
    const upDown = km.aimUp.isDown;
    const downDown = km.aimDown.isDown;

    const jumpDown = km.jump.isDown;
    const dropDown = km.drop.isDown;
    const lightDown = km.lightAttack.isDown;
    const heavyDown = km.heavyAttack.isDown;

    // Rising edge
    const jumpPressed = jumpDown && !this.prevJump[player];
    const dropPressed = dropDown && !this.prevDrop[player];
    const lightPressed = lightDown && !this.prevLight[player];
    const heavyPressed = heavyDown && !this.prevHeavy[player];

    this.prevJump[player] = jumpDown;
    this.prevDrop[player] = dropDown;
    this.prevLight[player] = lightDown;
    this.prevHeavy[player] = heavyDown;

    const axisX = (touch.axis?.x ?? 0) || (rightDown ? 1 : leftDown ? -1 : 0);
    const axisY = (touch.axis?.y ?? 0) || (downDown ? 1 : upDown ? -1 : 0);

    return {
      axis: { x: axisX as -1 | 0 | 1, y: axisY as -1 | 0 | 1 },
      jumpPressed: jumpPressed || (touch.jumpPressed ?? false),
      dropPressed: dropPressed || (touch.dropPressed ?? false),
      lightPressed: lightPressed || (touch.lightPressed ?? false),
      heavyPressed: heavyPressed || (touch.heavyPressed ?? false),
    };
  }

  /** Called by TouchControls to inject mobile input for one player. */
  setTouchInput(player: 0 | 1, input: Partial<PlayerInput>): void {
    this.touchInput[player] = input;
  }

  /** Call after loading new bindings from SettingsScene. */
  rebuild(keyboard: Phaser.Input.Keyboard.KeyboardPlugin): void {
    const bindings = loadBindings();
    this.keyMaps = [
      this.buildKeyMap(keyboard, bindings[0]),
      this.buildKeyMap(keyboard, bindings[1]),
    ];
  }
}
