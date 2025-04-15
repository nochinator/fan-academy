import GameScene from "../scenes/game.scene";
import { isHero } from "../utils/deckUtils";
import { Board } from "./board";
import { Deck } from "./deck";
import { GameUI } from "./gameUI";
import { Hand } from "./hand";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export class GameController {
  context: GameScene;
  board: Board;
  hand: Hand;
  deck: Deck;
  gameUI: GameUI;
  constructor(context: GameScene, board: Board, hand: Hand, deck: Deck, gameUI: GameUI) {
    this.context = context;
    this.gameUI = gameUI;
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
    // Add action to turn action list
    // Remove a slice from the action pie
    // Make pie interactive
    // Clicking in the pie to reset the turn overrides currentTurn with the last turn from the turns array
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
    hero.isActive = false;
    this.context.activeUnit = undefined;
    console.log('All spawnactions done');
    console.log('HAND', this.hand);
    console.log('TILE', tile);
  }

  moveHero(tile: Tile): void {

  }

  aoeSpell(tile: Tile): void {

  }
}