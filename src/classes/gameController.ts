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
    this.hand = hand; // REVIEW: should the game controller have also the opponent's?
    this.deck = deck; // REVIEW: should the game controller have also the opponent's?
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
      this.board.highlightEnemyTargets(hero);
      this.board.highlightFriendlyTargets(hero);
      this.board.highlightMovementArea(hero);
    }
  }

  onItemClicked(item: Item) {
    console.log(`An item ${item.unitId} has been clicked`);
    this.board.highlightFriendlyTargets(item);
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
    // Flip image if player is player 2
    if (hero.belongsTo === 2) (hero.getByName('body') as Phaser.GameObjects.Image)?.setFlipX(true);
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
    // Remove highlight from tiles
    this.board.clearHighlights();
    // Add action to turn action list
    const player1 = this.context.isPlayerOne ? this.context.playerStateData! : this.context.opponentStateData!;
    const player2 = !this.context.isPlayerOne ? this.context.playerStateData! : this.context.opponentStateData!;

    this.game.currentState.push({
      player1,
      player2,
      action: {
        activeUnit: hero,
        targetUnit: hero,
        action: EAction.SPAWN,
        actionNumber: this.context.currentTurnAction!
      },
      boardState: this.board.getBoardState()
    });
    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(this.context.currentTurnAction!++); // TODO: add turn action counter
  }

  moveHero(tile: Tile): void {

  }

  aoeSpell(tile: Tile): void {

  }
}