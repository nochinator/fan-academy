import { EAttackType, EGameSounds, ETiles, EWinConditions, EUnitTypes, EEffect, EUnitEvent } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { playSound, roundToFive } from "../utils/gameUtils";
import { Tile } from "./tile";
import { Unit } from "./unit";
import { EClass, EFaction } from "../enums/gameEnums";
import { IUnitData } from "../interfaces/gameInterface"; // Rename ICrystal import
import { FloatingText } from "./floatingText";

export class Crystal extends Unit {
  singleCrystalDebuff: Phaser.GameObjects.Image;
  doubleCrystalDebuff: Phaser.GameObjects.Image;

  debuffEventSingle: Phaser.Time.TimerEvent;
  debuffEventDouble: Phaser.Time.TimerEvent;

  boardPosition: [number, number]; // Add tilePosition to Crystal class

  constructor(context: GameScene, data: IUnitData, tile: Tile | undefined) {
    // Create IUnitData from ICrystalInterface data
    const unitData: IUnitData = {
      unitId: `crystal_${data.belongsTo}`,
      type: data.type,
      faction: data.faction,
      class: data.class,
      currentHealth: data.currentHealth,
      maxHealth: data.maxHealth,
      baseHealth: data.baseHealth,
      basePower: data.basePower,
      currentPower: data.currentPower,
      movement: data.movement,
      attackRange: data.attackRange,
      specialRange: data.specialRange,
      effects: data.effects,
      boardPosition: data.boardPosition,
      belongsTo: data.belongsTo,
      canSpecial: data.canSpecial,
      attackType: data.attackType,

      isKO: false,
      lastBreath: data.lastBreath,
      basePhysicalDamageResistance: data.basePhysicalDamageResistance,
      baseMagicalDamageResistance: data.baseMagicalDamageResistance,
      physicalDamageResistance: data.physicalDamageResistance,
      magicalDamageResistance: data.magicalDamageResistance,
    };
    super(context, unitData, tile);
    this.unitId = `crystal_${data.belongsTo}`;
    this.name = `${data.belongsTo}_crystal_${data.belongsTo}`;
    this.type = EUnitTypes.CRYSTAL;
    this.class = EClass.UNIT;
    this.faction = data.belongsTo === 1 ? EFaction.COUNCIL : EFaction.DARK_ELVES;
    this.boardPosition = data.boardPosition; // Assign tilePosition

    const isBigCrystal = this.maxHealth === 9000;

    // Update characterImage for Crystal
    const crystalTexture = this.currentHealth <= this.maxHealth / 2 ? 'crystalDamaged' : 'crystalFull';
    this.characterImage.setTexture(crystalTexture).setScale(isBigCrystal ? 1 : 0.8);
    const crystalColor = this.belongsTo === 1 ? 0x3399ff : 0x990000;
    this.characterImage.setTint(crystalColor);

    // Debuff images and animation
    this.singleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_1').setVisible(false);
    this.doubleCrystalDebuff = context.add.image(0, -30, 'crystalDebuff_3').setVisible(false);

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

    this.add([this.singleCrystalDebuff, this.doubleCrystalDebuff]).setDepth(this.boardPosition[0] + 10);
  }

  exportData(): IUnitData {
    const unitData = super.exportData(); // Get base UnitData
    return {
      ...unitData,
    };
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
  }

  getsDamaged(damage: number, attackType: EAttackType, _pushed = false): number {
    // damage = base damage + the potency of each assult tile effect\
    console.log(this.getEffect(EEffect.CRYSTAL_TILE_EFFECT, true))
    const totalDamage = roundToFive(this.getLifeLost(damage + 
      (this.getEffect(EEffect.CRYSTAL_TILE_EFFECT, true)?.
      reduce((sum, effect) => sum + (effect?.potency ?? 0), 0) ?? 0), attackType));

    let triggers = []

    if (attackType === EAttackType.MAGICAL) triggers.push(EUnitEvent.HURT_MAGICAL)
    else if (attackType === EAttackType.PHYSICAL) triggers.push(EUnitEvent.HURT_PHYSICAL)

    this.currentHealth -= totalDamage;

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // damage numbers
    if (totalDamage > 0) new FloatingText(this.context, this.x, this.y - 50, totalDamage.toString());

    this.unitCard.updateCardData({ ...this.exportData(), currentPower: this.exportData().currentPower });

    // Play sound based on debuff
    if (totalDamage > damage) {
      playSound(this.scene, EGameSounds.CRYSTAL_DAMAGE_BUFF);
    } else {
      playSound(this.scene, EGameSounds.CRYSTAL_DAMAGE);
    }

    // Update crystal texture if health is low
    if (this.currentHealth <= this.maxHealth / 2) {
      this.characterImage.setTexture('crystalDamaged');
    }

    // Update player HP bar
    if (this.belongsTo === 1) this.context.gameController.gameUI.banner.playerOneHpBar.setHealth();
    if (this.belongsTo === 2) this.context.gameController.gameUI.banner.playerTwoHpBar.setHealth();

    if (this.currentHealth <= 0) this.removeFromGame();

    return totalDamage;
  }

  removeFromGame(): void {
    playSound(this.scene, EGameSounds.CRYSTAL_DESTROY);

    const tile = this.getTile();
    tile.unit = undefined;
    tile.tileType = ETiles.BASIC;

    // Remove destroyed crystal from the board array
    const crystalArray = this.context.gameController.board.crystals;
    const index = crystalArray.findIndex(crystal => crystal.unitId === this.unitId);
    crystalArray.splice(index, 1);

    // Update the remaining crystal or set gameOver
    const remainingCrystals = crystalArray.filter(crystal => crystal.belongsTo === this.belongsTo);
    if (remainingCrystals.length === 0) {
        this.context.gameController.gameOver = {
            winCondition: EWinConditions.CRYSTAL,
            winner: this.context.activePlayer!
        };
    } else {
      const otherCrystals = crystalArray.filter(crystal => crystal.belongsTo === this.belongsTo);
      if (!otherCrystals.length) throw new Error('Crystal getsDestroyed() No other crystals found');

      if (otherCrystals.length === 1) {
        otherCrystals[0].isKO = true;
      }
    }

    // Remove animations and events
    this.scene.tweens.killTweensOf(this);

    this.list.forEach(child => {
      this.scene.tweens.killTweensOf(child);
    });

    this.debuffEventSingle.remove(false);
    this.debuffEventDouble.remove(false);

    // Destroy container and children
    this.destroy(true);
  }

  attack(_target: Tile): void {
    return;
  }

  equipFactionBuff(): void {
    return;
  }
}