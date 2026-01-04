import { GameObjects } from "phaser";
import { Archer, Cleric, DragonScale, HealingPotion, Inferno, Knight, Ninja, Wizard } from "../classes/council";
import { Crystal } from "../classes/crystal";
import { Impaler, ManaVial, Necromancer, Phantom, Priestess, SoulHarvest, SoulStone, VoidMonk, Wraith } from "../classes/elves";
import { Unit } from "../classes/unit";
import { Item, RuneMetal, ShiningHelm, SuperCharge } from "../classes/item";
import { Tile } from "../classes/tile";
import { EActionClass, EActionType, ECardType, EClass, EGameSounds, EUnitTypes, EItems, ETiles, EUiSounds, EWinConditions } from "../enums/gameEnums";
import { IUnitData, IItemData, IPlayerState, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import UIScene from "../scenes/ui.scene";
import { Annihilator, DwarvenBrew, Engineer, Grenadier, Gunner, Paladin, Pulverizer } from "../classes/dwarves";

export function isUnit(obj: IUnitData | IItemData): obj is IUnitData {
  return (obj as IUnitData).class === EClass.UNIT;
}

export function isItem(obj: IUnitData | IItemData): obj is IItemData {
  return (obj as IItemData).class === EClass.ITEM;
}

export function getGridDistance(startRow: number, startColumn: number, targetRow: number, targetColumn: number): number {
  const rowChange = Math.abs(startRow - targetRow);
  const columnChange = Math.abs(targetColumn - startColumn);
  const manhattanDistance = rowChange + columnChange;
  
  // movment's on the diagonals are 0.5 less distance, allows the "rounder" .5 distances of some units
  return (rowChange > 0 && columnChange > 0) ? manhattanDistance - 0.5 : manhattanDistance;
}

export function createNewItem(context: GameScene, itemData: IItemData): Item {
  const itemTypes: Record<EItems, () => Item> = {
    [EItems.SHINING_HELM]: () => new ShiningHelm(context, itemData),
    [EItems.SUPERCHARGE]: () => new SuperCharge(context, itemData),
    [EItems.RUNE_METAL]: () => new RuneMetal(context, itemData),

    [EItems.DRAGON_SCALE]: () => new DragonScale(context, itemData),
    [EItems.HEALING_POTION]: () => new HealingPotion(context, itemData),
    [EItems.INFERNO]: () => new Inferno(context, itemData),

    [EItems.MANA_VIAL]: () => new ManaVial(context, itemData),
    [EItems.SOUL_HARVEST]: () => new SoulHarvest(context, itemData),
    [EItems.SOUL_STONE]: () => new SoulStone(context, itemData),

    [EItems.DWARVERN_BREW]: () => new DwarvenBrew(context, itemData),
    [EItems.PULVERIZER]: () => new Pulverizer(context, itemData)
  };

  const createItem = itemTypes[itemData.itemType];
  if (!createItem) console.error('Error creating item', itemData);
  return createItem();
}

export function createNewUnit(context: GameScene, unitData: IUnitData, tile?: Tile): Unit {
  const unitTypes: Record<EUnitTypes, () => Unit> = {
    [EUnitTypes.ARCHER]: () => new Archer(context, unitData, tile),
    [EUnitTypes.CLERIC]: () => new Cleric(context, unitData, tile),
    [EUnitTypes.KNIGHT]: () => new Knight(context, unitData, tile),
    [EUnitTypes.NINJA]: () => new Ninja(context, unitData, tile),
    [EUnitTypes.WIZARD]: () => new Wizard(context, unitData, tile),

    [EUnitTypes.PRIESTESS]: () => new Priestess(context, unitData, tile),
    [EUnitTypes.IMPALER]: () => new Impaler(context, unitData, tile),
    [EUnitTypes.NECROMANCER]: () => new Necromancer(context, unitData, tile),
    [EUnitTypes.PHANTOM]: () => new Phantom(context, unitData, tile),
    [EUnitTypes.VOIDMONK]: () => new VoidMonk(context, unitData, tile),
    [EUnitTypes.WRAITH]: () => new Wraith(context, unitData, tile),

    [EUnitTypes.PALADIN]: () => new Paladin(context, unitData, tile),
    [EUnitTypes.GUNNER]: () => new Gunner(context, unitData, tile),
    [EUnitTypes.GRENADIER]: () => new Grenadier(context, unitData, tile),
    [EUnitTypes.ENGINEER]: () => new Engineer(context, unitData, tile),
    [EUnitTypes.ANNIHILATOR]: () => new Annihilator(context, unitData, tile),

    [EUnitTypes.CRYSTAL]: () => new Crystal(context, unitData, tile),
    [EUnitTypes.CRYSTAL_SMALL]: () => new Crystal(context, unitData, tile),
    [EUnitTypes.CRYSTAL_BIG]: () => new Crystal(context, unitData, tile),
  };

  const createUnit = unitTypes[unitData.type];
  if (!createUnit) console.error('Error creating unit', unitData);
  return createUnit();
}

export function belongsToPlayer(context: GameScene, unit: Unit | IUnitData): boolean {
  return unit.belongsTo === (context.isPlayerOne ? 1 : 2);
}

export async function moveAnimation(context: GameScene, unit: Unit, targetTile: Tile): Promise<void> {
  const flyingUnits = [EUnitTypes.NECROMANCER, EUnitTypes.WRAITH, EUnitTypes.PHANTOM];
  if (flyingUnits.includes(unit.type)) {
    playSound(context, EGameSounds.MOVE_FLY);
  } else {
    playSound(context, EGameSounds.MOVE_WALK);
  }

  // Stop user input until the animation finishes playing
  context.input.enabled = false;

  const unitImage: Phaser.GameObjects.Image = unit.characterImage;

  // If the unit is moving backwards, flip the unit's image for the duration of the animation
  let temporaryFlip: boolean;
  if (unit.belongsTo === 1 &&  targetTile.x < unit.x) {
    unitImage.setFlipX(true);
    temporaryFlip = true;
  }

  if (unit.belongsTo === 2 &&  targetTile.x > unit.x ) {
    unitImage.setFlipX(false);
    temporaryFlip = true;
  }

  const animation = (unit: Unit, targetTile: Tile): Promise<void> => {
    return new Promise((resolve) => {
      context.tweens.add({
        targets: unit,
        x: targetTile.x,
        y: targetTile.y,
        duration: 400,
        ease: 'Linear',
        onComplete: () => {
          context.input.enabled = true;
          if (temporaryFlip) unitImage.setFlipX(!unitImage.flipX);
          resolve();
        }
      });
    });
  };

  await animation.call(context, unit, targetTile);
}

export async function forcedMoveAnimation(context: GameScene, unit: Unit, targetTile: Tile): Promise<void> {
  context.input.enabled = false;

  const animation = (unit: Unit, targetTile: Tile): Promise<void> => {
    return new Promise((resolve) => {
      context.tweens.add({
        targets: unit,
        x: targetTile.x,
        y: targetTile.y,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
          context.input.enabled = true;
          resolve();
        }
      });
    });
  };

  await animation.call(context, unit, targetTile);
};

