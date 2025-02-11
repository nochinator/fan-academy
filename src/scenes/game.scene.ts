import { Client, Room } from "colyseus.js";
import { createGameAssets, loadGameAssets } from "./gameSceneUtils/gameAssets";
import { createGameBoardUI, loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenu.UI";
import { createBoardGameTiles, loadGameBoardTiles } from "./gameSceneUtils/gameBoardTiles.";
import calculateCenterPoints from "../utils/boardCalculations";
import { connectToGameLobby } from "../lib/colyseusLobbyRoom";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client | undefined;
  userId: string | undefined;
  gameListContainer: any; // REVIEW:
  currentRoom: Room | undefined;

  constructor() {
    super({ key: 'GameScene' });
    this.colyseusClient = new Client("ws://localhost:3003"); // TODO: env var
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
    calculateCenterPoints(); // REVIEW:
    await createGameMenuUI(this); // generates background menu and game list
    await createGameBoardUI(this); // generates the game board
    createBoardGameTiles(this);
    createGameAssets(this);
    // REVIEW: theoretically we select the first game on the list and show it
  }

  update() {

  }
}
