export enum EAttackType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical'
};

export enum EGameStatus {
  SEARCHING = 'searching',
  PLAYING = 'playing',
  FINISHED = 'finished',
  CHALLENGE = 'challenge'
};

export enum EGameTermination {
  CONCEDED = 'conceded',
  CANCELED = 'canceled'
}

export enum EWinConditions {
  CRYSTAL = 'Crystal victory',
  UNITS = 'Hero victory',
  TIME = 'Timeout',
  CONCEDED = 'Game conceded'
};

export enum EFaction {
  COUNCIL = 'Council',
  DARK_ELVES = 'Dark Elves'
}

export enum EActionType {
  MOVE = 'move',
  ATTACK = 'attack',
  HEAL = 'heal',
  SPAWN = 'spawn',
  SPAWN_PHANTOM = 'phantom',
  USE = 'use',
  SHUFFLE = 'shuffle',
  TELEPORT = 'teleport',
  CONCEDE = 'concede',

  // Automated actions
  DRAW = 'draw',
  PASS = 'pass',
  REMOVE_UNITS = 'removeUnits'
}

export enum EActionClass {
  USER = 'user',
  AUTO = 'automatic'
}

export enum EItems {
  // Generic
  SHINING_HELM = 'shiningHelm',
  RUNE_METAL = 'runeMetal',
  SUPERCHARGE = 'superCharge',

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
  PRIESTESS = 'priestess',
  IMPALER = 'impaler',
  NECROMANCER = 'necromancer',
  PHANTOM = 'phantom',
  VOIDMONK = 'voidmonk',
  WRAITH = 'wraith'
}

export enum ETiles {
  BASIC = 'basic',
  POWER = 'powerTile',
  PHYSICAL_RESISTANCE = 'shieldTile',
  MAGICAL_RESISTANCE = 'helmetTile',
  CRYSTAL_DAMAGE = 'crystalDamageTile',
  TELEPORTER = 'teleporterTile',
  CRYSTAL = 'crystal',
  SPAWN = 'spawnTile',
  SPEED = 'speedTile'
}

export enum ERange {
  MOVE = 'move',
  ATTACK = 'attack',
  HEAL = 'healing'
}

export enum ECardType {
  SHOOTER = 'Shooter',
  FIGHTER = 'Fighter',
  CASTER = 'Caster',
  SUPPORT = 'Support',
  EQUIPMENT = 'Equipment',
  BUFF = 'Buff',
  VICTORY = 'Victory Unit',
  SUPER = 'Super Unit',
  SUMMONED = 'Summoned',
  SPELL = 'Spell',
  CONSUMABLE = 'Consumable'
}

export enum EChallengePopup {
  SEND = 'send',
  ACCEPT = 'accept'
}

export enum EPopups {
  TURN = 'turn',
  CONCEDE = 'concede'
}

export enum EUiSounds {
  BATTLE_BUTTON = 'battleButton',
  BUTTON_PRESS_GENERIC = 'buttonPressGeneric',
  SEND_MOVE = 'sendMove',
  CHAT_MESSAGE = 'chatMessage',
  BUTTON_FAILED = 'buttonFailed',
  DELETE_GAME = 'deleteGame',
  RESIGN = 'resign',
  WIN_MUSIC = 'winMusic',
  LOSE_MUSIC = 'loseMusic',
  WIN_SFX = 'winSFX',
  LOSE_SFX = 'loseSFX'

}

export enum EGameSounds {
  HERO_HAND_SELECT = 'selectHeroFromHand',
  HERO_SPAWN = 'spawnHero',
  HERO_BOARD_SELECT = 'selectHeroFromBoard',
  HERO_MOVE = 'moveHero',
  MOVE_FLY = 'moveFly',
  MOVE_WALK = 'moveWalk',
  HERO_STOMP = 'stomp',
  VANISH = 'vanish',
  SCROLL_SELECT = 'selectScroll',
  SCROLL_USE = 'useScroll',
  SWORD_SELECT = 'selectSword',
  SWORD_USE = 'useSword',
  SHIELD_SELECT = 'selectShield',
  SHIELD_USE = 'useShield',
  ITEM_SELECT5 = 'selectItemGeneric',
  ITEM_USE = 'useItemGeneric',
  POTION_SELECT = 'selectPotion',
  POTION_USE = 'usePotion',
  RESET_TURN = 'resetTurn',
  HERO_REVIVE = 'reviveHero',
  SWORD_EQUIP = 'landSword',
  SHIELD_EQUIP = 'landShield',
  HELM_EQUIP = 'landHelm',
  LAND_CRYSTAL = 'landCrystal',
  KO = 'ko',
  DRAW = 'newItems',
  SHUFFLE = 'returnItem',
  CRYSTAL_DAMAGE = 'damageCrystal1',
  CRYSTAL_DAMAGE_BUFF = 'damageCrystal2',
  CRYSTAL_DESTROY = 'destroyCrystal',
  HIT_1 = 'hit1',
  HIT_2 = 'hit2',
  HIT_3 = 'hit3',
  HIT_4 = 'hit4',
  HEAL = 'heal',
  HEAL_EXTRA = 'healExtra',

  // Council sounds
  ARCHER_ATTACK = 'archerAttack',
  ARCHER_ATTACK_BIG = 'archerAttackBig',
  ARCHER_ATTACK_MELEE = 'archerAttackMelee',
  ARCHER_DEATH = 'archerDeath',
  CLERIC_ATTACK = 'clericAttack',
  CLERIC_ATTACK_BIG = 'clericAttackBig',
  CLERIC_DEATH = 'clericDeath',
  KNIGHT_ATTACK = 'knightAttack',
  KNIGHT_ATTACK_BIG = 'knightAttackBig',
  KNIGHT_DEATH = 'knightDeath',
  NINJA_ATTACK = 'ninjaAttack',
  NINJA_ATTACK_BIG = 'ninjaAttackBig',
  NINJA_ATTACK_RANGED = 'ninjaAttackRanged',
  NINJA_DEATH = 'ninjaDeath',
  NINJA_SMOKE = 'ninjaSmoke',
  WIZARD_ATTACK = 'wizardAttack',
  WIZARD_ATTACK_BIG = 'wizardAttackBig',
  WIZARD_DEATH = 'wizardDeath',
  SELECT_FIREBOMB = 'selectFirebomb',
  USE_FIREBOMB = 'useFirebomb',

  // Elves sounds
  PRIESTESS_ATTACK = 'priestessAttack',
  PRIESTESS_DEATH = 'priestessDeath',
  IMPALER_ATTACK = 'impalerAttack',
  IMPALER_ATTACK_BIG = 'impalerAttackBig',
  IMPALER_ATTACK_MELEE = 'impalerAttackMelee',
  IMPALER_DEATH = 'impalerDeath',
  NECRO_ATTACK = 'necroAttack',
  NECRO_ATTACK_BIG = 'necroAttackBig',
  PHANTOM_SPAWN = 'phantomSpawn',
  PHANTOM_DEATH = 'phantomDeath',
  VOID_MONK_ATTACK = 'voidMonkAttack',
  VOID_MONK_ATTACK_BIG = 'voidMonkAttackBig',
  VOID_MONK_DEATH = 'voidMonkDeath',
  WRAITH_SPAWN = 'wraithSpawn',
  WRAITH_ATTACK = 'wraithAttack',
  WRAITH_ATTACK_BIG = 'wraithAttackBig',
  WRAITH_DEATH = 'wraithDeath',
  WRAITH_CONSUME = 'wraithConsume',
  USE_HARVEST = 'useHarvest'
}