export function getNewPositionAfterForce(attackerRow: number, attackerCol: number, targetRow: number, targetCol: number, isPush: boolean): [number, number] {
  // Direction from attacker to target
  let directionRow = targetRow - attackerRow;
  let directionColumn = targetCol - attackerCol;

  // Normalize to single step
  directionRow = Math.sign(directionRow);
  directionColumn = Math.sign(directionColumn);

  // For pull, reverse the direction
  if (!isPush) {
    directionRow *= -1;
    directionColumn *= -1;
  }

  return [directionRow, directionColumn]
}

export function playSound(scene: Phaser.Scene, sound: EGameSounds | EUiSounds): void {
  scene.sound.play(sound);
}

// Not used at the moment, could be useful when animations are added. Otherwise remove
export function pauseCode(scene: Phaser.Scene, delay: number): Promise<void> {
  return new Promise(resolve => {
    scene.time.delayedCall(delay, resolve);
  });
}

export function selectItemSound(scene: Phaser.Scene, item: EItems): void {
  const itemMap = {
    [EItems.RUNE_METAL]: EGameSounds.RUNE_METAL_SELECT,
    [EItems.SUPERCHARGE]: EGameSounds.SCROLL_SELECT,
    [EItems.SHINING_HELM]: EGameSounds.ITEM_SELECT,

    [EItems.DRAGON_SCALE]: EGameSounds.SHIELD_SELECT,
    [EItems.HEALING_POTION]: EGameSounds.POTION_SELECT,
    [EItems.INFERNO]: EGameSounds.AOE_SPELL_SELECT,

    [EItems.SOUL_STONE]: EGameSounds.ITEM_SELECT,
    [EItems.MANA_VIAL]: EGameSounds.POTION_SELECT,
    [EItems.SOUL_HARVEST]: EGameSounds.AOE_SPELL_SELECT,

    [EItems.DWARVERN_BREW]: EGameSounds.BREW_SELECT,
    [EItems.PULVERIZER]: EGameSounds.DRILL_SELECT
  };

  const soundToPlay = itemMap[item];
  if (!soundToPlay) return;

  playSound(scene, soundToPlay);
}

