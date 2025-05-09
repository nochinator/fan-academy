import { Archer, Cleric, Knight, Ninja, Wizard } from "../classes/council";
import { Priestess, Impaler, Necromancer, Phantom, Wraith, VoidMonk } from "../classes/elves";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { EHeroes } from "../enums/gameEnums";
import { IHero, IItem } from "../interfaces/gameInterface";
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

export function belongsToPlayer(context: GameScene, unit: Hero | Item): boolean {
  const playerNumber = context.isPlayerOne ? 1 : 2;
  return unit.belongsTo === playerNumber;
}

export function getGridDistance(startRow: number, startColumn: number, targetRow: number, targetColumn: number): number {
  return Math.abs(startRow - targetRow) + Math.abs(startColumn - targetColumn);
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

  const createHero = heroTypes[heroData.unitType];
  if (!createHero) console.error('Error creating hero', heroData);
  return createHero();
}