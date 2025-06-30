import { EFaction } from "../../enums/gameEnums";
import LeaderboardScene from "../leaderboard.scene";

export function loadLeaderboardUI(context: LeaderboardScene): void {
  context.load.image('gameBackground', '/assets/ui/create_game.png');
  context.load.image('challengeIcon', '/assets/images/gameItems/card/TooltipIcon_PhysDmg-hd.png');

  context.load.image('popupBackground', '/assets/images/gameItems/NextGameButton-hd.png');
  context.load.image('popupButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

  context.load.image('arrowButton', '/assets/ui/arrow_button.png');
  context.load.image('curvedArrowButton', '/assets/ui/curved_arrow_button.png');

  context.load.image(EFaction.COUNCIL, '/assets/ui/council_emblem.png');
  context.load.image(EFaction.DARK_ELVES, '/assets/ui/elves_emblem.png');
}
