import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeUnitClickable } from "../utils/setActiveUnit";

export class Hero extends Phaser.GameObjects.Container {
  class: EClass = EClass.HERO;
  faction: EFaction;
  unitType: EHeroes;
  unitId: string;
  boardPosition: number; // if position 0, not visible
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: EAttackType;
  power: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  isActiveValue: boolean;
  belongsTo: number;

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
    this.movement = data.movement;
    this.range = data.range;
    this.attackType = data.attackType;
    this.power = data.power;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.factionBuff = data.factionBuff;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
    this.isActiveValue = false;
    this.belongsTo = data.belongsTo ?? 1;

    // Create the unit's image and images for its upgrades
    this.characterImage = context.add.image(0, -10, this.unitType).setOrigin(0.5).setDepth(10).setName('body');
    if (this.belongsTo === 2 && this.boardPosition < 45) this.characterImage.setFlipX(true);

    this.runeMetalImage = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setDepth(10).setName('runeMetal');
    if (!this.runeMetal) this.runeMetalImage.setVisible(false);

    this.shiningHelmImage = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setDepth(10).setName('shiningHelm');
    if (!this.shiningHelm) this.shiningHelmImage.setVisible(false);

    if (this.faction === EFaction.COUNCIL) {
      this.factionBuffImage = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setDepth(10).setName('dragonScale');
    } else {
      this.factionBuffImage = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.3).setDepth(10).setName('soulStone');
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined
    if (!this.factionBuff) this.factionBuffImage.setVisible(false);

    // Add attack and healing reticles
    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setDepth(10).setName('attackReticle').setVisible(false);
    this.healReticle = context.add.image(0, -10, 'healReticle').setOrigin(0.5).setScale(0.8).setDepth(10).setName('healReticle').setVisible(false);

    // Add animations to the reticles // TODO: rotate the animation
    const addTween = (reticle: Phaser.GameObjects.Image) => {
      context.tweens.add({
        targets: reticle,
        scale: {
          from: 0.8,
          to: 1
        },
        duration: 500,
        yoyo: true,
        repeat: -1, // Repeat forever
        ease: 'Sine.easeInOut'
      });
    };
    addTween(this.attackReticle);
    addTween(this.healReticle);

    // Add all individual images to container
    this.add([this.characterImage, this.runeMetalImage, this.factionBuffImage, this.shiningHelmImage, this.attackReticle, this.healReticle]).setSize(50, 50).setInteractive().setName(this.unitId);

    // Hide if in deck
    if (this.boardPosition === 51) this.setVisible(false);

    makeUnitClickable(this, context);

    context.add.existing(this);
    context.currentGameContainer?.add(this);
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
    this.y = boardPosition < 45 ? y + 15 : y; // REVIEW:
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
      movement: this.movement,
      range: this.range,
      attackType: this.attackType,
      power: this.power,
      physicalDamageResistance: this.physicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
      factionBuff: this.factionBuff,
      runeMetal: this.runeMetal,
      shiningHelm: this.shiningHelm,
      belongsTo: this.belongsTo
    };
  }

  onActivate(): void {
    console.log(`${this.unitId} is now active`);
    this.setScale(1.2);

    this.highlightMovementTiles();
    this.highlightEnemiesInRange();
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.setScale(1);

    this.clearHighlights();
  }

  highlightMovementTiles() {
    console.log("Highlighting movement tiles...");
    // Add logic to highlight movement range tiles
  }

  highlightEnemiesInRange() {
    console.log("Highlighting enemies in range...");
    // Add logic to highlight attackable enemies
  }

  clearHighlights() {
    console.log("Clearing all highlights...");
    // Add logic to remove movement/attack highlights
  }

  move(x: number, y: number): void {
    // Define how the unit moves
    // TODO: we need a range of movement and range of attack functions
  }

  attack(target: Hero): void {
    // Define how the unit attacks
  }

  // heal(target: Unit): void {
  //   // Define how the unit attacks
  // } TODO: to be added to healing subclasses
}
