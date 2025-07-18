import GameScene from "../game.scene";
import { CDN_PATH } from "../preloader.scene";

export function loadGameBoardUI(context: GameScene): void {
  context.load.image('gameBoard', `${CDN_PATH}/images/maps/game_board.webp`);

  context.load.image('itemRack', `${CDN_PATH}/images/gameItems/item_rack.webp`);

  context.load.image('doorClosed', `${CDN_PATH}/images/gameItems/door_closed.webp`);
  context.load.image('doorOpen', `${CDN_PATH}/images/gameItems/door_open.webp`);
  context.load.image('doorBanner', `${CDN_PATH}/images/gameItems/door_banner.webp`);

  context.load.image('actionArrow', `${CDN_PATH}/images/gameItems/action_arrow.webp`);
  context.load.image('actionPie', `${CDN_PATH}/images/gameItems/action_pie.webp`);
  context.load.image('actionCircle', `${CDN_PATH}/images/gameItems/action_circle.webp`);

  context.load.image('turnButton', `${CDN_PATH}/ui/turn_button.webp`);

  context.load.image('playerBanner', `${CDN_PATH}/images/gameItems/player_banner.webp`);
  context.load.image('vsBanner', `${CDN_PATH}/images/gameItems/vs_banner.webp`);

  context.load.image('replayButton', `${CDN_PATH}/ui/replay.webp`);
}