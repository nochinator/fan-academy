import { Unit } from "./unit";

export class Archer extends Unit {
  constructor(
    unitId: string,
    boardPosition: number = 0,
    currentHealth: number = 800,
    isKO: boolean = false,
    dragonScale: boolean =  false,
    runeMetal: boolean =  false,
    shiningHelm: boolean =  false
  ) {
    super(
      {
        unitClass: "hero",
        unitType: 'archer',
        unitId,
        boardPosition,
        maxHealth: 800,
        currentHealth,
        isKO,
        movement: 2,
        range: 3,
        attackType: "physical",
        rangeAttackDamage: 300,
        meleeAttackDamage: 150,
        healingPower: 0, // If > 0, the unit can heal
        physicalDamageResistance: 0,
        magicalDamageResistance: 0,
        dragonScale,
        runeMetal,
        shiningHelm
      }
    );
  }
}

// class Wizard extends Unit {
//   constructor(id: string, team: string) {
//     super(id, team, "wizard", 40, 15, 3); // Example stats
//   }
// }

// class Warrior extends Unit {
//   constructor(id: string, team: string) {
//     super(id, team, "warrior", 60, 8, 4); // Example stats
//   }
// }