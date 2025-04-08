import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeClickable } from "../utils/setActiveUnit";

export class Hero extends Phaser.GameObjects.Container implements IHero {
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
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  isActiveValue: boolean;

  private characterImage: Phaser.GameObjects.Image;
  private runeMetalImage: Phaser.GameObjects.Image;
  private shiningHelmImage: Phaser.GameObjects.Image;
  private factionBuffImage: Phaser.GameObjects.Image;

  constructor(context: GameScene, data:  {
    faction: EFaction,
    unitType: EHeroes,
    unitId: string,
    boardPosition: number,
    maxHealth: number,
    currentHealth: number,
    isKO: boolean,
    movement: number,
    range: number,
    attackType: EAttackType,
    rangeAttackDamage: number,
    meleeAttackDamage: number,
    healingPower: number, // If > 0, the unit can heal
    physicalDamageResistance: number,
    magicalDamageResistance: number,
    factionBuff: boolean,
    runeMetal: boolean,
    shiningHelm: boolean,
  }) {
    const { x, y } = context.centerPoints[data.boardPosition];
    super(context, x, y);

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
    this.rangeAttackDamage = data.rangeAttackDamage;
    this.meleeAttackDamage = data.meleeAttackDamage;
    this.healingPower = data.healingPower;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.factionBuff = data.factionBuff;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
    this.isActiveValue = false;

    // Create the unit's image and images for its upgrades
    this.characterImage = context.add.image(0, -10, this.unitType).setOrigin(0.5).setDepth(10).setName('body');

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

    this.add([this.characterImage, this.runeMetalImage, this.factionBuffImage, this.shiningHelmImage]).setSize(50, 50).setInteractive().setName(this.unitId);

    if (this.boardPosition === 51) this.setVisible(false);

    makeClickable(this, context); // FIXME: this works but doesn't have the logic to do the checks

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

  onActivate() {
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
