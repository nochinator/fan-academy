import { Board } from "../../classes/board";
import { Hero } from "../../classes/hero";
import { Item } from "../../classes/item";
import { isHero, isItem } from "../../utils/deckUtils";
import GameScene from "../game.scene";
import { createGameBoardUI } from "./gameBoardUI";

export function loadGameAssets(context: GameScene) {
  // Loading units
  const councilArray = ['archer', 'cleric', 'knight', 'ninja', 'wizard'];
  const darkElvesArray = ['priestess', 'impaler', 'necromancer', 'phantom', 'voidmonk', 'wraith'];

  // TODO: a check should be made to see if both factions are needed
  councilArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/council/${asset}.png`);
  });
  darkElvesArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/darkElves/${asset}.png`);
  });

  // Council
  context.load.image('dragonScale', './assets/images/factions/council/dragon_scale.png');
  context.load.image('inferno', './assets/images/factions/council/inferno.png');
  context.load.image('healingPotion', './assets/images/factions/council/healing_potion.png');

  // Dark Elves
  context.load.image('soulStone', './assets/images/factions/darkElves/soul_stone.png');
  context.load.image('soulHarvest', './assets/images/factions/darkElves/soul_harvest.png');
  context.load.image('manaVial', './assets/images/factions/darkElves/mana_vial.png');

  // Shared items
  context.load.image('superCharge', './assets/images/factions/common/super_charge.png');
  context.load.image('runeMetal', './assets/images/factions/common/rune_metal.png');
  context.load.image('shiningHelm', './assets/images/factions/common/shining_helm.png');
}

export async function createGameAssets(context: GameScene): Promise<void> {
  console.log('This logs when I click on the game', context.currentGame?._id);

  await createGameBoardUI(context);
  // createBoardGameTiles(context); // TODO: this should be based on map

  const game = context.currentGame;
  if (!game || !game.currentState) {
    console.log('Error: No currentState for current game');
    return;
  }

  const userPlayer = game.players.find(p => p.userData._id === context.userId);
  const opponent = game.players.find(p => p.userData._id != context.userId);

  const playerFactionData = game.currentState.player1.playerId == context.userId ? game.currentState.player1.factionData : game.currentState.player2?.factionData;
  const opponentFactionData = game.currentState.player1.playerId == context.userId ? game.currentState.player1.factionData : game.currentState.player2?.factionData; // we need this for the crystals

  // FIXME: render the crystal here
  /**
   * RENDERING CRISTALS
   */
  // TODO: renderCrystal function
  /**
   * RENDERING UNITS
   */

  if (game.currentState) {
  /**
   * Render the board (tiles and heroes on board)
   */
    const tilesOnBoard =  game.currentState.boardState;
    const board = new Board(context, tilesOnBoard);

    /**
     * Render units in hand
    */
    const unitsInHand = playerFactionData?.unitsInHand;

    unitsInHand?.forEach(unit => {
      // if (isHero(unit)) renderHero(context, unit);
      if (isHero(unit)) new Hero(context, unit);

      if (isItem(unit)) new Item(context, unit);
    });

    /**
    * Render units in deck (not visible)
   */

    const unitsInDeck = playerFactionData?.unitsInDeck;

    unitsInDeck?.forEach(unit => {
      // if (isHero(unit)) renderHero(context, unit);
      if (isHero(unit)) new Hero(context, unit);
      if (isItem(unit)) new Item(context, unit);
    });
  }

  console.log('userPlayer', userPlayer);

  console.log('CURRENTGAME', context.currentGame);
}