import { Client, Room } from "colyseus.js";
import { loadGameAssets } from "./gameSceneUtils/gameAssets";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenuUI";
import { calculateAllCenterPoints } from "../utils/boardCalculations";
import { connectToGameLobby } from "../lib/colyseusLobbyRoom";
import { Coordinates, IGame, IPlayerState } from "../interfaces/gameInterface";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { GameController } from "../classes/gameController";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client | undefined;
  userId: string | undefined;
  centerPoints: Coordinates[] ;
  gameListContainer: Phaser.GameObjects.Container | undefined;

  currentRoom: Room | undefined;
  currentGame: IGame | undefined;
  currentTurnAction: number | undefined;
  currentGameContainer: Phaser.GameObjects.Container | undefined;

  currentOpponent: string | undefined;
  activeUnit: Hero | Item |  undefined;

  gameController: GameController | undefined;

  activePlayer: string | undefined;
  isPlayerOne: boolean | undefined;

  player1: IPlayerState | undefined;
  player2: IPlayerState | undefined;

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

  update() {} // WORKING ON SENDING THE TURN BUT THE MESSAGE EXCEEDS MAXPAYLOADSIZE
}
