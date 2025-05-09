import { EClass, EFaction, EHeroes, EAttackType } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";

export function createElvesImpalerData(data: Partial<IHero>): IHero {
  const maxHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.IMPALER,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
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

export function createElvesPriestessData(data: Partial<IHero>): IHero {
  // Heals for x2, revives for 1/2 power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.PRIESTESS,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    attackRange: 2, // TODO: applies debuff
    healingRange: 3,
    attackType: EAttackType.MAGICAL,
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

export function createElvesVoidMonkData(data: Partial<IHero>): IHero {
  // AOE damage in cone (above, below and behind hit unit) for 66.6% of power
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 20;

  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.VOIDMONK,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
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

export function createElvesNecromancerData(data: Partial<IHero>): IHero {
  // Transforms KO units (friend or foe) into phantoms
  const maxHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.NECROMANCER,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
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

export function createElvesWraithData(data: Partial<IHero>): IHero {
  // Can consume up to 3 KO'd units to level up: +150 hp and +50 power per unit
  // Can be deployed on a KO'd unit (does not consume it)
  const maxHealth = 650;
  const power = 250;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.WRAITH,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? maxHealth,
    isKO: data.isKO ?? false,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
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

export function createElvesPhantomData(data: Partial<IHero>): IHero {
  // Cannot be buffed or healed
  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitType: EHeroes.PHANTOM,
    unitId: data.unitId!,
    boardPosition: data.boardPosition!, // REVIEW: can't be on deck or hand
    maxHealth: 100,
    currentHealth: data.currentHealth ?? 100,
    isKO: false, // If KO'd immediately disappears
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: 100,
    physicalDamageResistance: 0,
    magicalDamageResistance: 0,
    factionBuff: false,
    runeMetal: false,
    shiningHelm: false,
    belongsTo: data.belongsTo ?? 1,
    canHeal: false
  };
}
