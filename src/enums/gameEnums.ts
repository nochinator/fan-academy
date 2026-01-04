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
  UNIT_VICTORY = 'Unit victory',
  TIME = 'Timeout',
  CONCEDED = 'Game conceded'
};

export enum EFaction {
  COUNCIL = 'Council',
  DARK_ELVES = 'Dark Elves',
  DWARVES = 'Dwarves',
  CRYSTAL = 'Crystal'
}

export enum EActionType {
  MOVE = 'move',
  ATTACK = 'attack',
  SPECIAL = 'special',
  SPAWN = 'spawn',
  USE = 'use',
  SHUFFLE = 'shuffle',
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

export enum EUnitEvent {
  MOVE = 'Move',
  ATTACK = 'Attack',
  HEAL = 'Heal',
  SPECIAL = 'Special',
  PUSHED = 'Pushed',
  HURT_PHYSICAL = 'HurtPhysical',
  HURT_MAGICAL = 'HurtMagical',
  HEALED = 'Healed',
  EQUIP = 'Equip',
  TURN_OVER = 'TurnOver'
}

export enum EEffect {
  RUNE_METAL_EQUIPMENT = 'runeMetalEquipment',
  HELM_EQUIPMENT = 'helmEquipment',
  DRAGON_SCALE_EQUIPMENT = 'dragonScaleEquipment',
  SOUL_STONE_EQUIPMENT = 'soulStoneEquipment',
  MANA_VIAL_BUFF = 'manaVialBuff',
  DRUNK_BUFF = 'drunkBuff',
  SUPERCHARGED_BUFF = 'superCharged',
  POWER_TILE_BUFF = 'powerTile',
  MAGICAL_TILE_BUFF = 'magicTile',
  PHYSICAL_TILE_BUFF = 'physicalTile',
  SPEED_TILE_BUFF = 'speedTile',
  CRYSTAL_TILE_EFFECT = 'crystalTile',
  SHIELD_BUFF = 'shiledBuff',
  PALADIN_BUFF = 'paladinBuff',
  CONSUME_BUFF = 'consumeBuff',
  PRIESTESS_DEBUFF = 'priestessDebuff',
  ANNIHILATOR_DEBUFF = 'annihilatorDebuff',
}

export enum EReticle {
  MOVE = 'move',
  ATTACK = 'attck',
  SPECIAL_ATTACK = 'specialAttack',
  HEAL = 'heal',
  ALLY = 'ally',
  BLOCKED = 'blocked'
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
  MANA_VIAL = 'manaVial',

  // Dwarves
  // reuses dragon scale
  DWARVERN_BREW = 'dwarvernBrew',
  PULVERIZER = 'pulverizer'
}

export enum EClass {
  UNIT = 'unit',
  ITEM = 'item'
}

export enum EUnitTypes {
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
  WRAITH = 'wraith',

  // Dwarves
  PALADIN = 'paladin',
  GRENADIER = 'grenadier',
  GUNNER = 'gunner',
  ENGINEER = 'engineer',
  ANNIHILATOR = 'annihilator',

  // Special
  CRYSTAL_SMALL = 'crystalSmall',
  CRYSTAL = 'crystal',
  CRYSTAL_BIG = 'crystalBig',
};

export enum ETiles {
  BASIC = 'basic',
  HAND_SLOT = 'handSlot',
  POWER = 'powerTile',
  PHYSICAL_RESISTANCE = 'shieldTile',
  MAGICAL_RESISTANCE = 'helmetTile',
  CRYSTAL_DAMAGE = 'crystalDamageTile',
  TELEPORTER = 'teleporterTile',
  SPAWN = 'spawnTile',
  SPEED = 'speedTile',
  PALADIN_AURA = 'paladinAura',
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
  CONSUMABLE = 'Consumable',
  SPECIAL_TILE = 'Special Tile'
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
  BUTTON_PLAY = 'battleButtonSound',
  BUTTON_GENERIC = 'buttonPressGenericSound',
  BUTTON_FAILED = 'buttonFailedSound',
  GAME_DELETE = 'deleteGameSound',
  RESIGN = 'resignSound',
  WIN_SFX = 'winSFXSound',
  LOSE_SFX = 'loseSFXSound',
  BACKGROUND_TUNE = 'backgroundTune'
}

export enum EGameSounds {
  UNIT_HAND_SELECT = 'selectHeroFromHandSound',
  THINKING_TUNE = 'thinkingTune',
  UNIT_BOARD_SELECT = 'selectHeroFromBoardSound',
  UNIT_SPAWN = 'spawnHeroSound',
  UNIT_MOVE = 'moveHeroSound',
  MOVE_FLY = 'moveFlySound',
  MOVE_WALK = 'moveWalkSound',
  HEAL = 'healSound',
  HEAL_EXTRA = 'healExtraSound',
  UNIT_STOMP = 'stompSound',
  VANISH = 'vanishSound',
  UNIT_REVIVE = 'reviveHeroSound',

  SCROLL_SELECT = 'selectScrollSound',
  RUNE_METAL_SELECT = 'selectRuneMetalSound',
  SHIELD_SELECT = 'selectDragonScaleSound',
  ITEM_SELECT = 'selectItemGenericSound',
  POTION_SELECT = 'selectPotionSound',
  AOE_SPELL_SELECT = 'selectInfernoSound',

