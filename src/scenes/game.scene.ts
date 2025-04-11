import { Client, Room } from "colyseus.js";
import { loadGameAssets } from "./gameSceneUtils/gameAssets";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenuUI";
import { loadGameBoardTiles } from "./gameSceneUtils/gameBoardTiles";
import { calculateAllCenterPoints } from "../utils/boardCalculations";
import { connectToGameLobby } from "../lib/colyseusLobbyRoom";
import { Coordinates, IGame, IGameState } from "../interfaces/gameInterface";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client | undefined;
  userId: string | undefined;
  activePlayer: string | undefined;
  centerPoints: Coordinates[] ;
  gameListContainer: any; // REVIEW:
  currentRoom: Room | undefined;
  currentGame: IGame | undefined;
  currentGameContainer: Phaser.GameObjects.Container | undefined;
  currentTurn: IGameState | undefined;
  currentOpponent: string | undefined;
  activeUnit: Hero | Item |  undefined;

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
    loadGameAssets(this);
  }

  async create() {
    // Connect to the colyseus lobby room
    connectToGameLobby(this.colyseusClient, this.userId, this);
    // Get all the center points
    this.centerPoints = calculateAllCenterPoints(); // REVIEW:
    // Create the background menu image and game list
    await createGameMenuUI(this);

    // this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    //   // Log the mouse coordinates
    //   console.log(`Mouse coordinates: x=${pointer.x}, y=${pointer.y}`);
    // });  // FIXME: remove after testing
  }

  update() {}
}
