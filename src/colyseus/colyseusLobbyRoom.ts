import { Client, Room } from "colyseus.js";
import { createGameList } from "../scenes/gameSceneUtils/gameList";
import UIScene from "../scenes/ui.scene";
import { IGameState } from "../interfaces/gameInterface";
import { EFaction, EGameStatus } from "../enums/gameEnums";

export async function connectToGameLobby(client: Client, userId: string, context: UIScene): Promise<Room> {
  let lobby;
  try {
    console.log('Connecting to game lobby...');
    lobby = await client.joinOrCreate('lobby', { userId });

    lobby.onMessage('newGameListUpdate', async (message) => {
      console.log('A game has been added', message);

      if (!context.gameList) console.error('newGameListUpdate - No context.gameList found');

      // Update game and re-render game list. Remove the 'Searching...' game first if needed
      const isInArrayIndex = context.gameList!.findIndex(game => game._id === message.game._id);
      if (isInArrayIndex !== -1) context.gameList?.splice(isInArrayIndex, 1);

      context.gameList?.push(message.game);

      await createGameList(context);
    });

    lobby.onMessage('gameListUpdate', async (message: {
      gameId: string,
      previousTurn: IGameState[],
      newActivePlayer: string,
      turnNumber: number
    }) => {
      console.log('A game has been updated', message);

      const game = context.gameList?.find(game => game._id === message.gameId);
      if (!game) throw new Error('Colyseus lobby. No game found');

      game.previousTurn = message.previousTurn;
      game.activePlayer = message.newActivePlayer;
      game.turnNumber = message.turnNumber;

      await createGameList(context);

      if (message.gameId === context.currentRoom?.roomId) {
        context.scene.get('GameScene').scene.restart({
          userId: context.userId,
          colyseusClient: context.colyseusClient,
          currentGame: game,
          currentRoom: context.currentRoom
        });
      }
    });

    lobby.onMessage('gameOverUpdate', async (message: {
      gameId: string,
      previousTurn: IGameState[],
      userIds: string[],
      turnNumber: number,
      lastPlayedAt: Date
    }) => {
      console.log('A game has ended, updating game list');
      if (!context.gameList) console.error('gameOverUpdate - No context.gameList found');

      const game = context.gameList?.find(game => game._id === message.gameId);
      if (!game) throw new Error('Colyseus lobby. No game found');

      game.previousTurn = message.previousTurn;
      game.turnNumber = message.turnNumber;
      game.status = EGameStatus.FINISHED;

      await createGameList(context);

      if (message.gameId === context.currentRoom?.roomId) {
        context.scene.get('GameScene').scene.restart({
          userId: context.userId,
          colyseusClient: context.colyseusClient,
          currentGame: game,
          currentRoom: context.currentRoom
          // TODO: add gameOver flag to trigger the image and the button swap?
        });
      }
    });

    lobby.onMessage('gameDeletedUpdate', async (message: {
      gameId: string,
      userIds: string[]
    }) => {
      console.log('A game has been deleted, removing it from the game list');
      if (!context.gameList) console.error('gameDeletedUpdate - No context.gameList found');

      // Remove game from the list and re-render it
      const isInArrayIndex = context.gameList!.findIndex(game => game._id === message.gameId);
      if (isInArrayIndex !== -1) context.gameList?.splice(isInArrayIndex, 1);

      await createGameList(context);
      console.log('Game removed from list');
    });

    lobby.onMessage('userDeletedUpdate', async (message: {
      gameIds: string[],
      userIds: string[]
    }) => {
      console.log('A user has been deleted, removing affected games from the game list');
      if (!context.gameList) console.error('userDeletedUpdate - No context.gameList found');

      // Remove game from the list and re-render it
      message.gameIds.forEach(gameId => {
        const isInArrayIndex = context.gameList!.findIndex(game => game._id === gameId);
        if (isInArrayIndex !== -1) {
          const game = context.gameList?.splice(isInArrayIndex, 1);
          if (game?.length && context.currentRoom?.roomId === game[0]._id) context.scene.get('GameScene').scene.stop();
        }
      });

      await createGameList(context);
      console.log('Games removed from list');
    });
  } catch (error) {
    console.error('Error joining lobby ->', error);
  }

  if (!lobby) throw new Error('connectToGameLobby() No lobby found');
  return lobby;
};

export function sendDeletedGameMessage(lobby: Room, gameId: string, userId: string): void {
  lobby.send('gameDeletedMessage', {
    gameId,
    userId
  });
}

export function sendChallengeAcceptedMessage(lobby: Room, gameId: string, userId: string, faction: EFaction): void {
  lobby.send('challengeAcceptedMessage', {
    gameId,
    userId,
    faction
  });
}
