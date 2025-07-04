import { Client, Room } from "colyseus.js";
import { EFaction } from "../enums/gameEnums";
import { IGameOver, IGameState, ILastTurnMessage, ITurnSentMessage } from "../interfaces/gameInterface";
import UIScene from "../scenes/ui.scene";

export async function createGame(context: UIScene, faction: EFaction): Promise<void> {
  const { colyseusClient, userId } = context;
  if (!colyseusClient || !userId || !faction) {
    console.error('createGame error: missing one of client / userId / faction');
    return;
  }
  try {
    console.log('Checking for open games | creating a new game...');

    const room = await colyseusClient.create('game_room', {
      userId,
      faction
    });

    subscribeToGameListeners(room, context);

    context.currentRoom = room;

    console.log("Created and joined room:", room.name);
  } catch (error) {
    console.error("Failed to create or join room:", error);
  }
}

export async function joinGame(client: Client, userId: string, roomId: string, context: UIScene): Promise<Room | undefined> {
  if( !client || !userId || !roomId) {
    console.error('joinGame, { client | userid | gameid } missing');
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

    // if (message.roomId === context.currentRoom?.roomId) {
    //   const currentGame = context.gameList?.find(game => game._id === message.roomId);
    //   if (!currentGame) throw new Error('turnPlayed() No game found in gameList');

    //   currentGame.activePlayer = message.newActivePlayer;
    //   currentGame.previousTurn = message.previousTurn;
    //   currentGame.turnNumber = message.turnNumber;

    //   context.scene.get('GameScene').scene.restart({
    //     userId: context.userId,
    //     colyseusClient: context.colyseusClient,
    //     currentGame,
    //     currentRoom: room
    //   });
    // }
  });

  room.onMessage("lastTurnPlayed", (message: ILastTurnMessage) => {
    console.log("Game over:", message);

    if (message.roomId === context.currentRoom?.roomId) {
      // TODO: add replay feature for opponent
      // Plus a 5 sec winning/losing animation before closing the game
    }
  });
}

export function sendTurnMessage(currentRoom: Room, currentTurn: IGameState[], newActivePlayer: string, turnNumber: number, gameOver?: IGameOver): void {
  if (!currentRoom || !currentTurn || !newActivePlayer) {
    console.error('Error sending turn, missing one or more params');
    return;
  }

  currentRoom.send("turnSent", {
    _id: currentRoom.roomId,
    currentTurn,
    newActivePlayer,
    gameOver,
    turnNumber
  });

  console.log("Turn message sent...");
}
