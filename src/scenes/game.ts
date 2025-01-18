import { Client, Room } from "colyseus.js";
import getRandomElement from "../lib/getRandomElement";
import { startGame } from "../lib/colyseusStartGame";

export default class GameScene extends Phaser.Scene {
  private colyseusClient: Client;
  private room: Room | null;

  constructor() {
    super({ key: 'GameScene' });
    this.colyseusClient = new Client("ws://localhost:3003"); // TODO: env var
    this.room = null;
  }

  init() {}

  preload() {
    this.loadImages();
  }

  loadImages() {
    const mapArray = ['map_01.png', 'map_02.png', 'map_03.png', 'map_04.png', 'map_05.png', 'map_06.png'];
    const map = getRandomElement(mapArray);
    this.load.image('gameMap', '/assets/images/maps/' + map );
  }

  create() {
    const bg = this.add.image(0, 0, 'mainMenuBg').setOrigin(0, 0);

    const gameMap = this.add.image(0, 0, 'gameMap').setOrigin(0);
    gameMap.x = bg.width - gameMap.width - 14;
    gameMap.y += 14;

    startGame(this.colyseusClient);
  }
}