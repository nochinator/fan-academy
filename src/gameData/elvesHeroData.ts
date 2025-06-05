import { EClass, EFaction, EHeroes, EAttackType } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

function createGenericElvesData(data: Partial<IHero>): {
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
  row: number,
  col: number
} {
  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    powerModifier: data.powerModifier ?? 0,
    row: data.row ?? 0,
    col: data.col ?? 0

  };
}

export function createElvesImpalerData(data: Partial<IHero>): IHero {
  const maxHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.IMPALER,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesPriestessData(data: Partial<IHero>): IHero {
  // Heals for x2, revives for 1/2 power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.PRIESTESS,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 2, // TODO: applies debuff
    healingRange: 3,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true
    ,
    ...createGenericElvesData(data)
  };
}

export function createElvesVoidMonkData(data: Partial<IHero>): IHero {
  // AOE damage in cone (above, below and behind hit unit) for 66.6% of power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 20;

  return {
    unitType: EHeroes.VOIDMONK,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesNecromancerData(data: Partial<IHero>): IHero {
  // Transforms KO units (friend or foe) into phantoms
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.NECROMANCER,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesWraithData(data: Partial<IHero>): IHero {
  // Can consume up to 3 KO'd units to level up: +150 hp and +50 power per unit
  // Can be deployed on a KO'd unit (does not consume it)
  const maxHealth = 650;
  const power = 250;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    unitType: EHeroes.WRAITH,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    unitsConsumed: data.unitsConsumed ?? 0,
    ...createGenericElvesData(data)
  };
}

export function createElvesPhantomData(data: Partial<IHero>): IHero {
  // Cannot be buffed or healed, disappears if KO'd
  return {
    unitType: EHeroes.PHANTOM,
    maxHealth: 100,
    currentHealth: data.currentHealth ?? 100,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: 100,
    physicalDamageResistance: 0,
    magicalDamageResistance: 0,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}
