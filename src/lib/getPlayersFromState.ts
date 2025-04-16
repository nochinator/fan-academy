import { IPlayerState } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

export function getPlayersState(context: GameScene): {
  player: IPlayerState,
  oponent: IPlayerState
} {
  const state = context.currentGame!.currentState;
  const player1 = state.player1.playerId;

  let player;
  let oponent;

  if (player1 === context.userId) {
    player = state.player1;
    oponent = state.player2!;
  } else {
    player = state.player2!;
    oponent = state.player1;
  }

  return {
    player,
    oponent
  };
}