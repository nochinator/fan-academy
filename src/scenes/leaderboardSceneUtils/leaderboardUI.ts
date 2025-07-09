import LeaderboardScene from "../leaderboard.scene";
import { CDN_PATH } from "../preloader.scene";

export function loadLeaderboardUI(context: LeaderboardScene): void {
  context.load.image('challengeIcon', `${CDN_PATH}/images/gameItems/card/TooltipIcon_PhysDmg-hd.webp`);

  context.load.image('arrowButton', `${CDN_PATH}/ui/arrow_button.webp`);
  context.load.image('curvedArrowButton', `${CDN_PATH}/ui/curved_arrow_button.webp`);
}
