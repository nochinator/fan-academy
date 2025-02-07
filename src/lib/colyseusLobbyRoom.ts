import { Client, Room } from "colyseus.js";

export async function connectToGameLobby(client: Client | undefined, userId: string | undefined): Promise<void> {
  if (!client || !userId) return;

  try {
    console.log('Connecting to game lobby...');
    const lobby = await client.create('lobby', { userId });

    subscribeToLobbyListeners(lobby);
  } catch (error) {
    console.log('Error joining lobby ->', error);
  }
};

function subscribeToLobbyListeners(lobby: Room): void {
  lobby.onMessage('gameListUpdate', (message) => {
    console.log('A game has been updated', message);
    // TODO: re-render the game list with the new data sent in the message
  });
}