export function selectDeathSound(scene: Phaser.Scene, unit: EUnitTypes): void {
  const unitMap = {
    [EUnitTypes.ARCHER]: EGameSounds.ARCHER_DEATH,
    [EUnitTypes.KNIGHT]: EGameSounds.KNIGHT_DEATH,
    [EUnitTypes.CLERIC]: EGameSounds.CLERIC_DEATH,
    [EUnitTypes.WIZARD]: EGameSounds.WIZARD_DEATH,
    [EUnitTypes.NINJA]: EGameSounds.NINJA_DEATH,

    [EUnitTypes.IMPALER]: EGameSounds.IMPALER_DEATH,
    [EUnitTypes.VOIDMONK]: EGameSounds.VOIDMONK_DEATH,
    [EUnitTypes.PRIESTESS]: EGameSounds.PRIESTESS_DEATH,
    [EUnitTypes.NECROMANCER]: EGameSounds.NECROMANCER_DEATH,
    [EUnitTypes.WRAITH]: EGameSounds.WRAITH_DEATH,
    [EUnitTypes.PHANTOM]: EGameSounds.PHANTOM_DEATH,

    [EUnitTypes.GRENADIER]: EGameSounds.GRENADIER_DEATH,
    [EUnitTypes.GUNNER]: EGameSounds.GUNNER_DEATH, // TODO: modify sound to not have beginning
     [EUnitTypes.PALADIN]: undefined, //EGameSounds.PALADIN_DEATH, // missing on assets repository
    [EUnitTypes.ENGINEER]: EGameSounds.GUNNER_DEATH, // no official sound
    [EUnitTypes.ANNIHILATOR]: EGameSounds.GRENADIER_DEATH, // no official sound

    [EUnitTypes.CRYSTAL]: EGameSounds.CRYSTAL_DESTROY,
    [EUnitTypes.CRYSTAL_SMALL]: EGameSounds.CRYSTAL_DESTROY,
    [EUnitTypes.CRYSTAL_BIG]: EGameSounds.CRYSTAL_DESTROY,
  };

  const soundToPlay = unitMap[unit];
  if (!soundToPlay) return;

  playSound(scene, soundToPlay);
}

export function getActionClass(action: EActionType): EActionClass {
  return [EActionType.PASS, EActionType.DRAW, EActionType.REMOVE_UNITS].includes(action) ? EActionClass.AUTO : EActionClass.USER;
}

