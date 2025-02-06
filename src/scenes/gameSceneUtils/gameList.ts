import { IGame, IPlayer } from "../../interfaces/gameInterface";
import { getGameList } from "../../queries/userQueries";
import GameScene from "../game.scene";
import { loadProfilePictures } from "./profilePictures";

export async function createGameList(context: GameScene) {
  console.log("Create game list logs");

  const gameList: IGame[] = await getGameList(context.userId!);

  if (!gameList || gameList.length === 0) return;

  await loadProfilePictures(context, gameList);

  const gameListButtonHeight = 142;
  const gameListButtonSpacing = 20;
  const visibleHeight = 915;
  const visibleWidth = 400;
  // const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * gameList.length;

  const gameListContainer = context.add.container(19, 65);

  const test = Array(20).fill(gameList[0]);
  const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * test.length;
  test.forEach((game, index) => {
  // gameList.forEach((game, index) => {
    const player = game.players.find((p: IPlayer) => context.userId === p.userData._id);
    const opponent = game.players.find((p: IPlayer) => context.userId !== p.userData._id);
    if (!player || !opponent) return;

    const yPosition = index * (gameListButtonHeight + gameListButtonSpacing);

    const gameListButtonImage = context.add.image(0, yPosition, "gameListButton").setOrigin(0);
    const playerFactionImage = index === 19 ? context.add.image(90, yPosition + gameListButtonHeight / 2, opponent.faction.factionName).setScale(0.4) : context.add.image(90, yPosition + gameListButtonHeight / 2, player.faction.factionName).setScale(0.4);
    const opponentFactionImage = context.add.image(510, yPosition + gameListButtonHeight / 2, opponent.faction.factionName).setScale(0.4);
    const opponentNameText = context.add.text(200, yPosition + gameListButtonHeight / 2 - 33, opponent.userData.username, {
      fontSize: 50,
      fontFamily: "proLight"
    });
    const opponentProfilePicture = context.add.image(632, yPosition + gameListButtonHeight / 2, opponent.userData.username).setFlipX(true).setScale(0.4);

    gameListContainer.add([gameListButtonImage, playerFactionImage, opponentFactionImage, opponentNameText, opponentProfilePicture]).setScale(0.51);
  });

  const maskGraphics = context.make.graphics();
  maskGraphics.fillStyle(0xffffff);
  maskGraphics.fillRect(19, 65, visibleWidth, visibleHeight - 15);
  const mask = new Phaser.Display.Masks.GeometryMask(context, maskGraphics);

  gameListContainer.setMask(mask);

  let isHovered = false;
  const scrollSpeed = 1;
  let contentOffset = 0;

  context.input.on("wheel", (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number ) => {
    console.log(contentHeight, visibleHeight, contentOffset);
    if (isHovered && contentHeight > visibleHeight) {
      // Calculate the new offset
      contentOffset -= deltaY * scrollSpeed;

      // Define boundaries
      const maxOffset = 0; // The topmost position (no scrolling above the first item)
      const minOffset = visibleHeight * 2 - contentHeight - 50; // The lowest allowed position. Needs to be double the visibleHeight to work properly. -50 for padding.

      // Clamp the scrolling within bounds
      contentOffset = Phaser.Math.Clamp(contentOffset, minOffset, maxOffset);

      // Apply offset to each child
      gameListContainer.each((child: any) => {
        if (child.originalY === undefined) {
          child.originalY = child.y; // Store original position once
        }
        child.y = child.originalY + contentOffset;
      });
    }
  });

  context.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    isHovered = pointer.x >= 19 && pointer.x <= 19 + visibleWidth &&
                pointer.y >= 65 && pointer.y <= 65 + visibleHeight;
  });
}
