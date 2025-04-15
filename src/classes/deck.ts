import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

export class Deck {
  context: GameScene;
  deck: (IHero | IItem)[];
  constructor(context: GameScene, deckData: (IHero | IItem)[]) {
    this.deck = deckData;
    this.context = context;
  }
}