export function getAOETiles(context: GameScene, caster: Item | Unit,  targetTile: Tile, getFriendly = false ): {
  unitTiles: Tile[],
  crystalTiles: Tile[]
} {
  const board = context.gameController.board;
  if (!board) throw new Error('Inferno use() board not found');

  const areaOfEffect = board.getAreaOfEffectTiles(targetTile);

  let unitTiles: Tile[] = [];
  let crystalTiles: Tile[] = [];
  if (getFriendly === true) {
    unitTiles = areaOfEffect?.filter(tile => tile.unit && tile.unit?.belongsTo === caster.belongsTo);
    crystalTiles = areaOfEffect?.filter(tile => tile.unit && tile.unit instanceof Crystal && tile.unit?.belongsTo === caster.belongsTo);

  } else if (getFriendly === false) {
    unitTiles = areaOfEffect?.filter(tile => tile.unit && tile.unit?.belongsTo !== caster.belongsTo);
    crystalTiles = areaOfEffect?.filter(tile => tile.unit && tile.unit instanceof Crystal && tile.unit?.belongsTo !== caster.belongsTo);

  } else { // set to undefined/null to get all in area
    unitTiles = areaOfEffect;
    crystalTiles = areaOfEffect;
  }

  return {
    unitTiles,
    crystalTiles
  };
}

// Used only by the voidmonk and wizard's splash attacks
export function canBeAttacked(attacker: Unit, tile: Tile): boolean {
  let result = false;

  if (tile.unit && tile.unit.belongsTo !== attacker.belongsTo && !tile.unit.isKO) result = true;

  return result;
}

export function isLastUnit(context: GameScene, unit: Unit): boolean {
  let attackingPlayer: IPlayerState | undefined;
  let defendingPlayer: IPlayerState | undefined;

  if (unit.unitId.includes(context.player1!.playerId)) {
    attackingPlayer = context.player2;
    defendingPlayer = context.player1;
  } else {
    attackingPlayer = context.player1;
    defendingPlayer = context.player2;
  }

  if (!attackingPlayer || !defendingPlayer) throw new Error('updateUnitsLeft() No player found');

  const unitsArray = context.gameController.board.units;
  if (!unitsArray) throw new Error('updateUnitsLeft() no units array found');

  // Get remaining units of defending player. Populate gameOver flag if there are none left and the player has no revives in hand
  const remainingBoardUnits = unitsArray.filter(bUnit => bUnit.belongsTo === unit.belongsTo).find(bUnit => !bUnit.isKO);

  let hand;
  let remainingHandUnits;
  const defendingPlayerIsActivePlayer = defendingPlayer.playerId === context.activePlayer;
  if (defendingPlayerIsActivePlayer) {
    hand = context.gameController.hand.getHand();
    remainingHandUnits = hand!.find(hUnit => hUnit.belongsTo === unit.belongsTo && hUnit.class === EClass.UNIT);
  } else {
    hand = defendingPlayer.factionData.unitsInHand;
    remainingHandUnits = hand.find(hUnit => hUnit.belongsTo === unit.belongsTo && hUnit.class === EClass.UNIT);
  }

  const remainingDeckUnits = defendingPlayer.factionData.unitsInDeck.find(dUnit => dUnit.belongsTo === unit.belongsTo && dUnit.class === EClass.UNIT);

  const reviveItems = [EItems.HEALING_POTION, EItems.SOUL_HARVEST];
  const hasReviveInHand = hand ? hand.find(rUnit => reviveItems.includes((rUnit as Item)?.itemType)) : undefined;

  if (remainingBoardUnits || remainingHandUnits || remainingDeckUnits || hasReviveInHand) return false;

  return true;
}

export function checkUnitGameOver(context: GameScene, unit: Unit): void {
  if (!isLastUnit(context, unit)) return;

  const attackingPlayer = unit.unitId.includes(context.player1!.playerId) ? context.player2 : context.player1;

  context.gameController.gameOver = {
    winCondition: EWinConditions.UNIT_VICTORY,
    winner: attackingPlayer!.playerId
  };
}

export function forcedMoveSpawnCheck(tile: Tile | ITile, unit: Unit): boolean {
  const spawnBelongsTo = tile.boardPosition[1] < 5 ? 1 : 2;
  return tile.tileType === ETiles.SPAWN && unit.belongsTo !== spawnBelongsTo;
}

export function isEnemySpawn(context: GameScene, tile: Tile | ITile): boolean {
  return tile.tileType === ETiles.SPAWN && (context.isPlayerOne ? tile.boardPosition[1] > 5 : tile.boardPosition[1] < 5);
}

