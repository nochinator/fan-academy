import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { EClass, EGameSounds } from "../enums/gameEnums";
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

export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return password.length >= minLength && hasLetter && hasNumber;
}

export function selectUnit(context: GameScene, unit: Hero | Item): void {
  unit.isActive = true;
  context.activeUnit = unit;

  // Play the sound
  context.sound.play(EGameSounds.HERO_THINKING);

  // Highlight tiles
  if (unit.class === EClass.HERO) context.gameController?.onHeroClicked(unit as Hero);
  if (unit.class === EClass.ITEM) context.gameController?.onItemClicked(unit as Item);
}

export function deselectUnit(context: GameScene): void {
  if (!context.activeUnit) return;

  // Stop the sound
  context.sound.stopByKey(EGameSounds.HERO_THINKING);

  context.activeUnit.isActive = false;
  context.activeUnit = undefined;
  context.gameController?.board.clearHighlights();
  context.gameController?.board.removeReticles();
}