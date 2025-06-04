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
  context.load.image('crystalFull', '/assets/images/gameItems/crystal_full.png');
  context.load.image('pedestal', '/assets/images/gameItems/crystal_pedestal.png');
  context.load.image('crystalDamaged', '/assets/images/gameItems/crystal_damaged.png');
  context.load.image('crystalDebuff_1', '/assets/images/gameItems/animations/CrystalDebuff1_BgFlames01-hd.png');
  context.load.image('crystalDebuff_2', '/assets/images/gameItems/animations/CrystalDebuff1_BgFlames02-hd.png');
  context.load.image('crystalDebuff_3', '/assets/images/gameItems/animations/CrystalDebuff2_BgFlames01-hd.png');
  context.load.image('crystalDebuff_4', '/assets/images/gameItems/animations/CrystalDebuff2_BgFlames02-hd.png');

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
  context.load.image('attackReticle', './assets/images/gameItems/attack_reticle.png');
  context.load.image('healReticle', './assets/images/gameItems/heal_reticle.png');
  context.load.image('allyReticle', './assets/images/gameItems/ally_reticle.png');

  // Blocked line of sight
  context.load.image('blockedLOS', './assets/images/gameItems/blocked_los.png');

  // Health bar
  context.load.image('HpBackground', './assets/images/gameItems/hp_background.png');
  context.load.image('HpAlly', './assets/images/gameItems/hp_green.png');
  context.load.image('HpEnemy', './assets/images/gameItems/hp_red.png');

  // Floating text fonts
  context.load.atlas(
    'greenFont',
    './assets/fonts/green_font.png',
    './assets/fonts/green_font.json'
  );
  context.load.atlas(
    'redFont',
    './assets/fonts/red_font.png',
    './assets/fonts/red_font.json'
  );
}
