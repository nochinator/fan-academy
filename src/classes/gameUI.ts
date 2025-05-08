import GameScene from "../scenes/game.scene";

export class GameUI {
  constructor(context: GameScene) {
    // Game map
    const gameMap = context.add.image(0, 0, 'gameBoard').setOrigin(0);
    gameMap.x = 1434 - gameMap.width - 14;
    gameMap.y += 14;
    // context.currentGameContainer?.add(gameMap);

    // Item rack
    const itemRack = context.add.image(0, 0, 'itemRack').setOrigin(0.5).setPosition(900, 736).setScale(0.9);
    // context.currentGameContainer?.add(itemRack);

    // Top banner and health bars TODO:
    const playerOneBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(705, 80).setFlipX(true).setTint(0x3399ff); // TODO: add colors
    // context.currentGameContainer?.add(playerOneBanner);
    const playerTwoBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(1095, 80).setTint(0x990000);
    // context.currentGameContainer?.add(playerTwoBanner);
    const vsBanner = context.add.image(0, 0, 'vsBanner').setOrigin(0.5).setPosition(900, 75);
    // context.currentGameContainer?.add(vsBanner);
    const playerOnePortrait = context.add.image(0, 0, 'playerOnePortrait').setOrigin(0.5).setPosition(600, 73).setScale(0.25).setDepth(1);
    // context.currentGameContainer?.add(playerOnePortrait);
    const playerTwoPortrait = context.add.image(0, 0, 'playerTwoPortrait').setOrigin(0.5).setPosition(1200, 73).setScale(0.25).setFlipX(true).setDepth(1);
    // context.currentGameContainer?.add(playerTwoPortrait);
  }
}