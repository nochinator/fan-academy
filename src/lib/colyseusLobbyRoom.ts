import { Client, Room } from "colyseus.js";
import { createGameList } from "../scenes/gameSceneUtils/gameList";
import GameScene from "../scenes/game.scene";

export async function connectToGameLobby(client: Client | undefined, userId: string | undefined, context: GameScene): Promise<void> {
  if (!client || !userId) return;

  try {
    console.log('Connecting to game lobby...');
    const lobby = await client.create('lobby', { userId });

    lobby.onMessage('gameListUpdate', (message) => {
      console.log('A game has been updated', message);
      // Re-render the game list
      createGameList(context, message.colyseusGameList);
    });
  } catch (error) {
    console.log('Error joining lobby ->', error);
  }
};