export function turnIfBehind(context: GameScene, attacker: Unit, target: Unit): void {
  const isLookingRight = attacker.belongsTo === 1;
  const attackerImage = attacker.characterImage;

  if (isLookingRight && target.getTile().boardPosition[1] >= attacker.getTile().boardPosition[1]) return;
  if (!isLookingRight && target.getTile().boardPosition[1] <= attacker.getTile().boardPosition[1]) return;

  if (!isLookingRight) attackerImage.setFlipX(false);
  if (isLookingRight)  attackerImage.setFlipX(true);

  context.time.delayedCall(500, () => {
    attackerImage.setFlipX(!attacker.characterImage.flipX);
  });
}

export function getCardText(unit: EUnitTypes | EItems): {
  cardType: ECardType,
  cardText: string,
  cardName?: string
} {
  const unitMap = {
    [EUnitTypes.ARCHER]: {
      cardType: ECardType.SHOOTER,
      cardText: "Marksman who does high damage to enemies at range. Weak melee attack."
    },
    [EUnitTypes.CLERIC]: {
      cardType: ECardType.SUPPORT,
      cardText: "Spellcaster who revives and heals allies. Attacks enemies at range."
    },
    [EUnitTypes.KNIGHT]: {
      cardType: ECardType.FIGHTER,
      cardText: "Heavily armored and an excellent defender. His attacks knock back enemies."
    },
    [EUnitTypes.NINJA]: {
      cardType: ECardType.SUPER,
      cardText: "Deals double damage in melee range. He can teleport to allies."
    },
    [EUnitTypes.WIZARD]: {
      cardType: ECardType.CASTER,
      cardText: "Powerful spellcaster, damages groups of enemies with chain lightning."
    },

    [EUnitTypes.PRIESTESS]: {
      cardType: ECardType.SUPPORT,
      cardText: "She can heal up to 3 tiles away, and weakens enemy attacks."
    },
    [EUnitTypes.IMPALER]: {
      cardType: ECardType.SHOOTER,
      cardText: "Wields a powerful harpoon that can pull enemies close."
    },
    [EUnitTypes.NECROMANCER]: {
      cardType: ECardType.CASTER,
      cardText: "Dark caster who can create Phantoms from fallen units."
    },
    [EUnitTypes.PHANTOM]: {
      cardType: ECardType.SUMMONED,
      cardText: "A summoned phantom from beyond."
    },
    [EUnitTypes.VOIDMONK]: {
      cardType: ECardType.FIGHTER,
      cardText: "Strong melee fighter whose hits do splash damage."
    },
    [EUnitTypes.WRAITH]: {
      cardType: ECardType.SUPER,
      cardText: "A terror who gains max health and power by draining K.O.'d units."
    },

    [EUnitTypes.GUNNER]: {
      cardType: ECardType.SHOOTER,
      cardText: "Fires a shotgun, hitting up to 3 targets at range for 66% damage or 1 target for 100% damage"
    },
    [EUnitTypes.PALADIN]: {
      cardType: ECardType.SUPPORT,
      cardText: "Spellcaster who revives and heals allies. Provides 5% defense to nearby allys."
    },
    [EUnitTypes.GRENADIER]: {
      cardType: ECardType.CASTER,
      cardText: "Lobs explosives dealing 50% damage to all enemys around target."
    },
    [EUnitTypes.ANNIHILATOR]: {
      cardType: ECardType.SUPER,
      cardText: "Fragile rocketeer who temporarily removes 50% physical defense on targets."
    },
    [EUnitTypes.ENGINEER]: {
      cardType: ECardType.SUPPORT,
      cardText: "Can create a shield to protect allys and crystals. Additionally, gains 140% bonus from special tiles."
    },

    [EItems.SHINING_HELM]: {
      cardName: 'Shining Helm',
      cardType: ECardType.EQUIPMENT,
      cardText: "Adds 20% magical defense, and 10% max health."
    },
    [EItems.SUPERCHARGE]: {
      cardName: 'Scroll',
      cardType: ECardType.BUFF,
      cardText: "Multiplies an ally's attack power by 3 for one attack."
    },
    [EItems.RUNE_METAL]: {
      cardName: 'Runemetal',
      cardType: ECardType.EQUIPMENT,
      cardText: "Permanently increases an ally's power by 50%."
    },

    [EItems.DRAGON_SCALE]: {
      cardName: 'Dragonscale',
      cardType: ECardType.EQUIPMENT,
      cardText: "Adds 20% physical defense, and 10% max health."
    },
    [EItems.HEALING_POTION]: {
      cardName: 'Healing Potion',
      cardType: ECardType.CONSUMABLE,
      cardText: "Heals an ally for 1000 HP, or revives an ally with 100 HP."
    },
    [EItems.INFERNO]: {
      cardName: 'Inferno',
      cardType: ECardType.SPELL,
      cardText: "Damages all enemies in a 3x3 area and destroys knocked-out units."
    },

    [EItems.MANA_VIAL]: {
      cardName: 'Mana Vial',
      cardType: ECardType.CONSUMABLE,
      cardText: "Heals an ally for 1000 HP and increases max health by 50 HP."
    },
    [EItems.SOUL_HARVEST]: {
      cardName: 'Soul Harvest',
      cardType: ECardType.SPELL,
      cardText: "Drains health from enemies in a 3x3 area. Increases max health for all allies and revives knocked-out units."
    },
    [EItems.SOUL_STONE]: {
      cardName: 'Soulstone',
      cardType: ECardType.EQUIPMENT,
      cardText: "Doubles the effect of a unit's life leech and increases max health by 10%."
    },

    [EItems.DWARVERN_BREW]: {
      cardName: 'Dwarvern Brew',
      cardType: ECardType.CONSUMABLE,
      cardText: "Heals an ally for 1000 HP and temporarily adds 50% resistance."
    },
    [EItems.PULVERIZER]: {
      cardName: 'Pulverizer',
      cardType: ECardType.SPELL,
      cardText: "Targets 1 enemy destroying armor in process, or does 33% spash damage if target is a crystal."
    },
    
    [EUnitTypes.CRYSTAL]: {
      cardType: ECardType.VICTORY,
      cardText: "The main objective of the game. Destroy all enemy crystals to win."
    },

    [EUnitTypes.CRYSTAL_SMALL]: {
      cardType: ECardType.VICTORY,
      cardText: "The main objective of the game. Destroy all enemy crystals to win."
    },
    
    [EUnitTypes.CRYSTAL_BIG]: {
      cardType: ECardType.VICTORY,
      cardText: "The main objective of the game. Destroy all enemy crystals to win."
    },

  };

  return unitMap[unit];
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

// Used to remove any visible unit cards from a mobile long press action
export function visibleUnitCardCheck(context: GameScene): void {
  if (context.visibleUnitCard) {
    if (context.visibleUnitCard instanceof Unit || context.visibleUnitCard instanceof Crystal) {
      context.visibleUnitCard.unitCard?.setVisible(false);
    }
  }
}

export function generateFourDigitId(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

export function useAnimation(image: GameObjects.Image, scale = 2): void {
  image.scene.tweens.add({
    targets: image,
    scale,
    alpha: 0,
    duration: 1000,
    onComplete: () => {
      image.destroy();
    }
  });
}

export function textAnimationSizeIncrease(text: GameObjects.Text, scale = 2): Promise<void> {
  return new Promise((resolve) => {
    text.scene.tweens.add({
      targets: text,
      scale,
      alpha: 50,
      duration: 1000,
      onComplete: () => {
        text.destroy();
        resolve();
      }
    });
  });
}

export function textAnimationFadeOut(text: GameObjects.Text, duration = 1000): Promise<void> {
  return new Promise((resolve) => {
    text.scene.tweens.add({
      targets: text,
      alpha: 0,
      duration,
      ease: 'Linear',
      onComplete: () => {
        text.destroy();
        resolve();
      }
    });
  });
}

export function gameListFadeOutText(context: UIScene | GameScene, x: number, y: number, message: string): Phaser.GameObjects.Text {
  return context.add.text(x, y, message, {
    fontFamily: "proLight",
    fontSize: 60,
    color: '#fffb00'
  }).setDepth(9999);
}

export function roundToFive(num: number): number {
  return Math.round(num / 5) * 5;
}