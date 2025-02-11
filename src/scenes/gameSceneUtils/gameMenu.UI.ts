import { connectToGameLobby } from "../../lib/colyseusLobbyRoom";
import GameScene from "../game.scene";
import { createGameList } from "./gameList";

export function loadGameMenuUI(context: GameScene) {
  context.load.image('background', '/assets/ui/used/game_screen.png');
  context.load.image('gameListButton', '/assets/ui/used/game_list_premade.png');
  context.load.image('newGameButton', '/assets/ui/used/new_game_btn.png');
  context.load.image('council', '/assets/ui/used/council_emblem.png');
  context.load.image('elves', '/assets/ui/used/elves_emblem.png');
  context.load.image('unknownFaction', '/assets/ui/used/unknown_faction.png');
  context.load.image('unknownOpponent', '/assets/images/profilePics/UnknownAvatar-hd.jpg');
}

export async function  createGameMenuUI(context: GameScene) {
  // Background game screen
  context.add.image(0, 0, 'background').setOrigin(0, 0);
  await createGameList(context);
}