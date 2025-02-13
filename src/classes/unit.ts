import { IUnit } from "../interfaces/gameInterface";

export class Unit implements IUnit {
  unitClass: "hero" | "item";
  unitType: string;
  unitId: string;
  boardPosition: number; // if position 0, not visible
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: "physical" | "magical";
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  dragonScale: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;

  constructor(data: {
    unitClass: "hero" | "item",
    unitType: string, // enum?
    unitId: string,
    boardPosition: number,
    maxHealth: number,
    currentHealth: number,
    isKO: boolean,
    movement: number,
    range: number,
    attackType: "physical" | "magical",
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
    this.unitClass = data.unitClass;
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
    this.dragonScale = data.dragonScale;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
  }

  move(x: number, y: number): void {
    // Define how the unit moves
    // TODO: we need a range of movement and range of attack functions
  }

  attack(target: Unit): void {
    // Define how the unit attacks
  }

  // heal(target: Unit): void {
  //   // Define how the unit attacks
  // } TODO: to be added to healing subclasses
}