import { Client, Room } from "colyseus.js";
import { loadGameMenuUI } from "./gameSceneUtils/gameMenuUI";
import { connectToGameLobby } from "../colyseus/colyseusLobbyRoom";
import { createGameList } from "./gameSceneUtils/gameList";
import { IGame } from "../interfaces/gameInterface";
import { getGameList } from "../queries/gameQueries";
import { HomeButton } from "../classes/homeButton";

export default class UIScene extends Phaser.Scene {
  colyseusClient: Client;
  lobbyRoom: Room | undefined;
  userId!: string;
  gameListContainer: Phaser.GameObjects.Container | undefined;
  gameList: IGame[] | undefined;

  currentRoom: Room | undefined; // repeated
  gameScene: Phaser.Scene | undefined;

  constructor() {
    super({ key: 'UIScene' });
    this.colyseusClient = new Client(`${import.meta.env.VITE_SOCKET}`);
  }

  async init(data: { userId: string, }) {
    this.userId = data.userId;
  }

  preload() {
    loadGameMenuUI(this);
  }

  async create() {
    this.lobbyRoom = await connectToGameLobby(this.colyseusClient, this.userId, this);

    this.gameList = await getGameList(this.userId);

    // UI background
    this.add.image(0, 0, 'uiBackground').setOrigin(0);
    // Add Home button
    new HomeButton(this);
    // Create the game list UI
    await createGameList(this);
    // Background game screen
    this.add.image(397, 15, 'gameBackground').setOrigin(0, 0).setScale(1.06, 1.2);
  }
}
