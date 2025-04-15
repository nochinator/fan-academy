import GameScene from "../scenes/game.scene";
import { isHero } from "../utils/deckUtils";
import { Board } from "./board";
import { Deck } from "./deck";
import { Hand } from "./hand";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export class GameController {
  context: GameScene;
  board: Board;
  hand: Hand;
  deck: Deck;
  constructor(context: GameScene, board: Board, hand: Hand, deck: Deck) {
    this.context = context;
    this.board = board;
    this.hand = hand;
    this.deck = deck;
  }

  onHeroClicked(hero: Hero) {
    console.log(`A hero ${hero.boardPosition} has been clicked`);
    if (hero.boardPosition > 44) this.board.highlightSpawns(this.context.isPlayerOne!);

    if (hero.boardPosition < 45) {
      this.board.showEnemyTargets(hero);
      this.board.showFriendlyTargets(hero);
      this.board.showMovementArea(hero);
    }
  }

  onItemClicked(item: Item) {
    console.log(`An item ${item.unitId} has been clicked`);
    this.board.showFriendlyTargets(item);
  }

  onTileClicked(tile: Tile) {
    console.log(`A tile ${tile.tileType} has been clicked`);
  }

  /**
   * ACTIONS
   */
  spawnHero(tile: Tile): void {
    // Move hero to right spawn tile
    // Remove hero from hand
    // Add action to turn action list
    // Remove a slice from the action pie
    // Make pie interactive
    //  Clicking in the pie to reset the turn overrides currentTurn with the last turn from the turns array
    const hero = this.context.activeUnit;
    if (!hero || !isHero(hero)) {
      console.log('No active hero when trying to spawn a hero');
      return;
    }
    this.hand.removeFromHand(hero);
    hero.boardPosition = tile.boardPosition;  // TODO: update boardposition
    hero.x = tile.x;
    hero.y = tile.y;
    tile.setOccupied(true);
    tile.hero = hero.getHeroData();
    this.context.activeUnit = undefined; // FIXME: THIS DOESNT WORK, NEED A BETTER WAY OF UPDATING
    console.log('All spawnactions done');
    console.log('HAND', this.hand);
    console.log('TILE', tile);
  }

  moveHero(tile: Tile): void {

  }

  aoeSpell(tile: Tile): void {

  }
}