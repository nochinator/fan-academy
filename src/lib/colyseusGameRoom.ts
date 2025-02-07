import { Client, Room } from "colyseus.js";

/**
 *
 * @param client TODO: connect the create function to a button. test creating games
 * once working, return games to populate the game list
 * once working, test joining games
 * @param userId
 */
export async function createGame(client: Client | undefined, userId: string | undefined, faction: string | undefined): Promise<void> {
  if (!client || !userId || !faction) {
    console.log('createGame error: missing one of client / userId / faction');
    return;
  }
  try {
    console.log('Checking for open games | creating a new game...');

    const room = await client.create('game_room', {
      userId,
      faction
    });

    subscribeToGameListeners(room);

    // TODO: delete uuid package if not used

    console.log("Joined room:", room.name);
  } catch (error) {
    console.error("Failed to join room:", error);
  }
}

export async function joinGame(client: Client | undefined, userId: string | undefined, roomId: string) {
  if( !client || !userId || !roomId) {
    console.log('joinGame, { client | userid | gameid } missing');
    return;
  }

  let room: Room;
  try {
    room = await client.joinById(roomId, {
      roomId,
      userId
    });

    console.log("Joined room:", room.name);
  } catch (error) {
    console.error("Recreating room...");

    room = await client.create('game_room', {
      userId,
      roomId
    });

    console.log('Recreated room:', room.roomId);
  }

  subscribeToGameListeners(room);
}

function subscribeToGameListeners(room: Room): void {
  // Listen for broadcasted messages
  room.onMessage("turnPlayed", (message) => {
    console.log("Player sent turn:", message);
  });

  // Send a message to the server
  room.send("turn", { turnMoves: [{}] });

  // TODO: on disconnect ?
}
