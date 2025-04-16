import GameScene from "../scenes/game.scene";
import { isHero } from "../utils/deckUtils";
import { ActionPie } from "./actionPie";
import { Board } from "./board";
import { Deck } from "./deck";
import { Door } from "./door";
import { GameUI } from "./gameUI";
import { Hand } from "./hand";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";
import { TurnButton } from "./turnButton";
import { IGame } from "../interfaces/gameInterface";
import { EAction } from "../enums/gameEnums";
import { createGameAssets } from "../scenes/gameSceneUtils/gameAssets";

export class GameController {
  context: GameScene;
  board: Board;
  hand: Hand;
  deck: Deck;
  gameUI: GameUI;
  actionPie: ActionPie;
  door: Door;
  turnButton: TurnButton;
  game: IGame;
  constructor(context: GameScene, board: Board, hand: Hand, deck: Deck, gameUI: GameUI) {
    this.context = context;
    this.gameUI = gameUI;
    this.board = board;
    this.hand = hand;
    this.deck = deck;
    this.actionPie = new ActionPie(context);
    this.door = new Door(context);
    this.turnButton = new TurnButton(context);
    this.game = context.currentGame!;
  }

  resetTurn() {
    this.game.currentState = this.game.lastTurnState;
    createGameAssets(this.context); // REVIEW: loop?
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
    const hero = this.context.activeUnit;
    if (!hero || !isHero(hero)) {
      console.log('No active hero when trying to spawn a hero');
      return;
    }

    // Remove hero from hand
    this.hand.removeFromHand(hero);
    // Position hero on the board
    hero.boardPosition = tile.boardPosition;
    hero.x = tile.x;
    hero.y = tile.y + 15;
    // Update tile data
    tile.setOccupied(true);
    tile.hero = hero.getHeroData();
    // Remove active status from hero
    hero.isActive = false;
    this.context.activeUnit = undefined;
    // Add action to turn action list
    this.game.gameState.push({
      turn: this.game.currentTurn,
      player1: this.game.currentState.player1,
      player2: this.game.currentState.player2,
      action: {
        activeUnit: hero,
        targetUnit: hero,
        action: EAction.SPAWN,
        actionNumber: 1 // TODO: add turn action counter to context
      },
      boardState: this.game.currentState.boardState
    });
    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(1); // TODO: add turn action counter
    // Make pie interactive
    // Clicking in the pie to reset the turn overrides currentTurn with the last turn from the turns array //
  }

  moveHero(tile: Tile): void {

  }

  aoeSpell(tile: Tile): void {

  }
}