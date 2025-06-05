import { Client } from "colyseus.js";
import { createGameList } from "../scenes/gameSceneUtils/gameList";
import UIScene from "../scenes/ui.scene";
import { IGameState } from "../interfaces/gameInterface";

export async function connectToGameLobby(client: Client | undefined, userId: string | undefined, context: UIScene): Promise<void> {
  if (!client || !userId) return;

  try {
    console.log('Connecting to game lobby...');
    const lobby = await client.joinOrCreate('lobby', { userId });

    lobby.onMessage('newGameListUpdate', async (message) => {
      console.log('A game has been added', message);

      if (!context.gameList) console.error('newGameListUpdate - No context.gameList found');

      // Update game and re-render game list. Remove the 'Searching...' game first if needed
      const isInArrayIndex = context.gameList!.findIndex(game => game._id === message.game._id);
      if (isInArrayIndex !== -1) context.gameList?.splice(isInArrayIndex, 1); // REVIEW:
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

      // Update game. Only required for the player receiving the turn
      if (message.newActivePlayer === context.userId) {
        const game = context.gameList?.find(game => game._id === message.gameId);
        if (!game) throw new Error('Colyseus lobby. No game found');

        game.previousTurn = message.previousTurn;
        game.activePlayer = message.newActivePlayer;
        game.turnNumber = message.turnNumber;
      }

      await createGameList(context);
    });

    lobby.onMessage('gameOverUpdate', async (message: {
      gameId: string,
      userIds: string[]
    }) => {
      console.log('A game has ended, removing it from the game list');
      if (!context.gameList) console.error('gameOverUpdate - No context.gameList found');

      // Remove game from the list and re-render it
      const isInArrayIndex = context.gameList!.findIndex(game => game._id === message.gameId);
      if (isInArrayIndex !== -1) context.gameList?.splice(isInArrayIndex, 1);

      await createGameList(context);
      console.log('Finished game removed');
    });
  } catch (error) {
    console.error('Error joining lobby ->', error);
  }
};
