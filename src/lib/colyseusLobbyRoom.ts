import { Client } from "colyseus.js";
import { createGameList } from "../scenes/gameSceneUtils/gameList";
import GameScene from "../scenes/game.scene";

export async function connectToGameLobby(client: Client | undefined, userId: string | undefined, context: GameScene): Promise<void> {
  if (!client || !userId) return;

  try {
    console.log('Connecting to game lobby...');
    const lobby = await client.create('lobby', { userId });

    lobby.onMessage('gameListUpdate', (colyseusGameList) => {
      console.log('A game has been updated', colyseusGameList);
      // Re-render the game list
      createGameList(context, colyseusGameList);
    });
  } catch (error) {
    console.log('Error joining lobby ->', error);
  }
};
