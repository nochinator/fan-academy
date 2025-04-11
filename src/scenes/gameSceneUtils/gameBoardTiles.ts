import GameScene from "../game.scene";

export function loadGameBoardTiles(context: GameScene): void {
  // Special tiles
  context.load.image('spawnTile', '/assets/images/gameItems/DeployZone01-hd.png');
  context.load.image('helmetTile', '/assets/images/gameItems/PremiumTile_Resist-hd.png');
  context.load.image('powerTile', '/assets/images/gameItems/PremiumTile_Sword-hd.png');
  context.load.image('shieldTile', '/assets/images/gameItems/PremiumTile_Shield-hd.png');
  context.load.image('speedTile', '/assets/images/gameItems/PremiumTile_Speed-hd.png');
  context.load.image('crystalDamageTile', '/assets/images/gameItems/PremiumTile_VictoryDamageMultiplier-hd.png');
  context.load.image('teleportTile', '/assets/images/gameItems/PremiumTile_Teleport-hd.png');

  // Crystals
  context.load.image('crystal', '/assets/images/gameItems/crystal_full.png');
  context.load.image('pedestal', '/assets/images/gameItems/crystal_pedestal.png');
  context.load.image('damagedCrystal', '/assets/images/gameItems/crystal_damaged.png');
};
