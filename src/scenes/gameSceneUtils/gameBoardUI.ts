import GameScene from "../game.scene";

export function loadGameBoardUI(context: GameScene): void {
  context.load.image('gameBoard', '/assets/images/maps/game_board.png');

  context.load.image('itemRack', '/assets/images/gameItems/item_rack.png');

  context.load.image('doorClosed', '/assets/images/gameItems/door_closed.png');
  context.load.image('doorOpen', '/assets/images/gameItems/door_open.png');
  context.load.image('doorBanner', '/assets/images/gameItems/door_banner.png');

  context.load.image('actionArrow', '/assets/images/gameItems/action_arrow.png');
  context.load.image('actionPie', '/assets/images/gameItems/action_pie.png');
  context.load.image('actionCircle', '/assets/images/gameItems/action_circle.png');

  context.load.image('turnButton', '/assets/images/gameItems/turn_button.png');

  context.load.image('playerBanner', '/assets/images/gameItems/player_banner.png');
  context.load.image('vsBanner', '/assets/images/gameItems/vs_banner.png');
  context.load.image('playerOnePortrait', '/assets/images/profilePics/Archer_v1-hd.jpg');
  context.load.image('playerTwoPortrait', '/assets/images/profilePics/Phantom_v2-hd.jpg');
}

export async function createGameBoardUI(context: GameScene): Promise<void> {
  // Game map
  const gameMap = context.add.image(0, 0, 'gameBoard').setOrigin(0);
  context.currentGameContainer?.add(gameMap);
  gameMap.x = 1434 - gameMap.width - 14;
  gameMap.y += 14;

  // Item rack
  const itemRack = context.add.image(0, 0, 'itemRack').setOrigin(0.5).setPosition(900, 736).setScale(0.9);
  context.currentGameContainer?.add(itemRack);

  // Door
  const doorClosed = context.add.image(0, 0, 'doorClosed').setOrigin(0.5).setPosition(490, 700).setScale(0.9).setInteractive();
  // TODO: doorClosed on 'hoover' -> show icons of remaining units and items in the deck
  context.currentGameContainer?.add(doorClosed);

  const doorOpen = context.add.image(0, 0, 'doorOpen').setOrigin(0.5).setPosition(490, 700).setVisible(false); // TODO: trigger 'refill' event at the end of the player's turn
  context.currentGameContainer?.add(doorOpen);
  const doorBanner = context.add.image(0, 0, 'doorBanner').setOrigin(0.5).setPosition(440, 760); // TODO: add text
  context.currentGameContainer?.add(doorBanner);

  // Action circle
  // REVIEW: could have just used a spritesheet...
  const actionCircle = context.add.image(0, 0, 'actionCircle').setOrigin(0.5).setPosition(550, 730);
  context.currentGameContainer?.add(actionCircle);
  const actionPie1 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(562, 711).setRotation(-0.3);
  context.currentGameContainer?.add(actionPie1);
  const actionPie2 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(574, 736).setRotation(0.9);
  context.currentGameContainer?.add(actionPie2);
  const actionPie3 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(554, 755).setRotation(2.2);
  context.currentGameContainer?.add(actionPie3);
  const actionPie4 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(532, 743).setRotation(3.4);
  context.currentGameContainer?.add(actionPie4);
  const actionPie5 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(535, 715).setRotation(4.7);
  context.currentGameContainer?.add(actionPie5);
  const actionArrow = context.add.image(0, 0, 'actionArrow').setOrigin(0.5).setPosition(515, 730).setRotation(-0.1).setVisible(false); // TODO: dynamic. Triggers after a move (if !visible, visible) and on undo (only if it's the first move) and on turn sent
  context.currentGameContainer?.add(actionArrow);

  // Send turn button
  const turnButton =  context.add.image(0, 0, 'turnButton').setOrigin(0.5).setPosition(1300, 725).setScale(1.1).setInteractive(); // TODO: add dynamic text. 'Send' - 'Next game'
  context.currentGameContainer?.add(turnButton);
  turnButton.on('pointerdown', async () => {
    console.log('Check context.currentGame && context.currentGame.activePlayer', context.currentGame, context?.currentGame?.activePlayer);
    if (context.currentGame && context.currentGame.activePlayer === context.userId) {
      console.log('Clicked on send turn');

      // context.currentTurn = {};

      // sendTurnMessage(context.currentRoom, context.currentTurn, context.currentOpponent);
    } else {
      console.log('Clicked on send turn but... not your turn'); // TODO: remove after testing
    }
  });

  // Top banner and health bars TODO:
  const playerOneBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(705, 80).setFlipX(true).setTint(0x3399ff); // TODO: add colors
  context.currentGameContainer?.add(playerOneBanner);
  const playerTwoBanner = context.add.image(0, 0, 'playerBanner').setOrigin(0.5).setPosition(1095, 80).setTint(0x990000);
  context.currentGameContainer?.add(playerTwoBanner);
  const vsBanner = context.add.image(0, 0, 'vsBanner').setOrigin(0.5).setPosition(900, 75);
  context.currentGameContainer?.add(vsBanner);
  const playerOnePortrait = context.add.image(0, 0, 'playerOnePortrait').setOrigin(0.5).setPosition(600, 73).setScale(0.25).setDepth(1);
  context.currentGameContainer?.add(playerOnePortrait);
  const playerTwoPortrait = context.add.image(0, 0, 'playerTwoPortrait').setOrigin(0.5).setPosition(1200, 73).setScale(0.25).setFlipX(true).setDepth(1);
  context.currentGameContainer?.add(playerTwoPortrait);
}