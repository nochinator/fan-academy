import { EAction } from "../enums/gameEnums";
import { IGame, IGameState, IPlayerState } from "../interfaces/gameInterface";
import { sendTurnMessage } from "../lib/colyseusGameRoom";
import GameScene from "../scenes/game.scene";
import { getNewPositionAfterForce, isHero, moveAnimation, forcedMoveAnimation } from "../utils/gameUtils";
import { deselectUnit, getPlayersKey } from "../utils/playerUtils";
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
    this.context.scene.restart();
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

  async removeKOUnits() {
    console.log('removeKOUnits this logs');
    // Remove KO'd units from the board
    const unitsToRemove: Hero[] = [];

    this.board.units.forEach(unit => {
      if (unit.isKO) {
        console.log('lastBreath', unit.lastBreath);
        if (unit.lastBreath) unitsToRemove.push(unit);
        if (!unit.lastBreath) {
          unit.lastBreath = true;
          unit.updateTileData();
        }
      }
    });

    const animation = (hero: Hero): Promise<void> => {
      return new Promise((resolve) => {
        this.context.tweens.add({
          targets: hero,
          alpha: 0,
          duration: 500,
          ease: 'Linear',
          onComplete: () => {
            hero.removeFromBoard();
            console.log('Unit removed from board!');
            console.log('Hero', hero);
            console.log('Tiles', this.board.tiles);
            resolve();
          }
        });
      });
    };

    await Promise.all(unitsToRemove.map(unit => {
      console.log('Unit board position', unit.boardPosition);
      return animation.call(this.context, unit);
    }));

    const lastAction = this.game.currentState[this.game.currentState.length - 1];
    lastAction.boardState = this.board.getBoardState();
  }

  async endOfTurnActions() {
    // Remove KO'd units
    await this.removeKOUnits();
    // If a unit was currently selected, de-select it
    if (this.context.activeUnit) deselectUnit(this.context);
    // Refresh actionPie, draw units and update door banner
    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();

    this.context.activePlayer = this.context.opponentId;

    sendTurnMessage(this.context.currentRoom, this.context.currentGame.currentState, this.context.opponentId);
  }

  onHeroClicked(hero: Hero) {
    console.log(`A hero in position ${hero.boardPosition} has been clicked`);
    if (hero.boardPosition > 44) this.board.highlightSpawns(this.context.isPlayerOne!);

    if (hero.boardPosition < 45) {
      this.board.highlightHeroEnemyTargets(hero);
      this.board.highlighHerotFriendlyTargets(hero);
      this.board.highlightMovementArea(hero);
    }
  }

  onItemClicked(item: Item) {
    console.log(`An item ${item.unitId} has been clicked`);
    // this.board.highlighHerotFriendlyTargets(item); // TODO: create equivalent for items
  }

  onTileClicked(tile: Tile) {
    console.log(`A tile ${tile.tileType} has been clicked`);
  }

  afterAction(actionType: EAction, activeUnit: Hero | Item, targetUnit?: Hero | Item): void {
    console.log('After Action Unit', targetUnit ? targetUnit : activeUnit);
    // Add action to current state
    this.addActionToState(actionType, activeUnit, targetUnit);
    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(this.context.currentTurnAction!++);
    // Deselect unit and clear highlights
    deselectUnit(this.context);
  }

  addActionToState(action: EAction, activeUnit: Hero | Item, targetUnit?: Hero | Item): void {
    console.log('addActionToState logs');
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

  /**
   *
   *
   * ACTIONS
   *
   *
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
    hero.updateTileData();

    this.afterAction(EAction.SPAWN, hero);
  }

  async moveHero(targetTile: Tile): Promise<void> {
    const hero = this.context.activeUnit;
    if (!hero || !isHero(hero)) return;

    const startTile = this.board.getTileFromBoardPosition(hero.boardPosition);
    if (!startTile) return;

    await moveAnimation(this.context, hero, targetTile);

    hero.updatePosition(targetTile.boardPosition);
    targetTile.hero = hero.exportData();
    targetTile.setOccupied(true);
    startTile.removeHero();

    this.afterAction(EAction.MOVE, hero);
  }

  async pushEnemy(attacker: Hero, target: Hero): Promise<void> {
    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pushEnemy() no attacker or target board position');
      return;
    }

    const newPosition = getNewPositionAfterForce(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col, true);

    // If the tile is beyond the boundaries of the map, ignore
    if (newPosition.row > 4 || newPosition.col > 8) {
      console.log('pushEnemy() Cant push enemy out of the map');
      return;
    }

    const targetNewTile = this.board.getTileFromCoordinates(newPosition.row, newPosition.col);
    if (!targetNewTile) {
      console.error('pushEnemy() No destination tile found');
      return;
    }
    if (targetNewTile?.isOccupied()) {
      console.log('pushEnemy() Destination tile is occupied');
      return;
    }

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile.boardPosition);
    targetNewTile.hero = target.exportData();
    targetNewTile.setOccupied(true);
    targetTile.removeHero();
  }

  async pullEnemy(attacker: Hero, target: Hero): Promise<void> {
    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pullEnemy() no attacker or target board position');
      return;
    }

    const newPosition = getNewPositionAfterForce(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col, false);

    const targetNewTile = this.board.getTileFromCoordinates(newPosition.row, newPosition.col);
    if (!targetNewTile) {
      console.error('pullEnemy() No destination tile found');
      return;
    }
    if (targetNewTile?.isOccupied()) {
      console.log('pullEnemy() Destination tile is occupied');
      return;
    }

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile.boardPosition);
    targetNewTile.hero = target.exportData();
    targetNewTile.setOccupied(true);
    targetTile.removeHero();
  }

  aoeSpell(tile: Tile): void {

  }
}