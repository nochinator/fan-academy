import { IGame } from "../../interfaces/gameInterface";
import { getGameList } from "../../queries/userQueries";
import GameScene from "../game.scene";
import { loadProfilePictures } from "./profilePictures";

export async function createGameList(context: GameScene) {
  const gameList: IGame[] = await getGameList(context.userId!);
  loadProfilePictures(context, gameList);

  const gameListButtonHeight = 142;
  const gameListButtonSpacing = 10;
  const visibleHeight = 922; // TODO: adapt to element size
  const visibleWidth = 370; // TODO: adapt to element size
  const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * gameList.length; // total height of all buttons

  const gameListContainer = context.add.container(0);

  // Create buttons dynamically
  gameList.forEach((game, index) => {
    const player = game.players.find(player => context.userId === player.playerId);
    const oponent = game.players.find(player => context.userId != player.playerId);

    if (!player || !oponent) {
      console.log('Player missing for game index -> ', index); // TODO: missing id in Game
      return;
    }

    const yPosition = index * (gameListButtonHeight + gameListButtonSpacing);

    // Button image
    const gameListButtonImage = context.add.image(0, yPosition, 'gameListButton').setOrigin(0);
    const playerFactionImage = context.add.image(40, yPosition + gameListButtonHeight / 2, player.faction.factionName);
    const oponentFactionImage = context.add.image(60, yPosition + gameListButtonHeight / 2, oponent.faction.factionName);

    const oponentNameText =  context.add.text(80, yPosition + gameListButtonHeight / 2, oponent.username, {
      fontSize: 50,
      fontFamily: 'proLight'
    });
    // const lastMoveText = addText() // TODO: add last move

    // Add elements to container
    gameListContainer.add([gameListButtonImage, playerFactionImage, oponentFactionImage, oponentNameText]);

    // Make container interactive
    gameListContainer.setInteractive();
    gameListContainer.on('pointerdown', () => {
      console.log('Clicked on game');
    });

    // Add mask for scrolling
    const maskShape = context.add.graphics().fillRect(0, 0, visibleWidth, visibleHeight);
    const mask = maskShape.createGeometryMask();
    gameListContainer.setMask(mask);

    // Enable scrolling if content passes visible area
    if (contentHeight > visibleHeight) {
      let yScroll = 0;

      context.input.on('wheel', (pointer: Phaser.Input.Pointer, _xDelta: number, yDelta: number) => {
        yScroll = Phaser.Math.Clamp(yScroll = yDelta, visibleHeight - contentHeight, 0);
        gameListContainer.y = yScroll;
      });
    }
  });
}