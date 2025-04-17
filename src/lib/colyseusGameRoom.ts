import { Client, Room } from "colyseus.js";
import { IFaction, IGameState, ITile } from "../interfaces/gameInterface";

export async function createGame(client: Client | undefined, userId: string | undefined, faction: IFaction | undefined, boardState: ITile[] | undefined): Promise<void> {
  if (!client || !userId || !faction) {
    console.log('createGame error: missing one of client / userId / faction');
    return;
  }
  try {
    console.log('Checking for open games | creating a new game...');

    const room = await client.create('game_room', {
      userId,
      faction,
      boardState
    });

    subscribeToGameListeners(room);

    console.log("Created and joined room:", room.name);
  } catch (error) {
    console.error("Failed to create or join room:", error);
  }
}

export async function joinGame(client: Client | undefined, userId: string | undefined, roomId: string): Promise<Room | undefined> {
  if( !client || !userId || !roomId) {
    console.log('joinGame, { client | userid | gameid } missing');
    return undefined;
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

  return room;
}

function subscribeToGameListeners(room: Room): void {
  // Listen for broadcasted messages
  room.onMessage("turnPlayed", (message) => {
    console.log("Player sent turn:", message);
    // TODO: call here playTurn function // REVIEW:
  });
}

export function sendTurnMessage(currentRoom: Room | undefined, currentTurn: IGameState[] | undefined, newActivePlayer: string | undefined): void {
  if (!currentRoom || !currentTurn || !newActivePlayer) {
    console.log('Error sending turn, missing one or more params:');
    console.log('Current Room -> ', currentRoom);
    console.log('Current Turn -> ', currentTurn);
    console.log('newActivePlayer -> ', newActivePlayer);

    return;
  }

  currentRoom.send("turnSent", {
    _id: currentRoom.roomId,
    newTurn: currentTurn,
    newActivePlayer
  });

  console.log("Turn message sent...");
} // TODO: add a lastTurnSentFunction changing status, winner and victory condition
