import { Client, Room } from "colyseus.js";
import { Crystal } from "../classes/crystal";
import { GameController } from "../classes/gameController";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { Coordinates, IGame, IGameOver, IPlayerData, IPlayerState } from "../interfaces/gameInterface";
import { calculateAllCenterPoints } from "../utils/boardCalculations";

export default class GameScene extends Phaser.Scene {
  userId!: string;
  colyseusClient!: Client;
  centerPoints: Coordinates[];

  currentRoom!: Room;
  currentGame!: IGame;
  currentTurnAction: number | undefined;
  turnNumber: number | undefined;

  activeUnit: Hero | Item |  undefined;

  gameController: GameController | undefined;

  activePlayer: string | undefined;
  isPlayerOne: boolean | undefined;
  opponentId!: string;

  player1: IPlayerState | undefined;
  player2: IPlayerState | undefined;

  gameOver: IGameOver | undefined;

  longPressStart: number | undefined;
  visibleUnitCard: Hero | Item | Crystal | undefined;

  triggerReplay = true;

  constructor() {
    super({ key: 'GameScene' });
    this.centerPoints = calculateAllCenterPoints();
  }

  init(data: {
    userId: string,
    colyseusClient: Client,
    currentGame: IGame,
    currentRoom: Room,
    triggerReplay?: boolean
  }) {
    this.userId = data.userId;
    this.colyseusClient = data.colyseusClient;
    this.turnNumber = data.currentGame.turnNumber;
    this.currentGame = data.currentGame;
    this.currentRoom = data.currentRoom;
    const opponent = data.currentGame.players.find((p: IPlayerData) => data.userId !== p.userData._id);
    this.opponentId = opponent!.userData._id;

    this.triggerReplay = data.triggerReplay ?? true;

    // Updating GameScene properties
    this.activePlayer =  this.currentGame.activePlayer.toString();
    this.isPlayerOne = this.currentGame?.players[0].userData._id === this.userId;
    this.currentTurnAction = this.turnNumber === 0 ? 3 : 1;
  }

  preload() {}

  create() {
    this.input.mouse!.disableContextMenu();
    this.gameController = new GameController(this);
    if (this.triggerReplay) this.gameController.replayTurn();
  }
};
