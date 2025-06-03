import { Archer, Cleric, DragonScale, HealingPotion, Inferno, Knight, Ninja, Wizard } from "../classes/council";
import { Crystal } from "../classes/crystal";
import { Impaler, ManaVial, Necromancer, Phantom, Priestess, SoulHarvest, SoulStone, VoidMonk, Wraith } from "../classes/elves";
import { Hero } from "../classes/hero";
import { Item, RuneMetal, ShiningHelm, SuperCharge } from "../classes/item";
import { Tile } from "../classes/tile";
import { EActionClass, EActionType, EHeroes, EItems, ETiles, EWinConditions } from "../enums/gameEnums";
import { Coordinates, ICrystal, IHero, IItem, IPlayerState } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

// Fisher-Yates shuffle algorithm
export function shuffleArray(array: (IHero | IItem)[]): (IHero | IItem)[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  array.forEach((unit, index) => {
    if (index < 6) {
      unit.boardPosition = 45 + index; // First 6 units get positions 45 to 50 on the board (the player's hand)
    } else {
      unit.boardPosition = 51; // Remaining units get 51 (deck, hidden)
    }
  });

  return array;
}

export function isHero(hero: IHero | IItem): hero is Hero {
  return hero.class === "hero";
}

export function isItem(item: IHero | IItem): item is Item {
  return item.class === "item";
}

export function isInHand(boardPosition: number): boolean {
  return boardPosition > 44 && boardPosition < 51;
}

export function belongsToPlayer(context: GameScene, unit: Hero | IHero | Item | IItem | Crystal | ICrystal): boolean {
  const playerNumber = context.isPlayerOne ? 1 : 2;
  return unit.belongsTo === playerNumber;
}

// Rounds a number to the nearest multiple of 5
export function roundToFive(amount: number): number {
  return Math.round(amount / 5) * 5;
}

export function getCoordinatesFromBoardPosition(boardPosition: number): {
  row: number,
  col: number
} {
  const cols = 9; // number of columns in the grid
  const row = Math.floor(boardPosition / cols);
  const col = boardPosition % cols;
  return {
    row,
    col
  };
}

export function getGridDistance(startRow: number, startColumn: number, targetRow: number, targetColumn: number): number {
  return Math.abs(startRow - targetRow) + Math.abs(startColumn - targetColumn);
}

export function createNewItem(context: GameScene, itemData: IItem): Item {
  const itemTypes: Record<EItems, () => Item> = {
    [EItems.SHINING_HELM]: () => new ShiningHelm(context, itemData),
    [EItems.SUPERCHARGE]: () => new SuperCharge(context, itemData),
    [EItems.RUNE_METAL]: () => new RuneMetal(context, itemData),

    [EItems.DRAGON_SCALE]: () => new DragonScale(context, itemData),
    [EItems.HEALING_POTION]: () => new HealingPotion(context, itemData),
    [EItems.INFERNO]: () => new Inferno(context, itemData),

    [EItems.MANA_VIAL]: () => new ManaVial(context, itemData),
    [EItems.SOUL_HARVEST]: () => new SoulHarvest(context, itemData),
    [EItems.SOUL_STONE]: () => new SoulStone(context, itemData)
  };

  const createItem = itemTypes[itemData.itemType];
  if (!createItem) console.error('Error creating item', itemData);
  return createItem();
}

export function createNewHero(context: GameScene, heroData: IHero): Hero {
  const heroTypes: Record<EHeroes, () => Hero> = {
    [EHeroes.ARCHER]: () => new Archer(context, heroData),
    [EHeroes.CLERIC]: () => new Cleric(context, heroData),
    [EHeroes.KNIGHT]: () => new Knight(context, heroData),
    [EHeroes.NINJA]: () => new Ninja(context, heroData),
    [EHeroes.WIZARD]: () => new Wizard(context, heroData),

    [EHeroes.PRIESTESS]: () => new Priestess(context, heroData),
    [EHeroes.IMPALER]: () => new Impaler(context, heroData),
    [EHeroes.NECROMANCER]: () => new Necromancer(context, heroData),
    [EHeroes.PHANTOM]: () => new Phantom(context, heroData),
    [EHeroes.VOIDMONK]: () => new VoidMonk(context, heroData),
    [EHeroes.WRAITH]: () => new Wraith(context, heroData)
  };

  if (EHeroes.WRAITH === heroData.unitType) console.log('Wraith', heroData.unitsConsumed);
  const createHero = heroTypes[heroData.unitType];
  if (!createHero) console.error('Error creating hero', heroData);
  return createHero();
}

