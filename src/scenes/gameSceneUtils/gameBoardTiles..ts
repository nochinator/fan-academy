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
  const spawn1 = context.add.image(545, 315, 'spawnTile');
  context.currentGameContainer?.add(spawn1);

  const spawn2 = context.add.image(545, 495, 'spawnTile');
  context.currentGameContainer?.add(spawn2);

  const spawn3 = context.add.image(1265, 315, 'spawnTile').setFlipX(true);
  context.currentGameContainer?.add(spawn3);

  const spawn4 = context.add.image(1265, 495, 'spawnTile').setFlipX(true);
  context.currentGameContainer?.add(spawn4);

  // Cristals. Positions 2, 6, 37, and 42 in the coordinates array
  const pedestal1 = context.add.image(725, 225, 'pedestal').setScale(0.8);
  context.currentGameContainer?.add(pedestal1);

  const pedestal2 = context.add.image(1085, 225, 'pedestal').setScale(0.8);
  context.currentGameContainer?.add(pedestal2);

  const pedestal3 = context.add.image(725, 585, 'pedestal').setScale(0.8);
  context.currentGameContainer?.add(pedestal3);

  const pedestal4 = context.add.image(1085, 585, 'pedestal').setScale(0.8);
  context.currentGameContainer?.add(pedestal4);

  // Crystals
  const crystal1 = context.add.image(725, 195, 'crystal').setScale(0.8).setTint(0x3399ff);
  context.currentGameContainer?.add(crystal1);

  const crystal2 = context.add.image(725, 555, 'crystal').setScale(0.8).setTint(0x3399ff);
  context.currentGameContainer?.add(crystal2);

  const crystal3 = context.add.image(1085, 195, 'crystal').setScale(0.8).setTint(0x990000);
  context.currentGameContainer?.add(crystal3);

  const crystal4 = context.add.image(1085, 555, 'crystal').setScale(0.8).setTint(0x990000);
  context.currentGameContainer?.add(crystal4);

  // Damage tiles 11, 33
  const damage1 = context.add.image(725, 315, 'damageTile');
  context.currentGameContainer?.add(damage1);

  const damage2 = context.add.image(1085, 495, 'damageTile');
  context.currentGameContainer?.add(damage2);

  // Crystal damage tile 22
  const crystalDamage = context.add.image(905, 405, 'crystalTile');
  context.currentGameContainer?.add(crystalDamage);

  // Defense tiles 19, 23
  const defense1 = context.add.image(635, 405, 'shieldTile');
  context.currentGameContainer?.add(defense1);

  const defense2 = context.add.image(1175, 405, 'shieldTile');
  context.currentGameContainer?.add(defense2);
}