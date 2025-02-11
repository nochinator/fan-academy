import { Coordinates } from "../../utils/boardCalculations";
import GameScene from "../game.scene";

export function loadGameBoardTiles(context: GameScene): void {
  // Special tiles
  context.load.image('spawnTile', '/assets/images/gameItems/DeployZone01-hd.png');
  context.load.image('resistTile', '/assets/images/gameItems/PremiumTile_Resist-hd.png');
  context.load.image('damageTile', '/assets/images/gameItems/PremiumTile_Sword-hd.png');
  context.load.image('shieldTile', '/assets/images/gameItems/PremiumTile_Shield-hd.png');
  context.load.image('speedTile', '/assets/images/gameItems/PremiumTile_Speed-hd.png');
  context.load.image('crystalTile', '/assets/images/gameItems/PremiumTile_VictoryDamageMultiplier-hd.png');
  context.load.image('teleportTile', '/assets/images/gameItems/PremiumTile_Teleport-hd.png');

  // Crystals
  context.load.image('crystal', '/assets/images/gameItems/Crystal-LgDmg01_Color-hd.png');
  context.load.image('pedestal', '/assets/images/gameItems/Crystal-Lg_Base-hd.png');
  context.load.image('damagedCrystal', '/assets/images/gameItems/Crystal-LgDmg03_Color-hd.png');
};

export function createBoardGameTiles(context: GameScene): void {
  // TODO: randomize tiles and position. Can have different map layouts

  // Spawn tiles. Positions 9, 17, 27 and 35 in the coordinates array
  context.add.image(545, 315, 'spawnTile');
  context.add.image(545, 495, 'spawnTile');
  context.add.image(1265, 315, 'spawnTile').setFlipX(true);
  context.add.image(1265, 495, 'spawnTile').setFlipX(true);

  // Cristals. Positions 2, 6, 37, and 42 in the coordinates array
  context.add.image(725, 225, 'pedestal').setScale(0.8);
  context.add.image(1085, 225, 'pedestal').setScale(0.8);
  context.add.image(725, 585, 'pedestal').setScale(0.8);
  context.add.image(1085, 585, 'pedestal').setScale(0.8);

  context.add.image(725, 225 - 30, 'crystal').setScale(0.8).setTint(0x3399ff);
  context.add.image(725, 585 - 30, 'crystal').setScale(0.8).setTint(0x3399ff);;
  context.add.image(1085, 225 - 30, 'crystal').setScale(0.8).setTint(0x990000);;
  context.add.image(1085, 585 - 30, 'crystal').setScale(0.8).setTint(0x990000);;

  // Damage tiles 11, 33
  context.add.image(725, 315, 'damageTile');
  context.add.image(1085, 495, 'damageTile');

  // Crystal damage tile 22
  context.add.image(905, 405, 'crystalTile');

  // Defense tiles 19, 23
  context.add.image(635, 405, 'shieldTile');
  context.add.image(1175, 405, 'shieldTile');
}