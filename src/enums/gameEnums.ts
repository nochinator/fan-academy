export enum EAttackType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical'
};

export enum EGameStatus {
  SEARCHING = 'searching',
  PLAYING = 'playing',
  FINISHED = 'finished'
};

export enum EGameTermination {
  CONCEDED = 'conceded',
  CANCELED = 'canceled'
}

export enum EWinConditions {
  CRYSTAL = 'Crystals destroyed',
  UNITS = 'Units defeated',
  TIME = 'Timeout',
  CONCEDED = 'Game conceded'
};

export enum EFaction {
  COUNCIL = 'Council',
  DARK_ELVES = 'Dark Elves'
}

export enum EAction {
  MOVE = 'move',
  ATTACK = 'attack',
  SPAWN = 'spawn',
  USE = 'use', // works for potions and buffs
  SHUFFLE = 'shuffle'
}

export enum EItems {
  // Generic
  SHINING_HELM = 'shiningHelm',
  RUNE_METAL = 'runeMetal',
  SCROLL = 'scroll',

  // Council
  DRAGON_SCALE = 'dragonScale',
  HEALING_POTION = 'healingPotion',
  INFERNO = 'inferno',

  // Dark elves
  SOUL_STONE = 'soulStone',
  SOUL_HARVEST = 'soulHarvest',
  MANA_VIAL = 'manaVial'
}

export enum EClass {
  HERO = 'hero',
  ITEM = 'item'
}

export enum EHeroes {
  // Council
  ARCHER = 'archer',
  CLERIC = 'cleric',
  KNIGHT = 'knight',
  NINJA = 'ninja',
  WIZARD = 'wizard',

  // Dark Elves
  HERETIC = 'heretic',
  IMPALER = 'impaler',
  NECROMANCER = 'necromancer',
  PHANTOM = 'phantom',
  VOIDMONK = 'voidmonk',
  WRAITH = 'wraith'
}