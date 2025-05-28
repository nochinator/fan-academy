import { EAttackType, ETiles } from "../enums/gameEnums";
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
  crystalImage: Phaser.GameObjects.Image;
  singleCrystalDebuff: Phaser.GameObjects.Image;
  doubleCrystalDebuff: Phaser.GameObjects.Image;
  attackReticle: Phaser.GameObjects.Image;
  blockedLOS: Phaser.GameObjects.Image;

  debuffEventSingle: Phaser.Time.TimerEvent;
  debuffEventDouble: Phaser.Time.TimerEvent;

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
    const crystalTexture = data.currentHealth <= data.maxHealth / 2 ? 'crystalDamaged' : 'crystalFull';
    this.crystalImage = context.add.image(0, -30, crystalTexture).setScale(0.8);

    this.blockedLOS = context.add.image(0, -10, 'blockedLOS').setOrigin(0.5).setName('blockedLOS').setVisible(false);

    const crystalColor = data.belongsTo === 1 ? 0x990000 : 0x3399ff;
    this.crystalImage.setTint(crystalColor);

    // Debuff images and animation
    this.singleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_1').setVisible(false);
    this.doubleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_3').setVisible(false);
    this.singleCrystalDebuff.setTint(crystalColor);
    this.doubleCrystalDebuff.setTint(crystalColor);

    const crystalDebuffEvent = (debuffImage: Phaser.GameObjects.Image, texture1: string, texture2: string) => {
      let frame = 0;
      return this.scene.time.addEvent({
        delay: 100, // milliseconds between frames
        loop: true,
        callback: () => {
          frame = 1 - frame; // Toggle between 0 and 1
          debuffImage.setTexture(frame === 0 ? texture1 : texture2);
        }
      });};

    this.debuffEventSingle = crystalDebuffEvent(this.singleCrystalDebuff, 'crystalDebuff_1', 'crystalDebuff_2');
    this.debuffEventDouble = crystalDebuffEvent(this.doubleCrystalDebuff, 'crystalDebuff_3', 'crystalDebuff_4');

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

    this.add([this.pedestalImage, this.crystalImage, this.singleCrystalDebuff, this.doubleCrystalDebuff, this.attackReticle, this.blockedLOS]).setSize(90, 95).setInteractive().setDepth(this.boardPosition + 10); // REVIEW: not setting name

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

  getsDamaged(damage: number, attackType?: EAttackType): void {
    // TODO: healthbar animation and check for exact damage received (not power)
    const totalDamage = damage > this.currentHealth ? this.currentHealth : damage;
    this.currentHealth -= totalDamage;

    if (this.currentHealth <= this.maxHealth / 2) {
      this.crystalImage.setTexture('crystalDamaged'); // FIXME: below 50%, this changes the texture every time the crystal is damaged
    }

    this.updateTileData();
    if (this.currentHealth <= 0) this.removeFromGame(); // TODO: destruction animation
  }

  removeFromGame(): void {
    if (this.isLastCrystal) console.log('GAME OVER FUNCTION HERE');

    const tile = this.getTile();
    tile.crystal = undefined;
    tile.occupied = false;
    tile.obstacle = false;
    tile.tileType = ETiles.BASIC;

    // Remove destoyed crystal from the board array
    const crystalArray = this.context.gameController!.board.crystals;
    const index = crystalArray.findIndex(crystal => crystal.boardPosition === this.boardPosition);
    crystalArray.splice(index, 1);

    // Update the remaining crystal
    const otherCrystal = crystalArray.find(crystal => crystal.belongsTo === this.belongsTo);
    if (!otherCrystal) throw new Error('Crystal getsDestroyed() No other crystal found');

    otherCrystal.isLastCrystal = true;
    otherCrystal.updateTileData();

    // Remove animations
    this.scene.tweens.killTweensOf(this);

    this.list.forEach(child => {
      this.scene.tweens.killTweensOf(child);
    });

    // Remove events
    this.debuffEventSingle.remove(false);
    this.debuffEventDouble.remove(false);

    // Destroy container and children
    this.destroy(true);
  }
}