import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeUnitClickable } from "../utils/makeUnitClickable";
import { Tile } from "./tile";

export abstract class Hero extends Phaser.GameObjects.Container {
  class: EClass = EClass.HERO;
  faction: EFaction;
  unitType: EHeroes;
  unitId: string;
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  healingRange: number;
  attackType: EAttackType;
  power: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  isActiveValue: boolean;
  belongsTo: number;
  canHeal: boolean;

  context: GameScene;

  private characterImage: Phaser.GameObjects.Image;
  private runeMetalImage: Phaser.GameObjects.Image;
  private shiningHelmImage: Phaser.GameObjects.Image;
  private factionBuffImage: Phaser.GameObjects.Image;
  private attackReticle: Phaser.GameObjects.Image;
  private healReticle: Phaser.GameObjects.Image;

  constructor(context: GameScene, data: IHero) {
    const { x, y } = context.centerPoints[data.boardPosition];
    super(context, x, y);
    this.context = context;

    // Interface properties assignment
    this.faction = data.faction;
    this.unitType = data.unitType;
    this.unitId = data.unitId;
    this.boardPosition = data.boardPosition;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.isKO = data.isKO;
    this.lastBreath = data.lastBreath;
    this.movement = data.movement;
    this.attackRange = data.attackRange;
    this.healingRange = data.healingRange;
    this.attackType = data.attackType;
    this.power = data.power;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.factionBuff = data.factionBuff;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
    this.isActiveValue = false;
    this.belongsTo = data.belongsTo ?? 1;
    this.canHeal = data.canHeal ?? false;

    // Create the unit's image and images for its upgrades
    this.characterImage = context.add.image(0, -10, this.unitType).setOrigin(0.5).setName('body');
    if (this.belongsTo === 2 && this.boardPosition < 45) this.characterImage.setFlipX(true);
    if (this.isKO) this.characterImage.angle = 90;

    this.runeMetalImage = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setName('runeMetal');
    if (!this.runeMetal) this.runeMetalImage.setVisible(false);

    this.shiningHelmImage = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setName('shiningHelm');
    if (!this.shiningHelm) this.shiningHelmImage.setVisible(false);

    if (this.faction === EFaction.COUNCIL) {
      this.factionBuffImage = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setName('dragonScale');
    } else {
      this.factionBuffImage = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.3).setName('soulStone');
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined
    if (!this.factionBuff) this.factionBuffImage.setVisible(false);

    // Add attack and healing reticles
    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setName('attackReticle').setVisible(false);
    this.healReticle = context.add.image(0, -10, 'healReticle').setOrigin(0.5).setScale(0.8).setName('healReticle').setVisible(false);

    // Add animations to the reticles // TODO: rotate the animation
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
    addTween(this.healReticle);

    // Add all individual images to container
    this.add([this.characterImage, this.runeMetalImage, this.factionBuffImage, this.shiningHelmImage, this.attackReticle, this.healReticle]).setSize(50, 50).setInteractive().setName(this.unitId).setDepth(this.boardPosition + 10); // REVIEW: depth

    // Hide if in deck
    if (this.boardPosition === 51) this.setVisible(false);

    makeUnitClickable(this, context);

    this.scene.input.enableDebug(this);

    context.add.existing(this);
  }

  get isActive() {
    return this.isActiveValue;
  }

  set isActive(value: boolean) {
    this.isActiveValue = value;
    if (value) {
      this.onActivate();
    } else {
      this.onDeactivate();
    }
  }

  updatePosition(boardPosition: number): void {
    const { x, y } = this.context.centerPoints[boardPosition];
    this.x = x;
    this.y = y;
    this.boardPosition = boardPosition;
  }

  exportData(): IHero {
    return {
      class: this.class,
      faction: this.faction,
      unitType: this.unitType,
      unitId: this.unitId,
      boardPosition: this.boardPosition,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isKO: this.isKO,
      lastBreath: this.lastBreath,
      movement: this.movement,
      attackRange: this.attackRange,
      healingRange: this.healingRange,
      attackType: this.attackType,
      power: this.power,
      physicalDamageResistance: this.physicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
      factionBuff: this.factionBuff,
      runeMetal: this.runeMetal,
      shiningHelm: this.shiningHelm,
      belongsTo: this.belongsTo,
      canHeal: this.canHeal
    };
  }

  onActivate(): void {
    console.log(`${this.unitId} is now active`);
    this.setScale(1.2);
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.setScale(1);
  }

  knockedDown(): void {
    this.currentHealth = 0;
    this.isKO = true;
    const tile = this.getTile();
    tile.setOccupied(false); // REVIEW: might need a rework to function with the necromancer
    tile.hero = this.exportData();

    // TODO: Switch to KO'd image
    this.characterImage.angle = 90; // REVIEW: p1 units are face down, P2 face up
  }

  revived(): void {
    this.isKO = false;
    this.lastBreath = false;
    const tile = this.getTile();
    tile.setOccupied(true);
    tile.hero = this.exportData();
    this.characterImage.angle = 0;
  }

  private getTile(): Tile {
    const tile = this.context?.gameController?.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  updateTileData(): void {
    const tile = this.getTile();
    tile.hero = this.exportData();
  }

  removeFromBoard(): void {
    // Remove animations
    this.scene.tweens.killTweensOf(this);

    this.list.forEach(child => {
      this.scene.tweens.killTweensOf(child);
    });

    // Remove hero data from tile
    const tile = this.getTile();
    tile.removeHero();

    // Remove hero from board array
    let  unitsArray = this.context.gameController!.board.units;
    unitsArray = unitsArray.filter(unit => unit.unitId !== this.unitId);

    // Destroy container and children
    this.destroy(true);
  }

  abstract attack(target: Hero): void;

  abstract move(x: number, y: number): void;

  abstract heal(target: Hero): void;

  abstract revive(target: Hero): void;

  abstract teleport(target: Hero): void;
}