  SCROLL_USE = 'useScrollSound',
  RUNE_METAL_USE = 'useRuneMetalSound',
  DRAGON_SCALE_USE = 'useDragonScaleSound',
  ITEM_USE = 'useItemGenericSound', // Shining helm and Soul stone
  POTION_USE = 'usePotionSound',

  SWORD_TILE = 'swordTileSound',
  SHIELD_TILE = 'shieldTileSound',
  HELM_TILE = 'helmTileSound',
  CRYSTAL_TILE = 'crystalTileSound',

  RESET_TURN = 'resetTurnSound',
  DRAW = 'newItemsSound',
  SHUFFLE = 'returnItemSound',
  CRYSTAL_DAMAGE = 'damageCrystal1Sound',
  CRYSTAL_DAMAGE_BUFF = 'damageCrystal2Sound',
  CRYSTAL_DESTROY = 'destroyCrystalSound',

  // Council sounds
  ARCHER_ATTACK = 'archerAttackSound',
  ARCHER_ATTACK_BIG = 'archerAttackBigSound',
  ARCHER_ATTACK_MELEE = 'archerAttackMeleeSound',
  ARCHER_DEATH = 'archerDeathSound',
  CLERIC_ATTACK = 'clericAttackSound',
  CLERIC_ATTACK_BIG = 'clericAttackBigSound',
  CLERIC_DEATH = 'clericDeathSound',
  KNIGHT_ATTACK = 'knightAttackSound',
  KNIGHT_ATTACK_BIG = 'knightAttackBigSound',
  KNIGHT_DEATH = 'knightDeathSound',
  NINJA_ATTACK = 'ninjaAttackSound',
  NINJA_ATTACK_BIG = 'ninjaAttackBigSound',
  NINJA_ATTACK_RANGED = 'ninjaAttackRangedSound',
  NINJA_DEATH = 'ninjaDeathSound',
  NINJA_SMOKE = 'ninjaSmokeSound',
  WIZARD_ATTACK = 'wizardAttackSound',
  WIZARD_ATTACK_BIG = 'wizardAttackBigSound',
  WIZARD_DEATH = 'wizardDeathSound',
  INFERNO_USE = 'useInfernoSound',

  // Elves sounds
  PRIESTESS_ATTACK = 'priestessAttackSound',
  PRIESTESS_DEATH = 'priestessDeathSound', // used also for Necromancer's death
  IMPALER_ATTACK = 'impalerAttackSound',
  IMPALER_ATTACK_BIG = 'impalerAttackBigSound',
  IMPALER_ATTACK_MELEE = 'impalerAttackMeleeSound',
  IMPALER_DEATH = 'impalerDeathSound',
  NECROMANCER_ATTACK = 'necroAttackSound',
  NECROMANCER_ATTACK_BIG = 'necroAttackBigSound',
  NECROMANCER_DEATH = 'necromancerDeathSound',
  PHANTOM_SPAWN = 'phantomSpawnSound',
  PHANTOM_DEATH = 'phantomDeathSound',
  VOIDMONK_ATTACK = 'voidmonkAttackSound',
  VOIDMONK_ATTACK_BIG = 'voidmonkAttackBigSound',
  VOIDMONK_DEATH = 'voidmonkDeathSound',
  WRAITH_ATTACK = 'wraithAttackSound',
  WRAITH_ATTACK_BIG = 'wraithAttackBigSound',
  WRAITH_DEATH = 'wraithDeathSound', 
  WRAITH_CONSUME = 'wraithConsumeSound',
  USE_HARVEST = 'useHarvestSound',

  // Dwarves sounds
  PALADIN_HEAL = 'paladinHealSound',
  PALADIN_ATTACK = 'paladinAttackSound',
  PALADIN_ATTACK_BIG = 'paladinAttackBigSound',
  PALADIN_DEATH = 'paladinDeath',
  ENGINEER_ATTACK = 'engineerAttackSound',
  ENGINEER_ATTACK_BIG = 'engineerAttackBigSound',
  ENGINEER_SHIELD_MAKE = 'engineerShieldMake',
  ENGINEER_SHIELD_BREAK = 'engineerShieldBreak',
  GRENADIER_ATTACK = 'grenadierAttack',
  GRENADIER_ATTACK_BIG = 'grenadierAttackBig',
  GRENADIER_ATTACK_MELEE = 'grenadierAttackMelee',
  GRENADIER_DEATH = 'grenadierDeath',
  GUNNER_ATTACK = 'gunnerAttack',
  GUNNER_JUMP = 'gunnerJump',
  GUNNER_ATTACK_ONLY = 'gunnerAttackGunOnly',
  GUNNER_DEATH = 'gunnerDeath',
  ANNIHILATOR_SHOOT = 'annihilatorShoot',
  ANNIHILATOR_HIT = 'annihilatorHit',
  ANNIHILATOR_WINDUP = 'annihilatorWindup',
  BREW_SELECT = 'brewSelect',
  BREW_USE = 'brewUse',
  DRILL_SELECT = 'drillSelect',
  DRILL_USE = 'drillUse'
}