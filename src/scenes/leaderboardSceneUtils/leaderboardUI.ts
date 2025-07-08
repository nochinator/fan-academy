import { EFaction } from "../../enums/gameEnums";
import LeaderboardScene from "../leaderboard.scene";

export function loadLeaderboardUI(context: LeaderboardScene): void {
  context.load.image('challengeIcon', '/assets/images/gameItems/card/TooltipIcon_PhysDmg-hd.png');

  context.load.image('arrowButton', '/assets/ui/arrow_button.png');
  context.load.image('curvedArrowButton', '/assets/ui/curved_arrow_button.png');
}
