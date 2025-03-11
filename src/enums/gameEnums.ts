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