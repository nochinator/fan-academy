import { GameController } from "../../classes/gameController";
import { IGame, IPlayerData } from "../../interfaces/gameInterface";
import { createGame, joinGame } from "../../lib/colyseusGameRoom";
import GameScene from "../game.scene";

export function loadGameAssets(context: GameScene) {
  // Load tiles
  context.load.image('spawnTile', '/assets/images/gameItems/DeployZone01-hd.png');
  context.load.image('helmetTile', '/assets/images/gameItems/PremiumTile_Resist-hd.png');
  context.load.image('powerTile', '/assets/images/gameItems/PremiumTile_Sword-hd.png');
  context.load.image('shieldTile', '/assets/images/gameItems/PremiumTile_Shield-hd.png');
  context.load.image('speedTile', '/assets/images/gameItems/PremiumTile_Speed-hd.png');
  context.load.image('crystalDamageTile', '/assets/images/gameItems/PremiumTile_VictoryDamageMultiplier-hd.png');
  context.load.image('teleporterTile', '/assets/images/gameItems/PremiumTile_Teleport-hd.png');
  // Crystal tile images
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

  // Load reticles (attack and healing)
  context.load.image('attackReticle', './assets/images/gameItems/AttackReticle2-hd.png');
  context.load.image('healReticle', './assets/images/gameItems/HealReticle-hd.png');
}

export async function accessGame(context: GameScene, game: IGame, opponent: IPlayerData): Promise<void> {
  if (context.currentRoom) {
    console.log('Leaving game: ', context.currentRoom.roomId);

    context.activePlayer = undefined;
    context.currentGame = undefined;
    context.currentTurnAction = undefined;
    context.currentOpponent = undefined;
    context.currentGameContainer?.destroy(true);
    context.currentGameContainer = undefined;
    context.gameController = undefined;
    context.activeUnit = undefined;
    context.isPlayerOne = undefined;

    await context.currentRoom.leave();
    context.currentRoom = undefined;
  }

  console.log('Accessing game: ', game._id);
  const room = await joinGame(context.colyseusClient, context.userId, game._id, context);

  // Updating GameScene properties
  context.currentGameContainer = context.add.container(0, 0);
  context.currentRoom = room;
  context.activePlayer =  game.activePlayer.toString();
  context.currentGame = game;
  context.currentOpponent = opponent?.userData._id.toString(); // REVIEW: used only once when sending the turn
  context.isPlayerOne = context.currentGame?.players[0].userData._id === context.userId;
  context.currentTurnAction = 1;

  // Generate the game controller to handle game interactions
  createGameAssets(context);
}

export function createGameAssets(context: GameScene): void {
  context.gameController = new GameController(context);
}