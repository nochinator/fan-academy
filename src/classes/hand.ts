import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { isHero, isItem } from "../utils/deckUtils";
import { Hero } from "./hero";
import { Item } from "./item";

export class Hand {
  context: GameScene;
  hand: (IHero | IItem)[];
  constructor(context: GameScene) {
    this.context = context;
    this.hand = context.playerStateData?.factionData.unitsInHand ?? [];

    this.hand?.forEach(unit => {
      if (isHero(unit)) new Hero(context, unit);

      if (isItem(unit)) new Item(context, unit);
    });
  }

  getHand() {
    return this.hand;
  }

  addToHand(units: (IHero | IItem)[]): void {
    const defaultPositions = [45, 46, 47, 48, 49];

    let previousIndex = -1;
    defaultPositions.forEach(element => {
      const matchIndex = this.hand.findIndex((unit) => unit.boardPosition === element);

      if (matchIndex !== -1) {
        previousIndex = matchIndex;
      } else {
        const newUnit = units.shift();
        if (newUnit) {
          newUnit.boardPosition = element;
          this.hand.splice(++previousIndex, 0, newUnit);
        }
      }
    });
  }

  // updateUnitsCoordinates(): void {
  //   this.hand.forEach(unit => {
  //     unit.
  //   })
  // }

  removeFromHand(unitToRemove: IHero | IItem): void {
    const index = this.hand.findIndex(unit => unit.unitId === unitToRemove.unitId);
    if (index !== -1) this.hand.splice(index, 1);// can't use filter because creating a new array breaks the reference with factionData
  }
}
