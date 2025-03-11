import { Client, Room } from "colyseus.js";
import { loadGameAssets } from "./gameSceneUtils/gameAssets";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenuUI";
import { loadGameBoardTiles } from "./gameSceneUtils/gameBoardTiles.";
import { calculateCenterPoints, Coordinates } from "../utils/boardCalculations";
import { connectToGameLobby } from "../lib/colyseusLobbyRoom";
import { IGame, IGameState, ITurnAction } from "../interfaces/gameInterface";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client | undefined;
  userId: string | undefined;
  gameListContainer: any; // REVIEW:
  currentRoom: Room | undefined;
  currentGame: IGame | undefined;
  currentTurn: IGameState | undefined;
  currentOpponent: string | undefined;
  activePlayer: string | undefined;
  centerPoints: Coordinates[];

  constructor() {
    super({ key: 'GameScene' });
    this.colyseusClient = new Client("ws://localhost:3003"); // TODO: env var
    this.centerPoints = [];
  }

  init(data: {
    userId: string,
    colyseusClient: Client
  }) {
    this.userId = data.userId;
    console.log('datauserid', data.userId);
  }

  preload() {
    loadGameMenuUI(this);
    loadGameBoardUI(this);
    loadGameBoardTiles(this);
    loadGameAssets(this);
  }

  async create() {
    // Connect to the colyseus lobby room
    connectToGameLobby(this.colyseusClient, this.userId, this);
    this.centerPoints = calculateCenterPoints(); // REVIEW:
    await createGameMenuUI(this); // generates background menu and game list
  }

  update() {

  }
}
