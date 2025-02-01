import { Client, Room } from "colyseus.js";
import { createGameAssets, loadGameAssets } from "./gameSceneUtils/gameAssets";
import { createGameBoardUI, loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameMenuUI, createGameMenuUI } from "./gameSceneUtils/gameMenu.UI";

export default class GameScene extends Phaser.Scene {
  colyseusClient: Client | undefined;
  room: Room | undefined;
  userId: string | undefined;
  gameList: string | undefined;

  constructor() {
    super({ key: 'GameScene' });

    this.room = undefined;
    this.userId = undefined;
    this.gameList = undefined;
  }

  init(data: {
    userId: string,
    colyseusClient: Client
  }) {
    this.userId = data.userId;
    this.colyseusClient = data.colyseusClient;
    console.log('datauserid', data.userId);
  }

  preload() {
    loadGameMenuUI(this);
    loadGameBoardUI(this);
    loadGameAssets(this);
  }

  async create() {
    await createGameMenuUI(this); // generates background menu and game list
    await createGameBoardUI(this); // generates the game board
    createGameAssets(this);
  }
}
