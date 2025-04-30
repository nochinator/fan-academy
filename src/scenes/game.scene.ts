import { Client, Room } from "colyseus.js";
import { GameController } from "../classes/gameController";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { Coordinates, IGame, IPlayerData, IPlayerState } from "../interfaces/gameInterface";
import { calculateAllCenterPoints } from "../utils/boardCalculations";
import { loadGameAssets } from "./gameSceneUtils/gameAssets";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";

export default class GameScene extends Phaser.Scene {
  userId!: string;
  colyseusClient!: Client;
  centerPoints: Coordinates[];

  currentRoom!: Room;
  currentGame!: IGame;
  currentTurnAction: number | undefined;
  currentGameContainer: Phaser.GameObjects.Container | undefined;

  activeUnit: Hero | Item |  undefined;

  gameController: GameController | undefined;

  activePlayer: string | undefined;
  isPlayerOne: boolean | undefined;
  opponentId!: string;

  player1: IPlayerState | undefined;
  player2: IPlayerState | undefined;

  constructor() {
    super({ key: 'GameScene' });
    this.centerPoints = calculateAllCenterPoints();
  }

  init(data: {
    userId: string,
    colyseusClient: Client,
    currentGame: IGame,
    currentRoom: Room,
  }) {
    this.currentGameContainer = this.add.container(0, 0);
    this.userId = data.userId;
    this.colyseusClient = data.colyseusClient;
    this.currentGame = data.currentGame;
    this.currentRoom = data.currentRoom;
    const opponent = data.currentGame.players.find((p: IPlayerData) => data.userId !== p.userData._id);
    this.opponentId = opponent!.userData._id;

    // Updating GameScene properties
    this.activePlayer =  this.currentGame.activePlayer.toString();
    this.isPlayerOne = this.currentGame?.players[0].userData._id === this.userId;
    this.currentTurnAction = 1;
  }

  preload() {
    loadGameBoardUI(this);
    loadGameAssets(this);
  }

  create() {
    this.gameController = new GameController(this);
  }
};
