import { EFaction } from "../../enums/gameEnums";
import LeaderboardScene from "../leaderboard.scene";

export function loadLeaderboardUI(context: LeaderboardScene): void {
  context.load.image('gameBackground', '/assets/ui/used/create_game.png');
  context.load.image('challengeIcon', '/assets/images/gameItems/card/TooltipIcon_PhysDmg-hd.png');

  context.load.image('popupBackground', '/assets/images/gameItems/NextGameButton-hd.png');
  context.load.image('popupButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

  context.load.image('arrowButton', '/assets/ui/used/arrow_button.png');
  context.load.image('curvedArrowButton', '/assets/ui/used/curved_arrow_button.png');

  context.load.image(EFaction.COUNCIL, '/assets/ui/used/council_emblem.png');
  context.load.image(EFaction.DARK_ELVES, '/assets/ui/used/elves_emblem.png');
}
