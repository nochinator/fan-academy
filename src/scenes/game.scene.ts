import { Client, Room } from "colyseus.js";
import { loadGameAssets } from "./gameSceneUtils/gameAssets";
import { createGameBoardUI, loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenu.UI";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client;
  room: Room | undefined;
  userId: string | undefined;
  gameList: string | undefined;

  constructor() {
    super({ key: 'GameScene' });
    this.colyseusClient = new Client("ws://localhost:3003"); // TODO: env var
    this.room = undefined;
    this.userId = undefined;
    this.gameList = undefined;
  }

  init(data: { userId: string }) {
    this.userId = data.userId;
    console.log('datauserid', data.userId);
  }

  preload() {
    loadGameMenuUI(this);
    loadGameBoardUI(this);
    loadGameAssets(this);
  }

  async create() {
    await createGameMenuUI(this); // generates background menu and game list
    createGameBoardUI(this); // generates the game board
    // await startGame(this.colyseusClient, this.userId); // TODO: this will need the room id as well (or random uuid if not)
  }
}
