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
  BUTTON_PLAY = 'battleButton',
  BUTTON_GENERIC = 'buttonPressGeneric',
  BUTTON_FAILED = 'buttonFailed',
  GAME_DELETE = 'deleteGame',
  RESIGN = 'resign',
  WIN_SFX = 'winSFX',
  LOSE_SFX = 'loseSFX'
}

export enum EGameSounds {
  HERO_HAND_SELECT = 'selectHeroFromHand',
  HERO_BOARD_SELECT = 'selectHeroFromBoard',
  HERO_SPAWN = 'spawnHero',
  HERO_MOVE = 'moveHero',
  MOVE_FLY = 'moveFly',
  MOVE_WALK = 'moveWalk',
  HEAL = 'heal',
  HEAL_EXTRA = 'healExtra',
  HERO_STOMP = 'stomp',
  VANISH = 'vanish',
  HERO_REVIVE = 'reviveHero',

  SCROLL_SELECT = 'selectScroll',
  SWORD_SELECT = 'selectSword',
  SHIELD_SELECT = 'selectShield',
  ITEM_SELECT = 'selectItemGeneric',
  POTION_SELECT = 'selectPotion',
  AOE_SPELL_SELECT = 'selectFirebomb',

  SCROLL_USE = 'useScroll',
  SWORD_USE = 'useSword',
  SHIELD_USE = 'useShield',
  ITEM_USE = 'useItemGeneric', // Shining helm and Soul stone
  POTION_USE = 'usePotion',

  SWORD_TILE = 'landSword',
  SHIELD_TILE = 'landShield',
  HELM_TILE = 'landHelm',
  CRYSTAL_TILE = 'landCrystal',

  RESET_TURN = 'resetTurn',
  DRAW = 'newItems',
  SHUFFLE = 'returnItem',
  CRYSTAL_DAMAGE = 'damageCrystal1',
  CRYSTAL_DAMAGE_BUFF = 'damageCrystal2',
  CRYSTAL_DESTROY = 'destroyCrystal',

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
  INFERNO_USE = 'useFirebomb',

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
  WRAITH_ATTACK = 'wraithAttack',
  WRAITH_ATTACK_BIG = 'wraithAttackBig',
  WRAITH_DEATH = 'wraithDeath', // used also for Necromancer's death
  WRAITH_CONSUME = 'wraithConsume',
  USE_HARVEST = 'useHarvest'
}