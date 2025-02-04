import ScrollingCamera from "phaser3-scrolling-camera/dist/scrollcam";
import { ScrollablePanel } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { IGame } from "../../interfaces/gameInterface";
import { getGameList } from "../../queries/userQueries";
import GameScene from "../game.scene";
import { loadProfilePictures } from "./profilePictures";
export async function createGameList(context: GameScene) {
  console.log('Create game list logs');

  const gameList: IGame[] = await getGameList(context.userId!);
  await loadProfilePictures(context, gameList);
  const test = [];
  for (let i = 0; i < 20; i++) {
    test.push(gameList[0]);
  }

  const gameListButtonHeight = 142;
  const gameListButtonSpacing = 20;
  const visibleHeight = 922; // TODO: adapt to element size
  const visibleWidth = 400; // TODO: adapt to element size
  // const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * gameList.length; // total height of all buttons
  const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * test.length; // total height of all buttons

  const gameListContainer = context.add.container(19, 65);

  if (context.textures.exists('player2')) {
    console.log('Image is loaded!');
  } else {
    console.log('Image is NOT loaded.');
  }
  // Create buttons dynamically
  // gameList.forEach((game, index) => {
  test.forEach((game, index) => {
    const player = game.players.find(player => context.userId === player.userData._id);
    const oponent = game.players.find(player => context.userId != player.userData._id);

    if (!player || !oponent) {
      console.log('Player missing for game index -> ', index); // TODO: missing id in Game
      return;
    }

    const yPosition = index * (gameListButtonHeight + gameListButtonSpacing);

    // Button image
    const gameListButtonImage = context.add.image(0, yPosition, 'gameListButton').setOrigin(0);
    const playerFactionImage = context.add.image(40, yPosition + gameListButtonHeight / 2, player.faction.factionName).setScale(0.4);
    playerFactionImage.x = playerFactionImage.x + 50;

    const oponentFactionImage = context.add.image(60, yPosition + gameListButtonHeight / 2, oponent.faction.factionName).setScale(0.4);
    oponentFactionImage.x = oponentFactionImage.x + 450;

    const oponentNameText =  context.add.text(200, yPosition + gameListButtonHeight / 2 - 33, oponent.userData.username, {
      fontSize: 50,
      fontFamily: 'proLight'
    });

    console.log('player.userData.username', oponent.userData.username);
    const oponentProfilePicture = context.add.image(632, yPosition + gameListButtonHeight / 2, oponent.userData.username).setFlipX(true).setScale(0.4);
    // const lastMoveText = addText() // TODO: add last move

    // Add elements to container
    gameListContainer.add([gameListButtonImage, playerFactionImage, oponentFactionImage, oponentNameText, oponentProfilePicture]).setScale(0.51);
  });

  const bounds = gameListContainer.getBounds();
  gameListContainer.setSize(bounds.width, bounds.height);
  // gameListContainer.setPosition(gameListContainer.x + 23, gameListContainer.y + 70 );

  // Make container interactive
  gameListContainer.setInteractive();
  gameListContainer.on('pointerdown', () => {
    console.log('Clicked on game');
  });

  // const scrollMenu = new ScrollingCamera(context, {
  //   x: 19,
  //   y: 65,
  //   width: visibleWidth,
  //   height: visibleHeight,
  //   contentBounds: {
  //     x: 0,
  //     y: 0,
  //     length: gameListContainer.height
  //   }
  // }); // REVIEW: remove package if not working

  // const scrollMenu = new ScrollablePanel(context, {
  //   x: 19,
  //   y: 65,
  //   width: visibleWidth,
  //   height: visibleHeight,
  //   panel: { child: gameListContainer }
  // });
  // context.add.existing(scrollMenu);
}