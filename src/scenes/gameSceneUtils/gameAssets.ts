import { Board } from "../../classes/board";
import { Hero } from "../../classes/hero";
import { Item } from "../../classes/item";
import { isHero, isItem } from "../../utils/deckUtils";
import GameScene from "../game.scene";
import { createGameBoardUI } from "./gameBoardUI";

export function loadGameAssets(context: GameScene) {
  // Load tiles
  context.load.image('spawnTile', '/assets/images/gameItems/DeployZone01-hd.png');
  context.load.image('helmetTile', '/assets/images/gameItems/PremiumTile_Resist-hd.png');
  context.load.image('powerTile', '/assets/images/gameItems/PremiumTile_Sword-hd.png');
  context.load.image('shieldTile', '/assets/images/gameItems/PremiumTile_Shield-hd.png');
  context.load.image('speedTile', '/assets/images/gameItems/PremiumTile_Speed-hd.png');
  context.load.image('crystalDamageTile', '/assets/images/gameItems/PremiumTile_VictoryDamageMultiplier-hd.png');
  context.load.image('teleporterTile', '/assets/images/gameItems/PremiumTile_Teleport-hd.png');

  // Crystals
  context.load.image('crystal', '/assets/images/gameItems/crystal_full.png');
  context.load.image('pedestal', '/assets/images/gameItems/crystal_pedestal.png');
  context.load.image('damagedCrystal', '/assets/images/gameItems/crystal_damaged.png');

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