export async function moveAnimation(context: GameScene, hero: Hero, targetTile: Tile): Promise<void> {
  // Stop user input until the animation finishes playing
  context.input.enabled = false;

  const unitImage: Phaser.GameObjects.Image = hero.getByName('body');

  // If the unit is moving backwards, flip the unit's image for the duration of the animation
  let temporaryFlip: boolean;
  if (hero.belongsTo === 1 &&  targetTile.x < hero.x) {
    unitImage.setFlipX(true);
    temporaryFlip = true;
  }

  if (hero.belongsTo === 2 &&  targetTile.x > hero.x ) {
    unitImage.setFlipX(false);
    temporaryFlip = true;
  }

  const animation = (hero: Hero, targetTile: Tile): Promise<void> => {
    return new Promise((resolve) => {
      context.tweens.add({
        targets: hero,
        x: targetTile.x,
        y: targetTile.y,
        duration: 300,
        ease: 'Linear',
        onComplete: () => {
          console.log('Move complete!');
          context.input.enabled = true;
          if (temporaryFlip) unitImage.setFlipX(!unitImage.flipX);
          resolve();
        }
      });
    });
  };

  await animation.call(context, hero, targetTile);
}

export async function forcedMoveAnimation(context: GameScene, hero: Hero, targetTile: Tile): Promise<void> {
  context.input.enabled = false;

  const animation = (hero: Hero, targetTile: Tile): Promise<void> => {
    return new Promise((resolve) => {
      context.tweens.add({
        targets: hero,
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

  await animation.call(context, hero, targetTile);
};

export function getNewPositionAfterForce(attackerRow: number, attackerCol: number, targetRow: number, targetCol: number, isPush: boolean) {
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

  return {
    row: targetRow + directionRow,
    col: targetCol + directionColumn
  };
}

export function getActionClass(action: EActionType): EActionClass {
  return [EActionType.PASS, EActionType.DRAW, EActionType.REMOVE_UNITS].includes(action) ? EActionClass.AUTO : EActionClass.USER;
}

export function getAOETiles(context: GameScene, targetTile: Tile): {
  enemyHeroTiles: Tile[],
  enemyCrystalTiles: Tile[]
} {
  const board = context.gameController?.board;
  if (!board) throw new Error('Inferno use() board not found');

  const areOfEffect = board.getAreaOfEffectTiles(targetTile);

  const enemyHeroTiles = areOfEffect?.filter(tile => tile.isEnemy(context.userId));

  const enemyCrystalTiles = areOfEffect?.filter(tile => tile.tileType === ETiles.CRYSTAL);

  return {
    enemyHeroTiles,
    enemyCrystalTiles
  };
}

export function isOnBoard(position: number): boolean {
  return position >= 0 && position <= 44;
}

export function canBeAttacked(context: GameScene, tile: Tile): boolean {
  let result = false;
  if (tile.hero && !belongsToPlayer(context, tile.hero)) result = true;
  if (tile.crystal && !belongsToPlayer(context, tile.crystal)) result = true;
  return result;
}

export function updateUnitsLeft(context: GameScene, hero: Hero): void {
  let affectedPlayer: IPlayerState | undefined;
  let otherPlayer: IPlayerState | undefined;

  if (hero.unitId.includes(context.player1!.playerId)) {
    affectedPlayer = context.player1;
    otherPlayer = context.player2;
  } else {
    affectedPlayer = context.player2;
    otherPlayer = context.player1;
  }

  if (!affectedPlayer || !otherPlayer) throw new Error('updateUnitsLeft() No players found');

  const unitsLeft = --affectedPlayer.factionData.unitsLeft;

  console.log('unitsLeft', unitsLeft);

  if (unitsLeft === 0) context.gameOver = {
    winCondition: EWinConditions.UNITS,
    winner: otherPlayer.playerId
  };
}

export function isEnemySpawn(context: GameScene, tile: Tile): boolean {
  return tile.tileType === ETiles.SPAWN && (context.isPlayerOne ? tile.col > 5 : tile.col < 5);
}