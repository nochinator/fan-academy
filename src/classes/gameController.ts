import { sendTurnMessage } from "../colyseus/colyseusGameRoom";
import { EActionClass, EActionType, EGameStatus, EHeroes, ETiles } from "../enums/gameEnums";
import { IGame, IGameState, IPlayerState, IUserData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { forcedMoveAnimation, getActionClass, getNewPositionAfterForce, isEnemySpawn } from "../utils/gameUtils";
import { deselectUnit, getPlayersKey } from "../utils/playerUtils";
import { ActionPie } from "./actionPie";
import { Board } from "./board";
import { Deck } from "./deck";
import { Door } from "./door";
import { GameUI } from "./gameUI";
import { Hand } from "./hand";
import { Hero } from "./hero";
import { Item } from "./item";
import { RematchButton } from "./rematchButton";
import { Tile } from "./tile";
import { TurnButton } from "./turnButton";
import { TurnWarningPopup } from "./turnPopup";

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
  turnPopup: TurnWarningPopup;
  rematchButton: RematchButton;
  lastTurnState: IGameState;
  currentTurn: IGameState[];

  phantomCounter: number = 0; // REVIEW:

  playerData: IUserData[];

  constructor(context: GameScene) {
    this.context = context;
    this.game = context.currentGame!;
    this.lastTurnState =  context.currentGame.previousTurn[context.currentGame.previousTurn.length - 1]; // REVIEW:
    this.board = new Board(context, this.lastTurnState.boardState);

    this.playerData = context.currentGame.players.map(player => { return player.userData;});
    this.gameUI = new GameUI(context, this.board, this.playerData);
    context.player1 = this.lastTurnState.player1;
    context.player2 = this.lastTurnState.player2;

    this.deck  = new Deck(context);
    this.hand = new Hand(context);
    this.actionPie = new ActionPie(context);

    this.turnButton = new TurnButton(context);
    this.turnPopup = new TurnWarningPopup(context);

    this.rematchButton = new RematchButton(context).setVisible(false);

    if (this.game.status === EGameStatus.FINISHED) {
      this.rematchButton.setVisible(true);
      this.turnButton.buttonImage.setVisible(false);
    }

    if (context.activePlayer !== context.userId) this.turnButton.buttonImage.setVisible(false);

    this.door = new Door(context);

    this.currentTurn = [];
  }

  async resetTurn() {
    this.context.scene.restart();
  }

  async handleGameOver(): Promise<void> {
    sendTurnMessage(this.context.currentRoom, this.currentTurn, this.context.opponentId, ++this.context.turnNumber!, this.context.gameOver);

    this.context.activePlayer = undefined;

    console.log('GAME ENDS! THE WINNER IS', this.context.gameOver?.winner);
  }

  getDeck() {
    return this.deck.getDeck();
  }

  drawUnits() {
    const drawAmount = 6 - this.hand.getHandSize();

    if (this.deck.getDeckSize() === 0 || drawAmount === 0) return;

    const drawnUnits = this.deck.removeFromDeck(drawAmount); // IHero IItem

    this.hand.addToHand(drawnUnits);

    // Add action to turn state
    const { player, opponent } = getPlayersKey(this.context);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData(),
        unitsInDeck: this.deck.getDeck()
      }
    };
    const opponentState = this.context[opponent];
    this.currentTurn.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        actionClass: EActionClass.AUTO,
        action: EActionType.DRAW

      },
      boardState: this.board.getBoardState()
    });
  }

  async removeKOUnits() {
    // Remove KO'd units from the board
    const unitsToRemove: Hero[] = [];

    this.board.units.forEach(unit => {
      if (unit.isKO) {
        if (unit.lastBreath) unitsToRemove.push(unit);
        if (!unit.lastBreath) {
          unit.lastBreath = true;
          unit.updateTileData();
        }
      }
    });

    if (unitsToRemove.length) {
      const animation = (hero: Hero): Promise<void> => {
        return new Promise((resolve) => {
          this.context.tweens.add({
            targets: hero,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
              hero.removeFromGame(true);
              console.log('Unit removed from board!', hero);
              resolve();
            }
          });
        });
      };

      await Promise.all(unitsToRemove.map(unit => {
        return animation.call(this.context, unit);
      }));
    }

    this.addActionToState(EActionType.REMOVE_UNITS); // this step needs to happen every turn in order to update the tiles
  }

  hasActionsLeft(): boolean {
    if (this.context.turnNumber === 0 && this.context.currentTurnAction! < 4) return true;
    if (this.context.currentTurnAction! < 6) return true;
    return false;
  }

  async endOfTurnActions(): Promise<void> {
    // If a unit was currently selected, de-select it
    if (this.context.activeUnit) deselectUnit(this.context);
    // Refresh actionPie, draw units and update door banner
    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();

    this.context.activePlayer = this.context.opponentId;
    this.context.turnNumber!++;

    sendTurnMessage(this.context.currentRoom, this.currentTurn, this.context.opponentId, this.context.turnNumber!);
  }

  onHeroClicked(hero: Hero) {
    console.log(`A hero in position ${hero.boardPosition} has been clicked`);
    if (hero.boardPosition > 44) this.board.highlightSpawns(hero.unitType);

    if (hero.boardPosition < 45) {
      this.board.highlightEnemyTargets(hero);
      this.board.highlightFriendlyTargets(hero);
      this.board.highlightMovementArea(hero);

      if (hero.unitType === EHeroes.NINJA || hero.getTile().tileType === ETiles.TELEPORTER) this.board.highlightTeleportOptions(hero);
    }
  }

  onItemClicked(item: Item) {
    console.log(`An item ${item.unitId} has been clicked`);
    if (item.dealsDamage) {
      this.board.highlightAllBoard();
    } else {
      this.board.highlightEquipmentTargets(item);
    }
  }

  onTileClicked(tile: Tile) {
    console.log(`A tile ${tile.tileType} has been clicked`);
  }

  afterAction(actionType: EActionType, activePosition: number, targetPosition?: number): void {
    // Add action to current state
    this.addActionToState(actionType, activePosition, targetPosition);

    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(this.context.currentTurnAction!++);
    // Deselect unit and clear highlights
    if (this.context.activeUnit) deselectUnit(this.context);
  }

  addActionToState(action: EActionType, actorPosition?: number, targetPosition?: number): void {
    const { player, opponent } = getPlayersKey(this.context);

    const actionClass = getActionClass(action);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData(),
        unitsInDeck: this.deck.getDeck()
      }
    };

    const opponentState = this.context[opponent];
    // Add action to current turn state
    this.currentTurn.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        actorPosition,
        targetPosition: targetPosition ? targetPosition : actorPosition,
        action,
        actionClass
      },
      boardState: this.board.getBoardState()
    });

    // Check if the game is over
    if (this.context.gameOver) this.handleGameOver();
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
      console.error('pushEnemy() Cant push enemy out of the map');
      return;
    }

    const targetNewTile = this.board.getTileFromCoordinates(newPosition.row, newPosition.col);
    if (!targetNewTile) {
      console.error('pushEnemy() No destination tile found');
      return;
    }
    if (targetNewTile?.isOccupied()) {
      console.error('pushEnemy() Destination tile is occupied');
      return;
    }
    if (!isEnemySpawn(this.context, targetTile) && !target.isKO) {
      console.error(`pushEnemy() Can't push a non-KO'd enemy onto a friendly spawn`);
      return;
    }

    target.specialTileCheck(targetNewTile, targetTile);
    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
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
      console.error('pullEnemy() Destination tile is occupied');
      return;
    }

    target.specialTileCheck(targetNewTile, targetTile);
    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
    targetNewTile.hero = target.exportData();
    targetNewTile.setOccupied(true);
    targetTile.removeHero();
  }
}