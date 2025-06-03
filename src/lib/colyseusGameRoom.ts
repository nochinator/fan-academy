import { Client, Room } from "colyseus.js";
import { IFaction, IGameOver, IGameState, ILastTurnMessage, ITile, ITurnSentMessage } from "../interfaces/gameInterface";
import UIScene from "../scenes/ui.scene";

export async function createGame(context: UIScene, faction: IFaction | undefined, boardState: ITile[] | undefined ): Promise<void> {
  const { colyseusClient, userId } = context;
  if (!colyseusClient || !userId || !faction) {
    console.log('createGame error: missing one of client / userId / faction');
    return;
  }
  try {
    console.log('Checking for open games | creating a new game...');

    const room = await colyseusClient.create('game_room', {
      userId,
      faction,
      boardState
    });

    subscribeToGameListeners(room, context);

    context.currentRoom = room;

    console.log("Created and joined room:", room.name);
  } catch (error) {
    console.error("Failed to create or join room:", error);
  }
}

export async function joinGame(client: Client | undefined, userId: string | undefined, roomId: string, context: UIScene): Promise<Room | undefined> {
  if( !client || !userId || !roomId) {
    console.log('joinGame, { client | userid | gameid } missing');
    return undefined;
  }

  let room: Room;

  try {
    room = await client.joinOrCreate("game_room", {
      userId,
      roomId
    });

    console.log("Joined or created room:", room.roomId);

    context.currentRoom = room;
  } catch (error) {
    console.error("Failed to join or create room", error);
    return undefined;
  }

  subscribeToGameListeners(room, context);

  return room;
}

function subscribeToGameListeners(room: Room, context: UIScene): void {
  // Listen for broadcasted messages, received only by opponent
  room.onMessage("turnPlayed", (message: ITurnSentMessage) => {
    console.log("Player sent turn:", message);

    if (message.roomId === context.currentRoom?.roomId) {
      const currentGame = context.gameList?.find(game => game._id === message.roomId);
      if (!currentGame) throw new Error('turnPlayed() No game found in gameList');

      currentGame.activePlayer = message.newActivePlayer;
      currentGame.previousTurn = message.previousTurn;

      console.log('currentGame', currentGame);

      context.scene.get('GameScene').scene.restart({
        userId: context.userId,
        colyseusClient: context.colyseusClient,
        currentGame,
        currentRoom: room
      });
    }
  });

  room.onMessage("lastTurnPlayed", (message: ILastTurnMessage) => {
    console.log("Game over:", message);

    if (message.roomId === context.currentRoom?.roomId) {
      // TODO: add replay feature for opponent
      // Plus a 5 sec winning/losing animation before closing the game
    }

    context.scene.get('GameScene').scene.stop();
  });
}

export function sendTurnMessage(currentRoom: Room | undefined, currentTurn: IGameState[] | undefined, newActivePlayer: string | undefined, gameOver?: IGameOver): void {
  if (!currentRoom || !currentTurn || !newActivePlayer) {
    console.error('Error sending turn, missing one or more params:');
    console.log('Current Room -> ', currentRoom);
    console.log('Current Turn -> ', currentTurn);
    console.log('newActivePlayer -> ', newActivePlayer);

    return;
  }

  currentRoom.send("turnSent", {
    _id: currentRoom.roomId,
    turn: currentTurn,
    newActivePlayer,
    gameOver
  });

  console.log("Turn message sent...");
} // TODO: add a lastTurnSentFunction changing status, winner and victory condition
