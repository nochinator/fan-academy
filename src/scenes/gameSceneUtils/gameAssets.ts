import { Hero } from "../../classes/hero";
import { HeroModel } from "../../classes/heroModel";
import { Item } from "../../classes/item";
import { ItemModel } from "../../classes/itemModel";
import { isHero, isItem } from "../../utils/deckUtils";
import GameScene from "../game.scene";
import { createBoardGameTiles } from "./gameBoardTiles.";
import { createGameBoardUI } from "./gameBoardUI";

export function loadGameAssets(context: GameScene) {
  // Loading units
  const councilArray = ['archer', 'cleric', 'knight', 'ninja', 'wizard'];
  const darkElvesArray = ['heretic', 'impaler', 'necromancer', 'phantom', 'voidmonk', 'wraith'];

  // TODO: a check should be made to see if both factions are needed
  councilArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/council/${asset}.png`);
  });
  darkElvesArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/darkElves/${asset}.png`);
  });

  // Equipment icons
  context.load.image('runeMetal', './assets/images/factions/common/rune_metal.png');
  context.load.image('shiningHelm', './assets/images/factions/common/shining_helm.png');

  // Faction specific equipment
  // Council
  context.load.image('dragonScale', './assets/images/factions/council/dragon_scale.png');
  context.load.image('inferno', './assets/images/factions/council/inferno.png');
  context.load.image('healingPotion', './assets/images/factions/council/healing_potion.png');

  // Dark Elves
  context.load.image('soulStone', './assets/images/factions/darkElves/soul_stone.png');
  context.load.image('soulHarvest', './assets/images/factions/darkElves/soul_harvest.png');
  context.load.image('manaVial', './assets/images/factions/darkElves/mana_vial.png');

  // Shared items
  context.load.image('scroll', './assets/images/factions/common/scroll.png');
}

export async function createGameAssets(context: GameScene): Promise<void> {
  console.log('This logs when I click on the game', context.currentGame?._id);

  await createGameBoardUI(context);
  createBoardGameTiles(context); // TODO: this should be based on map

  // TODO: generate the hand for the player and the assets on the map
  // Gotta split the items for the players, so the user wont be able to see the items and hand of the opponent

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
   * Render units on the board
   */
    const unitsOnBoard =  game.currentState.boardState;

    unitsOnBoard.forEach(unit => {
      new HeroModel(context, unit as Hero); // FIXME: replace interfaces with classes
    });

    /**
     * Render units in hand
    */
    const unitsInHand = playerFactionData?.unitsInHand;

    unitsInHand?.forEach(unit => {
      // if (isHero(unit)) renderHero(context, unit);
      if (isHero(unit)) new HeroModel(context, unit as Hero); // FIXME: replace interfaces with classes

      if (isItem(unit)) new ItemModel(context, unit as Item);
    });

    /**
    * Render units in deck (not visible)
   */

    const unitsInDeck = playerFactionData?.unitsInDeck;

    unitsInDeck?.forEach(unit => {
      // if (isHero(unit)) renderHero(context, unit);
      if (isHero(unit)) new HeroModel(context, unit as Hero); // FIXME: replace interfaces with classes
      if (isItem(unit)) new ItemModel(context, unit as Item);
    });
  }

  console.log('userPlayer', userPlayer);

  console.log('CURRENTGAME', context.currentGame);
}