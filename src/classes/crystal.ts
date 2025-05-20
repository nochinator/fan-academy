import { ETiles } from "../enums/gameEnums";
import { ICrystal } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeCrystalClickable } from "../utils/makeUnitClickable";
import { Tile } from "./tile";

export class Crystal extends Phaser.GameObjects.Container {
  belongsTo: number;
  maxHealth: number;
  currentHealth: number;
  isDestroyed: boolean;
  isLastCrystal: boolean;
  boardPosition: number;

  context: GameScene;

  pedestalImage: Phaser.GameObjects.Image;
  crystalFull: Phaser.GameObjects.Image;
  crystalDamaged: Phaser.GameObjects.Image;
  singleCrystalDebuff: Phaser.GameObjects.Image;
  doubleCrystalDebuff: Phaser.GameObjects.Image;
  attackReticle: Phaser.GameObjects.Image;

  constructor(context: GameScene, data: ICrystal) {
    const { x, y } = context.centerPoints[data.boardPosition];
    super(context, x, y);
    this.context = context;

    this.belongsTo = data.belongsTo;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.isDestroyed = data.isDestroyed;
    this.isLastCrystal = data.isLastCrystal;
    this.boardPosition = data.boardPosition;

    this.pedestalImage = context.add.image(0, 0, 'pedestal').setScale(0.8);
    this.crystalFull = context.add.image(0, -30, 'crystalFull').setScale(0.8);
    this.crystalDamaged =  context.add.image(0, 0, 'crystalDamaged').setVisible(false);

    const crystalColor = data.belongsTo === 1 ? 0x990000 : 0x3399ff;
    this.crystalFull.setTint(crystalColor);
    this.crystalDamaged.setTint(crystalColor);

    // Debuff images and animation
    this.singleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_1').setVisible(false);
    this.doubleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_3').setVisible(false);
    this.singleCrystalDebuff.setTint(crystalColor);
    this.doubleCrystalDebuff.setTint(crystalColor);

    const crystalDebuffEvent = (debuffImage: Phaser.GameObjects.Image, texture1: string, texture2: string) => {
      let frame = 0;
      this.scene.time.addEvent({
        delay: 100, // milliseconds between frames
        loop: true,
        callback: () => {
          frame = 1 - frame; // Toggle between 0 and 1
          debuffImage.setTexture(frame === 0 ? texture1 : texture2);
        }
      });};

    crystalDebuffEvent(this.singleCrystalDebuff, 'crystalDebuff_1', 'crystalDebuff_2');
    crystalDebuffEvent(this.doubleCrystalDebuff, 'crystalDebuff_3', 'crystalDebuff_4');

    // Attack reticle and animation
    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setName('attackReticle').setVisible(false);
    const addTween = (reticle: Phaser.GameObjects.Image) => {
      context.tweens.add({
        targets: reticle,
        angle: 360,
        duration: 7000,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          // Reset the angle to 0 each time to prevent overflow
          reticle.angle = 0;
        }
      });
    };
    addTween(this.attackReticle);

    this.add([this.pedestalImage, this.crystalFull, this.crystalDamaged, this.singleCrystalDebuff, this.doubleCrystalDebuff, this.attackReticle]).setSize(90, 95).setInteractive().setDepth(this.boardPosition + 10); // REVIEW: not setting name

    makeCrystalClickable(this, this.context);

    context.add.existing(this);
  }

  getTile(): Tile {
    const tile = this.context?.gameController?.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  updateTileData(): void {
    const tile = this.getTile();

    tile.crystal = {
      belongsTo: this.belongsTo,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isDestroyed: this.isDestroyed,
      isLastCrystal: this.isLastCrystal,
      boardPosition: this.boardPosition
    };
  }

  getsDamaged(damage: number): void {
    // TODO: healthbar animation
    this.currentHealth -= damage;

    if (this.currentHealth === this.maxHealth / 2) {
      this.crystalFull.setVisible(false); // TODO: change textures
      this.crystalDamaged.setVisible(true);
    }

    if (damage <= 0) this.getsDestroyed();
  }

  getsDestroyed(): void {
    if (this.isLastCrystal) console.log('GAME OVER FUNCTION HERE');

    const tile = this.getTile();
    tile.crystal = undefined;
    tile.tileType = ETiles.BASIC;

    const otherCrystalTile = this.context.gameController?.board.tiles.find(tile => tile.crystal?.belongsTo === this.belongsTo); // REVIEW: Removed the boardPosition check since in theory there is only one crystal left

    if (!otherCrystalTile) throw new Error('Crystal getsDestroyed() No other crystal found');

    otherCrystalTile.crystal!.isLastCrystal = true;
  }
}