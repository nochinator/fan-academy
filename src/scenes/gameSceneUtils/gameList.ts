import { EFaction, EGameStatus } from "../../enums/gameEnums";
import { IGame, IPlayerData } from "../../interfaces/gameInterface";
import { createGame } from "../../lib/colyseusGameRoom";
import { deleteGame } from "../../queries/gameQueries";
import { createNewGameBoardState, createNewGameFactionState } from "../../utils/createGameState";
import UIScene from "../ui.scene";
import { accessGame } from "./gameMenuUI";
import { loadProfilePictures } from "./profilePictures";

export async function createGameList(context: UIScene) {
  if (!context.gameList) {
    console.error('createGameList() no gameList in context');
    return;
  }

  if (context.gameListContainer) context.gameListContainer.destroy(true); // Need to remove the old container before adding a new one

  // Split game list and split it into 3 arrays, depending on status
  const listPlayerTurnArray: IGame[] = [];
  const listOpponentTurnArray: IGame[] = [];
  const listSearchingArray: IGame[] = [];

  context.gameList.forEach((game: IGame )=> {
    if (game.status === 'searching') listSearchingArray.push(game);
    if (game.status === 'playing' && game.activePlayer === context.userId) listPlayerTurnArray.push(game);
    if (game.status === 'playing' && game.activePlayer !== context.userId) listOpponentTurnArray.push(game);
  });

  // Load oponents' profile pictures
  await loadProfilePictures(context); // REVIEW: since we have the game list from Scene creation, we don't need to load this here

  // Setting spacing for the positioning of the items in the list
  const gameListButtonHeight = 142;
  const gameListButtonWidth = 700;
  const gameListButtonSpacing = 20;
  const textListHeight = 40;
  const visibleHeight = 915;
  const visibleWidth = 400;
  let lastListItemY = 0;

  // Calculate content height for scrolling
  const totalSections = (listPlayerTurnArray.length ? 1 : 0) + (listOpponentTurnArray.length ? 1 : 0) + (listSearchingArray.length ? 1 : 0);
  const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * context.gameList.length + ( textListHeight * totalSections + 200); // 200 = newGameButton + some padding to make sure the last item always displays fully

  // Creating a container for the game list and adding it to the context (scene)
  const gameListContainer = context.add.container(19, 65); // Setting a variable to save having to write 'context.' every time
  context.gameListContainer = gameListContainer;

  // Function for adding elements to the container
  const createGameListItem = (gameListArray: IGame[]) => {
    gameListArray.forEach((game, index) => {
      const player = game.players.find((p: IPlayerData) => context.userId === p.userData._id);
      const opponent = game.players.find((p: IPlayerData) => context.userId !== p.userData._id);
      if (!player) return;

      lastListItemY += ( index === 0 ? textListHeight : gameListButtonHeight) + gameListButtonSpacing;

      const gameListButtonImage = context.add.image(0, lastListItemY, "gameListButton").setOrigin(0);
      const playerFactionImage =  context.add.image(90, lastListItemY + gameListButtonHeight / 2, player.faction).setScale(0.4);

      let opponentFactionImage;
      let opponentProfilePicture;
      let opponentNameText;

      const setOpponentNameText = (name: string) => {
        return context.add.text(200, lastListItemY + gameListButtonHeight / 2 - 33, name, {
          fontSize: 50,
          fontFamily: "proLight"
        });
      };

      if (opponent) {
        opponentFactionImage = context.add.image(510, lastListItemY + gameListButtonHeight / 2, opponent.faction).setScale(0.4);
        opponentProfilePicture = context.add.image(632, lastListItemY + gameListButtonHeight / 2, opponent.userData.username).setFlipX(true).setScale(0.4);
        opponentNameText = setOpponentNameText(opponent.userData.username);
      } else {
        opponentFactionImage = context.add.image(510, lastListItemY + gameListButtonHeight / 2, 'unknownFaction');
        opponentProfilePicture = context.add.image(632, lastListItemY + gameListButtonHeight / 2, 'unknownOpponent').setFlipX(true).setScale(0.4);
        opponentNameText = setOpponentNameText('Searching...');
      }

      // Add a 'close' button to games looking for players
      const closeButton = context.add.image(gameListButtonWidth - 30, lastListItemY, 'closeButton').setOrigin(0).setVisible(false);
      if (game.status === EGameStatus.SEARCHING) {
        closeButton.setVisible(true).setInteractive();
        closeButton.on('pointerdown', async () => {
          console.log('Clicked on X button!');
          await deleteGame(context.userId, game._id);
          const deletedGameIndex = context.gameList!.findIndex(listItem => listItem._id === game._id);
          context.gameList!.splice(deletedGameIndex, 1);
          createGameList(context);
        });
      }

      // Make the game accessible -only for games already playing. // REVIEW: what about games already finished?
      if (game.status === EGameStatus.PLAYING) {
        gameListButtonImage.setInteractive();
        gameListButtonImage.on('pointerdown', async () => {
          await accessGame(context, game);
        });
      }

      gameListContainer.add([gameListButtonImage, playerFactionImage, opponentFactionImage, opponentNameText, opponentProfilePicture, closeButton]);
    });
  };

  // New game button is always at the top of the games' list
  const newGameText = context.add.text(40, lastListItemY + 40, 'Create a game', {
    fontSize: 70,
    fontFamily: "proHeavy"
  });
  const newGameButton = context.add.image(0, lastListItemY, 'newGameButton').setOrigin(0);
  const councilEmblem = context.add.image(380, lastListItemY, EFaction.COUNCIL).setOrigin(0).setScale(0.5).setInteractive();
  const elvesEmblem = context.add.image(530, lastListItemY, EFaction.DARK_ELVES).setOrigin(0).setScale(0.5).setInteractive();

  // Creating a new game when clicking on the desired faction
  councilEmblem.on('pointerdown', async () => {
    // Create the faction's deck and starting hand
    if (context.userId) {
      const playerFaction = createNewGameFactionState(context.userId, EFaction.COUNCIL);
      const boardState = createNewGameBoardState();
      await createGame(context, playerFaction, boardState);
    } else {
      console.error('No userId when creating a new game');
    }
  });
  elvesEmblem.on('pointerdown', async () => {
    // Create the faction's deck and starting hand
    if (context.userId) {
      const playerFaction = createNewGameFactionState(context.userId, EFaction.DARK_ELVES);
      const boardState = createNewGameBoardState();
      await createGame(context, playerFaction, boardState);
    } else {
      console.error('No userId when creating a new game');
    }
  });

  lastListItemY += 150;

  gameListContainer.add([newGameButton, newGameText, councilEmblem, elvesEmblem]);

  // Check the arrays one by one, adding the elements in order // FIXME: need to order them from longest time since it was your turn to shortest
  const setHeaderText = (header: string) => {
    return context.add.text(30, lastListItemY, header, {
      fontSize: 50,
      fontFamily: "proLight"
    });
  };

  if (listPlayerTurnArray.length) {
    const playerTurnText = setHeaderText('Your turn');
    gameListContainer.add(playerTurnText);

    createGameListItem(listPlayerTurnArray);
    lastListItemY += gameListButtonHeight + gameListButtonSpacing;
  }

  if (listOpponentTurnArray.length) {
    const opponentTurnText = setHeaderText("Opponent's turn");
    gameListContainer.add(opponentTurnText);

    createGameListItem(listOpponentTurnArray);
    lastListItemY += gameListButtonHeight + gameListButtonSpacing;
  }

  if (listSearchingArray.length) {
    const searchingText = setHeaderText('Searching for players');
    gameListContainer.add(searchingText);

    createGameListItem(listSearchingArray);
    lastListItemY += gameListButtonHeight + gameListButtonSpacing;
  }

  // Reduce the size of the container to make the images fit the UI
  gameListContainer.setScale(0.51);

  // Set the mask to make the list scrollable
  const maskGraphics = context.make.graphics();
  maskGraphics.fillStyle(0xffffff);
  maskGraphics.fillRect(19, 65, visibleWidth, visibleHeight - 15);
  const mask = new Phaser.Display.Masks.GeometryMask(context, maskGraphics);

  gameListContainer.setMask(mask);

  const isHovered = false;
  const scrollSpeed = 1;
  let contentOffset = 0;

  context.input.on("wheel", (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number ) => {
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

  // context.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
  //   isHovered = pointer.x >= 19 && pointer.x <= 19 + visibleWidth &&
  //   pointer.y >= 65 && pointer.y <= 65 + visibleHeight;
  // }); // FIXME: remove if no used
}
