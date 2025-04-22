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
import { IGame, IGameState, IPlayerState } from "../interfaces/gameInterface";
import { EAction } from "../enums/gameEnums";
import { createGameAssets } from "../scenes/gameSceneUtils/gameAssets";
import { sendTurnMessage } from "../lib/colyseusGameRoom";
import { getPlayersKey } from "../utils/playerUtils";

export class GameController {
  context: GameScene;
  game: IGame;
  gameUI: GameUI;
  board: Board;
  hand: Hand;
  deck: Deck;
  actionPie: ActionPie;
  door: Door;
  turnButton: TurnButton;

  constructor(context: GameScene, gameState: IGameState) {
    this.deck  = new Deck(context); // FIXME: sometimes door instantiates before deck somehow
    this.context = context;
    this.game = context.currentGame!;
    this.gameUI = new GameUI(context);
    this.board = new Board(context, gameState.boardState);
    this.hand = new Hand(context);
    this.actionPie = new ActionPie(context);
    this.turnButton = new TurnButton(context);
    this.door = new Door(context);
  }

  resetTurn() {
    this.game.currentState = this.game.lastTurnState;
    createGameAssets(this.context); // REVIEW: loop?
  }

  getDeck() {
    return this.deck.getDeck();
  }

  drawUnits() {
    const drawAmount = 6 - this.hand.getHandSize();
    if (this.deck.getDeckSize() === 0 || drawAmount === 0) return;

    const drawnUnits = this.deck.removeFromDeck(drawAmount); // IHero IItem

    this.hand.addToHand(drawnUnits);
  }

  endOfTurnActions() {
    // Refresh actionPie, draw units and update door banner
    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();
    // Generate data for the board, hand and deck // FIXME:

    sendTurnMessage(this.context.currentRoom, this.context.currentGame!.currentState, this.context.currentOpponent);
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
    hero.updatePosition(tile.boardPosition);
    // Update tile data
    tile.setOccupied(true);
    tile.hero = hero.exportData();
    // Remove active status from hero
    hero.isActive = false;
    this.context.activeUnit = undefined;
    // Remove highlight from tiles
    this.board.clearHighlights();
    // Assign player and opponent data to player1 and player2
    const { player, opponent } = getPlayersKey(this.context);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData()
      }
    };
    const opponentState = this.context[opponent];
    // Add action to turn state
    this.game.currentState.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        activeUnit: hero.exportData(),
        targetUnit: hero.exportData(),
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