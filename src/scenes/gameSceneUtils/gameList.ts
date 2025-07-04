import { ChallengePopup } from "../../classes/challengePopup";
import { createGame } from "../../colyseus/colyseusGameRoom";
import { sendDeletedGameMessage } from "../../colyseus/colyseusLobbyRoom";
import { EChallengePopup, EFaction, EGameStatus } from "../../enums/gameEnums";
import { IGame, IPlayerData } from "../../interfaces/gameInterface";
import { truncateText } from "../../utils/gameUtils";
import UIScene from "../ui.scene";
import { accessGame } from "./gameMenuUI";

export async function createGameList(context: UIScene) {
  if (!context.gameList) {
    console.error('createGameList() no gameList in context');
    return;
  }

  if (context.gameListContainer) context.gameListContainer.destroy(true); // Need to remove the old container before adding a new one

  // Split game list and split it into arrays, depending on status
  const listPlayerTurnArray: IGame[] = [];
  const listOpponentTurnArray: IGame[] = [];
  const listSearchingArray: IGame[] = [];
  const listChallengeSentArray: IGame[] = [];
  const listChallengeReceivedArray: IGame[] = [];
  const listFinishedArray: IGame[] = [];

  context.gameList.forEach((game: IGame )=> {
    if (game.status === EGameStatus.SEARCHING) listSearchingArray.push(game);
    if (game.status === EGameStatus.PLAYING && game.activePlayer === context.userId) listPlayerTurnArray.push(game);
    if (game.status === EGameStatus.PLAYING && game.activePlayer !== context.userId) listOpponentTurnArray.push(game);
    if (game.status === EGameStatus.CHALLENGE) {
      if (game.players[0].userData._id === context.userId) listChallengeSentArray.push(game);
      if (game.players[1].userData._id === context.userId) listChallengeReceivedArray.push(game);
    }
    if (game.status === EGameStatus.FINISHED) listFinishedArray.push(game);
  });

  // Setting spacing for the positioning of the items in the list
  const gameListButtonHeight = 142;
  const gameListButtonWidth = 700;
  const gameListButtonSpacing = 20;
  const textListHeight = 40;
  const visibleHeight = 915;
  const visibleWidth = 400;
  let lastListItemY = 0;

  // Calculate content height for scrolling
  const totalSections = (listPlayerTurnArray.length ? 1 : 0) + (listOpponentTurnArray.length ? 1 : 0) + (listSearchingArray.length ? 1 : 0) + (listChallengeSentArray.length ? 1 : 0) + (listChallengeReceivedArray.length ? 1 : 0) + (listFinishedArray.length ? 1 : 0);
  const contentHeight = (gameListButtonHeight + gameListButtonSpacing) * context.gameList.length + ( textListHeight * totalSections + 200); // 200 = newGameButton + some padding to make sure the last item always displays fully

  // Creating a container for the game list and adding it to the context (scene)
  const gameListContainer = context.add.container(19, 65); // Setting a variable to save not having to write 'context' every time
  context.gameListContainer = gameListContainer;

  // Set a variable to refer to the active game image -used to highlight the active game in the UI
  let activeGameImage: Phaser.GameObjects.Image;

  // Function for adding elements to the container
  const createGameListItem = (gameListArray: IGame[]) => {
    gameListArray.forEach((game, index) => {
      const player = game.players.find((p: IPlayerData) => context.userId === p.userData._id);
      const opponent = game.players.find((p: IPlayerData) => context.userId !== p.userData._id);
      if (!player) return;

      lastListItemY += ( index === 0 ? textListHeight : gameListButtonHeight) + gameListButtonSpacing;

      const gameListButtonImage = context.add.image(0, lastListItemY, "gameListButton").setOrigin(0).setTint(0xBBBBBB);
      const playerFactionIcon = player.faction ? {
        faction: player.faction,
        scale: 0.4
      } : {
        faction: 'unknownFaction',
        scale: 1.2
      };
      const playerFactionImage =  context.add.image(90, lastListItemY + gameListButtonHeight / 2, playerFactionIcon.faction).setScale(playerFactionIcon.scale);

      let opponentFactionImage;
      let opponentProfilePicture;
      let opponentNameText;

      const setOpponentNameText = (name: string) => {
        return context.add.text(200, lastListItemY + gameListButtonHeight / 2 - 33, truncateText(name, 13), {
          fontSize: 50,
          fontFamily: "proLight"
        });
      };

      if (opponent) {
        opponentFactionImage = context.add.image(510, lastListItemY + gameListButtonHeight / 2, opponent.faction).setScale(0.4);
        opponentProfilePicture = context.add.image(632, lastListItemY + gameListButtonHeight / 2, opponent.userData.picture).setFlipX(true).setDisplaySize(256 * 0.4, 256 * 0.4);
        opponentNameText = setOpponentNameText(opponent.userData.username);
      } else {
        opponentFactionImage = context.add.image(510, lastListItemY + gameListButtonHeight / 2, 'unknownFaction');
        opponentProfilePicture = context.add.image(632, lastListItemY + gameListButtonHeight / 2, 'unknownOpponent').setFlipX(true).setScale(0.4);
        opponentNameText = setOpponentNameText('Searching...');
      }

      // Add a 'close' button to games looking for players
      const closeButton = context.add.image(gameListButtonWidth - 30, lastListItemY, 'closeButton').setOrigin(0).setVisible(false);
      if (game.status === EGameStatus.SEARCHING || game.status === EGameStatus.CHALLENGE) {
        closeButton.setVisible(true).setInteractive();
        closeButton.on('pointerdown', async () => {
          sendDeletedGameMessage(context.lobbyRoom!, game._id, context.userId);
          createGameList(context);
        });
      }

      // Make the game accessible -only for games already playing. // REVIEW: what about games already finished?
      if (game.status === EGameStatus.PLAYING) {
        gameListButtonImage.setInteractive();
        gameListButtonImage.on('pointerdown', async () => {
          // Highlight the game in the UI
          if (activeGameImage) activeGameImage.setTint(0xBBBBBB);
          activeGameImage = gameListButtonImage;
          activeGameImage.clearTint();

          await accessGame(context, game);
        });
      }

      if (game.status === EGameStatus.CHALLENGE && listChallengeReceivedArray.find(gameReceived => gameReceived._id === game._id )) {
        gameListButtonImage.setInteractive();
        gameListButtonImage.on('pointerdown', async () => {
          // Highlight the game in the UI
          if (activeGameImage) activeGameImage.setTint(0xBBBBBB);
          activeGameImage = gameListButtonImage;
          activeGameImage.clearTint();

          if (context.currentRoom) {
            console.log('Leaving game: ', context.currentRoom.roomId);
            await context.currentRoom.leave();
            context.currentRoom = undefined;
            context.scene.stop('GameScene');
          }

          new ChallengePopup({
            context,
            opponentId: opponent!.userData._id,
            challengeType: EChallengePopup.ACCEPT,
            gameId: game._id
          });
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
      await createGame(context, EFaction.COUNCIL);
      await context.currentRoom?.leave();
      context.currentRoom = undefined;
    } else {
      console.error('No userId when creating a new game');
    }
  });
  elvesEmblem.on('pointerdown', async () => {
    // Create the faction's deck and starting hand
    if (context.userId) {
      await createGame(context, EFaction.DARK_ELVES);
      await context.currentRoom?.leave();
      context.currentRoom = undefined;
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

  // TODO: Turn all this if length into a function
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

  if (listChallengeReceivedArray.length) {
    const challengeReceivedText = setHeaderText('Challenges received');
    gameListContainer.add(challengeReceivedText);

    createGameListItem(listChallengeReceivedArray);
    lastListItemY += gameListButtonHeight + gameListButtonSpacing;
  }

  if (listChallengeSentArray.length) {
    const challengeSentText = setHeaderText('Challenges sent');
    gameListContainer.add(challengeSentText);

    createGameListItem(listChallengeSentArray);
    lastListItemY += gameListButtonHeight + gameListButtonSpacing;
  }

  if (listFinishedArray.length) {
    const finishedText = setHeaderText('Finished');
    gameListContainer.add(finishedText);

    createGameListItem(listFinishedArray);
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
  const scrollSpeed = 1;
  let contentOffset = 0;

  context.input.on("wheel", (pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number ) => {
    const withinScrollArea =
    pointer.x >= 19 &&
    pointer.x <= 19 + visibleWidth &&
    pointer.y >= 65 &&
    pointer.y <= 65 + visibleHeight;

    if (withinScrollArea && contentHeight > visibleHeight) {
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
}
