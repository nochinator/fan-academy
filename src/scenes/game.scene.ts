import { Client, Room } from "colyseus.js";
import getRandomElement from "../lib/getRandomElement";
import { startGame } from "../lib/colyseusStartGame";
import calculateCenterPoints from "../utils/boardCalculations";

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
    // const mapArray = ['map_01.png', 'map_02.png', 'map_03.png', 'map_04.png', 'map_05.png', 'map_06.png'];
    // const map = getRandomElement(mapArray);
    // this.load.image('gameMap', '/assets/images/maps/' + map );
    const gameBoard = this.load.image('gameBoard', '/assets/images/maps/gameBoard.png');

    const councilArray = ['archer', 'cleric', 'fighter', 'ninja', 'wizard'];
    const darkElvesArray = ['heretic', 'impaler', 'necro', 'phantom', 'voidmonk', 'wraith'];

    // TODO: a check should be made to see if both factions are needed
    councilArray.forEach( asset => { this.load.image(asset, `/assets/images/characters/council/${asset}.png`);
    });
    darkElvesArray.forEach( asset => { this.load.image(asset, `/assets/images/characters/darkElves/${asset}.png`);
    });
  }

  create() {
    const bg = this.add.image(0, 0, 'mainMenuBg').setOrigin(0, 0);

    const gameMap = this.add.image(0, 0, 'gameBoard').setOrigin(0);
    gameMap.x = bg.width - gameMap.width - 14;
    gameMap.y += 14;

    // test
    const impaler = this.add.image(923, 587, 'impaler').setOrigin(0.5).setDepth(10).setInteractive();
    this.input.setDraggable(impaler);

    impaler.on('drag', (_: any, dragX: number, dragY: number) => {
      impaler.x = dragX;
      impaler.y = dragY;
    });

    impaler.on('dragend', (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      impaler.x = 500;
      impaler.y = 180;
    });
    // this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    //   // Log the mouse coordinates
    //   console.log(`Mouse coordinates: x=${pointer.x}, y=${pointer.y}`);
    // });

    const centerPoints = calculateCenterPoints();

    impaler.x = centerPoints[44].x;
    impaler.y = centerPoints[44].y;
    startGame(this.colyseusClient);
  }
}