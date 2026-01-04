import { IUnitData, IItemData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { getCurrentPlayer } from "../utils/playerUtils";

export class Deck {
  context: GameScene;
  deck: (IUnitData | IItemData)[];
  constructor(context: GameScene) {
    this.context = context;
    this.deck = [...getCurrentPlayer(context).factionData.unitsInDeck]; // need to decouple from factionData to avoid issues when resetting the turn
  }

  getDeckSize(): number {
    return this.deck.length;
  }

  getDeck() {
    return this.deck;
  }

  removeFromDeck(amount: number): (IUnitData | IItemData)[] {
    return this.deck.splice(0, amount);
  }

  addToDeck(unit: IUnitData | IItemData): (IUnitData | IItemData)[] {
    this.deck.push(unit);
    return this.deck;
  }
}