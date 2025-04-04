import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

export class Hero implements IHero {
  // TODO: Automatically assign starting values (when applicable) below, will keep code clean
  // TODO: change property isActive to activeValue and add properties for setter, getter and highlighting tiles
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

  constructor(data: {
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
  }
  ) {
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