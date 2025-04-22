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
  lastTurnState: IGameState;

  constructor(context: GameScene) {
    this.context = context;
    this.game = context.currentGame!;
    const gameState = this.game.gameState[this.game.gameState.length - 1];
    this.lastTurnState =  gameState[gameState.length - 1];
    this.gameUI = new GameUI(context); // TODO: add depth to UI and board assets
    this.board = new Board(context, this.lastTurnState.boardState);
    context.player1 = this.lastTurnState.player1;
    context.player2 = this.lastTurnState.player2;

    this.deck  = new Deck(context); // FIXME: sometimes door instantiates before deck somehow
    this.context = context;
    this.hand = new Hand(context);
    this.actionPie = new ActionPie(context);
    this.turnButton = new TurnButton(context);
    this.door = new Door(context);
  }

  async resetTurn() {
    createGameAssets(this.context);
  }

  getDeck() {
    return this.deck.getDeck();
  }

  drawUnits() {
    const drawAmount = 6 - this.hand.getHandSize();

    if (this.deck.getDeckSize() === 0 || drawAmount === 0) return;

    const drawnUnits = this.deck.removeFromDeck(drawAmount); // IHero IItem

    this.hand.addToHand(drawnUnits);

    // Add action to turn state // FIXME: there is already a function for adding actions, DRY
    const { player, opponent } = getPlayersKey(this.context);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData()
      }
    };
    const opponentState = this.context[opponent];
    this.game.currentState.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        action: EAction.DRAW,
        actionNumber: 6 // REVIEW: always 6?
      },
      boardState: this.board.getBoardState()
    });
  }

  endOfTurnActions() {
    // Refresh actionPie, draw units and update door banner
    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();

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
    // Add action to current state
    this.addAction(EAction.SPAWN, hero);
    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(this.context.currentTurnAction!++); // TODO: add turn action counter
  }

  addAction(action: EAction, activeUnit: Hero | Item, targetUnit?: Hero | Item) {
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
        activeUnit: activeUnit.exportData(),
        targetUnit: targetUnit ? targetUnit.exportData() : activeUnit.exportData(),
        action,
        actionNumber: this.context.currentTurnAction!
      },
      boardState: this.board.getBoardState()
    });
  }

  moveHero(tile: Tile): void {

  }

  aoeSpell(tile: Tile): void {

  }
}