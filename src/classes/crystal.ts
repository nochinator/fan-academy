import { EAttackType, EGameSounds, ETiles, EWinConditions } from "../enums/gameEnums";
import { ICrystal, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { playSound, roundToFive } from "../utils/gameUtils";
import { makeCrystalClickable } from "../utils/makeUnitClickable";
import { CrystalCard } from "./crystalCard";
import { FloatingText } from "./floatingText";
import { HealthBar } from "./healthBar";
import { Tile } from "./tile";

export class Crystal extends Phaser.GameObjects.Container {
  belongsTo: number;
  maxHealth: number;
  currentHealth: number;
  isDestroyed: boolean;
  isLastCrystal: boolean;
  boardPosition: number;
  row: number;
  col: number;
  debuffAmount: number;
  debuffLevel: number;
  annihilatorDebuff: boolean;
  isShielded: boolean;
  paladinAura: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;

  context: GameScene;

  pedestalImage: Phaser.GameObjects.Image;
  crystalImage: Phaser.GameObjects.Image;
  singleCrystalDebuff: Phaser.GameObjects.Image;
  doubleCrystalDebuff: Phaser.GameObjects.Image;
  annihilatorDebuffImage: Phaser.GameObjects.Image;
  shieldImage: Phaser.GameObjects.Image;
  attackReticle: Phaser.GameObjects.Image;
  blockedLOS: Phaser.GameObjects.Image;

  debuffEventSingle: Phaser.Time.TimerEvent;
  debuffEventDouble: Phaser.Time.TimerEvent;

  healthBar: HealthBar;
  unitCard: CrystalCard;

  constructor(context: GameScene, data: ICrystal, tile: ITile) {
    const { x, y } = context.centerPoints[data.boardPosition];
    super(context, x, y);
    this.context = context;

    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.isDestroyed = data.isDestroyed;
    this.isLastCrystal = tile.tileType === ETiles.CRYSTAL_BIG ? true : data.isLastCrystal;
    this.boardPosition = data.boardPosition;
    this.row = tile.row;
    this.col = tile.col;
    this.belongsTo = data.belongsTo;
    this.debuffAmount = data.debuffAmount < 0 ? 0 : data.debuffAmount; // safeguard for bug
    this.debuffLevel = data.debuffLevel < 0 || data.debuffLevel === undefined ? 0 : data.debuffLevel; // safeguard for bug
    this.isShielded = data.isShielded;
    this.annihilatorDebuff = data.annihilatorDebuff;
    this.paladinAura = data.paladinAura ?? 0; // Initialize as number, default to 0
    this.physicalDamageResistance = data.physicalDamageResistance ?? 0; // Default to 0
    this.magicalDamageResistance = data.magicalDamageResistance ?? 0; // Default to 0

    this.healthBar = new HealthBar(context, data, -38, -70);
    this.unitCard = new CrystalCard(context, data).setVisible(false);

    const isBigCrystal = this.maxHealth === 9000;
    this.pedestalImage = context.add.image(0, 10, 'pedestal').setScale(0.8);
    const crystalTexture = data.currentHealth <= data.maxHealth / 2 ? 'crystalDamaged' : 'crystalFull';
    this.crystalImage = context.add.image(0, -30, crystalTexture).setScale(isBigCrystal ? 1 : 0.8);

    this.blockedLOS = context.add.image(0, -10, 'blockedLOS').setOrigin(0.5).setName('blockedLOS').setVisible(false);

    const crystalColor = this.belongsTo === 1 ? 0x3399ff : 0x990000;
    this.crystalImage.setTint(crystalColor);

    // Debuff images and animation
    this.singleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_1').setVisible(false);
    this.doubleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_3').setVisible(false);

    this.shieldImage = context.add.image(0, -30, 'shield').setVisible(this.isShielded);
    this.annihilatorDebuffImage = context.add.image(0, -30, 'annihilatorDebuff').setVisible(this.annihilatorDebuff);

    const crystalDebuffEvent = (debuffImage: Phaser.GameObjects.Image, texture1: string, texture2: string) => {
      let frame = 0;
      return this.scene.time.addEvent({
        delay: 100, // milliseconds between frames
        loop: true,
        callback: () => {
          frame = 1 - frame; // Toggle between 0 and 1
          debuffImage.setTexture(frame === 0 ? texture1 : texture2);
        }
      });
    };

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

    this.add([this.pedestalImage, this.crystalImage, this.singleCrystalDebuff, this.doubleCrystalDebuff, this.shieldImage, this.annihilatorDebuffImage, this.healthBar, this.attackReticle, this.blockedLOS, this.unitCard]).setSize(90, 95).setInteractive({ useHandCursor: true }).setDepth(this.boardPosition + 10);
    makeCrystalClickable(this, this.context);

    context.add.existing(this);
  }

  updateDebuffAnimation(newLevel: number): void {
    if (newLevel === undefined) {
      newLevel = 0;
    }
    switch (newLevel) {
      case 0:
        this.singleCrystalDebuff.setVisible(false);
        this.doubleCrystalDebuff.setVisible(false);
        break;
      case 1:
        this.singleCrystalDebuff.setVisible(true);
        this.doubleCrystalDebuff.setVisible(false);
        break;
      case 2:
        this.singleCrystalDebuff.setVisible(false);
        this.doubleCrystalDebuff.setVisible(true);
        break;
      default:
        console.error('updateDebuffAnimation() level and case dont match', newLevel);
        break;
    }
    this.debuffLevel = newLevel;
  }

  getTile(): Tile {
    const tile = this.context?.gameController?.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  updateTileData(): void {
    const tile = this.getTile();

    if (this.debuffLevel < 0) {
      this.debuffLevel = 0;
      this.updateDebuffAnimation(this.debuffLevel);
    }
    if (this.debuffAmount < 0) {
      this.debuffAmount = 0;
    }

    tile.crystal = {
      belongsTo: this.belongsTo,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isDestroyed: this.isDestroyed,
      isLastCrystal: this.isLastCrystal,
      boardPosition: this.boardPosition,
      row: this.row,
      col: this.col,
      debuffAmount: this.debuffAmount,
      debuffLevel: this.debuffLevel,
      annihilatorDebuff: this.annihilatorDebuff,
      isShielded: this.isShielded,
      paladinAura: this.paladinAura,
      physicalDamageResistance: this.physicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
    };
  }

  getsDamaged(damage: number, attackType: EAttackType, multiplier = 1): number {
    // Determine resistance based on attack type
    const resistance = attackType === EAttackType.PHYSICAL ? this.physicalDamageResistance : this.magicalDamageResistance;
    
    if (this.isShielded) {
      this.isShielded = false;
      this.shieldImage.setVisible(false);
      playSound(this.context, EGameSounds.ENGINEER_SHIELD_BREAK);
      return 0;
    }
    if (this.annihilatorDebuff && attackType === EAttackType.PHYSICAL) {
      this.annihilatorDebuff = false;
      this.physicalDamageResistance += 50;
      this.annihilatorDebuffImage.setVisible(false);
    }

    // Calculate damage after resistance
    const damageAfterResistance = damage - (damage * resistance) / 100;

    // Apply debuff multiplier
    const damageMultiplier = this.debuffAmount * multiplier;
    const totalDamage = roundToFive(damageAfterResistance + damageMultiplier);
    const damageTaken = totalDamage > this.currentHealth ? this.currentHealth : totalDamage;
    this.currentHealth -= damageTaken;

    // Play sound based on debuff
    if (this.debuffAmount > 0) {
      playSound(this.scene, EGameSounds.CRYSTAL_DAMAGE_BUFF);
    } else {
      playSound(this.scene, EGameSounds.CRYSTAL_DAMAGE);
    }

    // Update crystal texture if health is low
    if (this.currentHealth <= this.maxHealth / 2) {
      this.crystalImage.setTexture('crystalDamaged');
    }

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show damage numbers
    if (damageTaken > 0) new FloatingText(this.context, this.x, this.y - 50, damageTaken.toString());

    this.unitCard.updateCardHealth(this.currentHealth, this.maxHealth);
    this.updateTileData();

    // Update player HP bar
    if (this.belongsTo === 1) this.context.gameController?.gameUI.banner.playerOneHpBar.setHealth();
    if (this.belongsTo === 2) this.context.gameController?.gameUI.banner.playerTwoHpBar.setHealth();

    if (this.currentHealth <= 0) this.removeFromGame();

    return damageTaken;
  }

  removeFromGame(): void {
    playSound(this.scene, EGameSounds.CRYSTAL_DESTROY);

    const tile = this.getTile();
    tile.crystal = undefined;
    tile.obstacle = false;
    tile.tileType = ETiles.BASIC;

    // Remove destroyed crystal from the board array
    const crystalArray = this.context.gameController!.board.crystals;
    const index = crystalArray.findIndex(crystal => crystal.boardPosition === this.boardPosition);
    crystalArray.splice(index, 1);

    // Update the remaining crystal or set gameOver
    if (this.isLastCrystal) {
      this.context.gameController!.gameOver = {
        winCondition: EWinConditions.CRYSTAL,
        winner: this.context.activePlayer!
      };
    } else {
      const otherCrystals = crystalArray.filter(crystal => crystal.belongsTo === this.belongsTo);
      if (!otherCrystals.length) throw new Error('Crystal getsDestroyed() No other crystals found');

      if (otherCrystals.length === 1) {
        otherCrystals[0].isLastCrystal = true;
        otherCrystals[0].updateTileData();
      }
    }

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

  exportData(): ICrystal {
    return {
      belongsTo: this.belongsTo,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isDestroyed: this.isDestroyed,
      isLastCrystal: this.isLastCrystal,
      boardPosition: this.boardPosition,
      row: this.row,
      col: this.col,
      debuffAmount: this.debuffAmount,
      debuffLevel: this.debuffLevel,
      annihilatorDebuff: this.annihilatorDebuff,
      isShielded: this.isShielded,
      paladinAura: this.paladinAura,
      physicalDamageResistance: this.physicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
    };
  }
}