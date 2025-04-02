import { EAttackType, EFaction } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

export class Hero implements IHero {
  class: "hero";
  faction: EFaction.COUNCIL | EFaction.DARK_ELVES;
  unitType: string;
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

  constructor(data: {
    faction: EFaction,
    unitType: string, // enum?
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
    dragonScale: boolean,
    runeMetal: boolean,
    shiningHelm: boolean
  }
  ) {
    this.class = "hero";
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
    this.factionBuff = data.dragonScale;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
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