import { IUnitData } from "../interfaces/gameInterface";

export class Unit implements IUnitData {
  unitData: {
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
    dragonScale: boolean,
    runeMetal: boolean,
    shiningHelm: boolean,
  };

  constructor(
    unitData: {
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
      shiningHelm: boolean,
    }
  ) {
    this.unitData = unitData;
  }

  move(x: number, y: number): void {
    // Define how the unit moves
  }

  attack(target: Unit): void {
    // Define how the unit attacks
  }

  // heal(target: Unit): void {
  //   // Define how the unit attacks
  // } TODO: to be added to healing subclasses
}