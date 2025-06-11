import { EFaction } from "../../enums/gameEnums";
import { IGame } from "../../interfaces/gameInterface";
import { joinGame } from "../../lib/colyseusGameRoom";
import UIScene from "../ui.scene";

export function loadGameMenuUI(context: UIScene) {
  context.load.image('uiBackground', '/assets/ui/used/game_screen.png');
  context.load.image('createGame', '/assets/ui/used/create_game.png');
  context.load.image('gameListButton', '/assets/ui/used/game_list_premade.png');
  context.load.image('newGameButton', '/assets/ui/used/new_game_btn.png');
  context.load.image(EFaction.COUNCIL, '/assets/ui/used/council_emblem.png');
  context.load.image(EFaction.DARK_ELVES, '/assets/ui/used/elves_emblem.png');
  context.load.image('unknownFaction', '/assets/ui/used/unknown_faction.png');
  context.load.image('unknownOpponent', '/assets/images/profilePics/unknownAvatar-hd.jpg');
  context.load.image('closeButton', '/assets/ui/used/close_button.png');
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

  context.currentRoom = room;
  context.scene.launch('GameScene', {
    userId: context.userId,
    colyseusClient: context.colyseusClient,
    currentGame: game,
    currentRoom: room
  });
}