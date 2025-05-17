import { SuperCharge } from "../classes/item";
import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

function createGenericCouncilData(data: Partial<IHero>): {
  class: EClass,
  faction: EFaction,
  unitId: string,
  boardPosition: number,
  isKO: boolean,
  factionBuff: boolean,
  runeMetal: boolean,
  shiningHelm: boolean,
  superCharge: boolean,
  belongsTo: number,
  lastBreath: boolean,
  powerModifier: number,
} {
  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    powerModifier: data.powerModifier ?? 0
  };
}

export function createCouncilArcherData(data: Partial<IHero>): IHero {
  // Melee damage = 1/2 power
  const maxHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.ARCHER,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilWizardData(data: Partial<IHero>): IHero {
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    unitType: EHeroes.WIZARD,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilKnightData(data: Partial<IHero>): IHero {
  const maxHealth = 1000;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.KNIGHT,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilClericData(data: Partial<IHero>): IHero {
  // Heals for x3, revives for x2 power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.CLERIC,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 2,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilNinjaData(data: Partial<IHero>): IHero {
  // Melee is x2 power
  // Can teleport
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.NINJA,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 3,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}
