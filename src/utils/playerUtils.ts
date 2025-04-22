import { IPlayerState } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

export function getPlayersKey(context: GameScene): {
  player: 'player1' | 'player2',
  opponent: 'player1' | 'player2',

} {
  return context.player1?.playerId === context.userId ? {
    player: 'player1',
    opponent: 'player2'
  } : {
    player: 'player2',
    opponent: 'player1'
  };
}

export function getCurrentPlayer(context: GameScene): IPlayerState {
  return context.isPlayerOne! ? context.player1! : context.player2!;
}