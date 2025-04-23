import { EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

export function createCouncilArcherData(data: Partial<IHero>): IHero {
  // Melee damage = 1/2 power
  const maxHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitType: EHeroes.ARCHER,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    range: 3,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: true
  };
}

export function createCouncilWizardData(data: Partial<IHero>): IHero {
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitType: EHeroes.WIZARD,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    range: 2,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: false
  };
}

export function createCouncilKnightData(data: Partial<IHero>): IHero {
  const maxHealth = 1000;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitType: EHeroes.KNIGHT,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    range: 1,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: false
  };
}

export function createCouncilClericData(data: Partial<IHero>): IHero {
  // Heals for x3, revives for x2 power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitType: EHeroes.CLERIC,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    range: 2,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: false
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
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitType: EHeroes.NINJA,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 3,
    range: 2,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: false
  };
}
