import GameScene from "../scenes/game.scene";
import { Board } from "./board";
import { PlayerHealthBar } from "./playerHealthBar";

export class GameUI {
  itemRack: Phaser.GameObjects.Image;
  playerOneBanner: Phaser.GameObjects.Image;
  playerTwoBanner: Phaser.GameObjects.Image;
  playerOnePortrait: Phaser.GameObjects.Image;
  playerTwoPortrait: Phaser.GameObjects.Image;
  vsBanner: Phaser.GameObjects.Image;
  playerOneHpBar: PlayerHealthBar;
  playerTwoHpBar: PlayerHealthBar;
  constructor(context: GameScene, board: Board) {
    // Game map
    const gameMap = context.add.image(0, 0, 'gameBoard').setOrigin(0);
    gameMap.x = 1434 - gameMap.width - 14;
    gameMap.y += 14;

    // Item rack
    this.itemRack = context.add.image(0, 0, 'itemRack').setOrigin(0.5).setPosition(900, 736).setScale(0.9);

    // Top banner and health bars TODO:
    this.playerOneBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(705, 80).setFlipX(true).setTint(0x3399ff); // TODO: add colors
    this.playerTwoBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(1095, 80).setTint(0x990000);

    this.playerOnePortrait = context.add.image(0, 0, 'playerOnePortrait').setOrigin(0.5).setPosition(600, 73).setScale(0.3).setDepth(1);
    this.playerTwoPortrait = context.add.image(0, 0, 'playerTwoPortrait').setOrigin(0.5).setPosition(1200, 73).setScale(0.3).setFlipX(true).setDepth(1);

    this.playerOneHpBar = new PlayerHealthBar(context, board, 1, 0, 0);
    this.playerTwoHpBar = new PlayerHealthBar(context, board, 2, 0, 0);

    this.vsBanner = context.add.image(0, 0, 'vsBanner').setOrigin(0.5).setPosition(900, 75);
  }
}