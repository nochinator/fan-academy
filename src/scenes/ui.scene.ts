import { Client, Room } from "colyseus.js";
import { loadGameMenuUI } from "./gameSceneUtils/gameMenuUI";
import { connectToGameLobby } from "../lib/colyseusLobbyRoom";
import { createGameList } from "./gameSceneUtils/gameList";

export default class UIScene extends Phaser.Scene {
  colyseusClient: Client;
  userId!: string;
  gameListContainer: Phaser.GameObjects.Container | undefined;

  currentRoom: Room | undefined; // repeated
  gameScene: Phaser.Scene | undefined;

  constructor() {
    super({ key: 'UIScene' });
    this.colyseusClient = new Client("ws://localhost:3003"); // TODO: env var
  }

  init(data: { userId: string, }) {
    this.userId = data.userId;
    console.log('datauserid', data.userId);
  }

  preload() {
    loadGameMenuUI(this);
  }

  async create() {
    connectToGameLobby(this.colyseusClient, this.userId, this);

    // UI background
    this.add.image(0, 0, 'uiBackground').setOrigin(0, 0);
    // Game list
    await createGameList(this);
    // Background game screen
    this.add.image(397, 15, 'createGame').setOrigin(0, 0).setScale(1.06, 1.2);
  }
}
