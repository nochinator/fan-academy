import { joinGame } from "../../colyseus/colyseusGameRoom";
import { IGame } from "../../interfaces/gameInterface";
import UIScene from "../ui.scene";

export function loadGameMenuUI(context: UIScene) {
  context.load.image('gameListButton', '/assets/ui/game_list_premade.png');
  context.load.image('newGameButton', '/assets/ui/new_game_btn.png');
  context.load.image('unknownFaction', '/assets/ui/unknown_faction.png');
  context.load.image('unknownOpponent', '/assets/images/profilePics/unknownAvatar-hd.jpg');
  context.load.image('closeButton', '/assets/ui/close_button.png');
}

export async function accessGame(context: UIScene, game: IGame): Promise<void> {
  if (context.currentRoom) {
    console.log('Leaving game: ', context.currentRoom.roomId);
    await context.currentRoom.leave();
    context.currentRoom = undefined;
    context.scene.stop('GameScene');
  }

  console.log('Accessing game: ', game._id);
  const room = await joinGame(context.colyseusClient, context.userId, game._id, context);

  if (!room) return;

  context.currentRoom = room;
  context.scene.launch('GameScene', {
    userId: context.userId,
    colyseusClient: context.colyseusClient,
    currentGame: game,
    currentRoom: room
  });
}