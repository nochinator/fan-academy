import GameScene from "../game.scene";
import { createBoardGameTiles } from "./gameBoardTiles.";
import { createGameBoardUI } from "./gameBoardUI";
import { renderCharacter } from "./renderCharacter";

export function loadGameAssets(context: GameScene) {
  // Loading units
  const councilArray = ['archer', 'cleric', 'fighter', 'ninja', 'wizard'];
  const darkElvesArray = ['heretic', 'impaler', 'necro', 'phantom', 'voidmonk', 'wraith'];

  // TODO: a check should be made to see if both factions are needed
  councilArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/council/${asset}.png`);
  });
  darkElvesArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/darkElves/${asset}.png`);
  });

  // Equipment icons
  context.load.image('runeMetal', './assets/images/factions/common/rune_metal.png');
  context.load.image('dragonScale', './assets/images/factions/common/dragon_scale.png');
  context.load.image('shiningHelm', './assets/images/factions/common/shining_helm.png');
}

export async function createGameAssets(context: GameScene): Promise<void> {
  console.log('This logs when I click on the game', context.currentGame?._id);

  await createGameBoardUI(context);
  createBoardGameTiles(context); // TODO: this should be based on map

  // TODO: generate the hand for the player and the assets on the map
  // Gotta split the items for the players, so the user wont be able to see the items and hand of the opponent

  const game = context.currentGame;
  if (!game) return; // TODO: throw error here

  const userPlayer = game.players.find(p => p._id === context.userId);
  const opponent = game.players.find(p => p._id != context.userId);

  // FIXME: render the crystal here

  /**
   * Render units on the board
   */
  const unitsOnBoard =  game.currentState.boardState;

  unitsOnBoard.forEach(unit => {
    renderCharacter(context, unit);
  });

  /**
   * Render units in hand
   */

  /**
   * Render units in deck (not visible
   */

  console.log('userPlayer', userPlayer);

  console.log('CURRENTGAMESTATE', context.currentGame);
}