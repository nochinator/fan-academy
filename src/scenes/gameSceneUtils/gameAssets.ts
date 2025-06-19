import { EHeroes, EItems } from "../../enums/gameEnums";
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

  // Special tiles animation
  context.load.image('crystalDamageAnim_1', '/assets/images/gameItems/animations/CrystalPremiumTile_BottomSplash01-hd.png');
  context.load.image('crystalDamageAnim_2', '/assets/images/gameItems/animations/CrystalPremiumTile_BottomSplash02-hd.png');
  context.load.image('crystalDamageAnim_3', '/assets/images/gameItems/animations/CrystalPremiumTile_BottomSplash03-hd.png');

  context.load.image('magicalResistanceAnim_1', '/assets/images/gameItems/animations/ResistPremiumTile_BottomSplash01-hd.png');
  context.load.image('magicalResistanceAnim_2', '/assets/images/gameItems/animations/ResistPremiumTile_BottomSplash02-hd.png');
  context.load.image('magicalResistanceAnim_3', '/assets/images/gameItems/animations/ResistPremiumTile_BottomSplash03-hd.png');

  context.load.image('physicalResistanceAnim_1', '/assets/images/gameItems/animations/ShieldPremiumTile_BottomSplash01-hd.png');
  context.load.image('physicalResistanceAnim_2', '/assets/images/gameItems/animations/ShieldPremiumTile_BottomSplash02-hd.png');
  context.load.image('physicalResistanceAnim_3', '/assets/images/gameItems/animations/ShieldPremiumTile_BottomSplash03-hd.png');

  context.load.image('powerTileAnim_1', '/assets/images/gameItems/animations/SwordPremiumTile_BottomSplash01-hd.png');
  context.load.image('powerTileAnim_2', '/assets/images/gameItems/animations/SwordPremiumTile_BottomSplash02-hd.png');
  context.load.image('powerTileAnim_3', '/assets/images/gameItems/animations/SwordPremiumTile_BottomSplash03-hd.png');

  // Item animations
  context.load.image('superChargeAnim_1', '/assets/images/gameItems/animations/Scroll_Backspash01-hd.png');
  context.load.image('superChargeAnim_2', '/assets/images/gameItems/animations/Scroll_Backspash02-hd.png');
  context.load.image('superChargeAnim_3', '/assets/images/gameItems/animations/Scroll_Backspash03-hd.png');

  context.load.image('soulHarvestAnim_1', '/assets/images/gameItems/animations/SoulHarvest_Explosion01-hd.png');
  context.load.image('soulHarvestAnim_2', '/assets/images/gameItems/animations/SoulHarvest_Explosion02-hd.png');
  context.load.image('soulHarvestAnim_3', '/assets/images/gameItems/animations/SoulHarvest_Explosion03-hd.png');

  context.load.image('infernoAnim_1', '/assets/images/gameItems/animations/Inferno_Fireball01-hd.png');
  context.load.image('infernoAnim_2', '/assets/images/gameItems/animations/Inferno_Fireball02-hd.png');
  context.load.image('infernoAnim_3', '/assets/images/gameItems/animations/Inferno_Fireball03-hd.png');
  context.load.image('infernoAnim_4', '/assets/images/gameItems/animations/Inferno_Fireball04-hd.png');
  context.load.image('infernoAnim_5', '/assets/images/gameItems/animations/Inferno_Fireball05-hd.png');
  context.load.image('infernoAnim_6', '/assets/images/gameItems/animations/Inferno_Fireball06-hd.png');

  // Character animations
  context.load.image('smokeAnim_1', '/assets/images/gameItems/animations/NinjaSmoke_Puff01-hd.png');
  context.load.image('smokeAnim_2', '/assets/images/gameItems/animations/NinjaSmoke_Puff02-hd.png');
  context.load.image('smokeAnim_3', '/assets/images/gameItems/animations/NinjaSmoke_Puff03-hd.png');

  context.load.image('reviveAnim_1', '/assets/images/gameItems/animations/Revive_Backsplash01-hd.png');
  context.load.image('reviveAnim_2', '/assets/images/gameItems/animations/Revive_Backsplash02-hd.png');
  context.load.image('reviveAnim_3', '/assets/images/gameItems/animations/Revive_Backsplash03-hd.png');

  context.load.image('phantomSpawnAnim_1', '/assets/images/gameItems/animations/PhantomSpawn_Explosion01-hd.png');
  context.load.image('phantomSpawnAnim_2', '/assets/images/gameItems/animations/PhantomSpawn_Explosion02-hd.png');

  context.load.image('debuff', '/assets/images/gameItems/animations/MoveDebuff_PurpleGlow-hd.png');

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
  councilArray.forEach(asset => {
    for (let i = 1; i <= 9; i++) {
      context.load.image(`${asset}_${i}`, `/assets/images/factions/council/${asset}/${asset}_${i}.png`);
    }
    context.load.image(`${asset}CardPic`, `/assets/images/profilePics/${asset}_v1-hd.jpg`); // Unit picture for its unit card
  });
  darkElvesArray.forEach(asset => {
    if (asset !== EHeroes.PHANTOM) {
      for (let i = 1; i <= 9; i++) {
        context.load.image(`${asset}_${i}`, `/assets/images/factions/darkElves/${asset}/${asset}_${i}.png`);
      }
    } else {
      context.load.image(`${asset}_1`, `/assets/images/factions/darkElves/${asset}/${asset}_1.png`);
    }
    context.load.image(`${asset}CardPic`, `/assets/images/profilePics/${asset}_v1-hd.jpg`); // Unit picture for its unit card
  });

  // Loading item card icons
  Object.entries(EItems).forEach(([key, value]) => {
    context.load.image(`${value}CardPic`, `/assets/images/profilePics/${value}.jpg`);
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

  // Unit card images -the unit picture is loaded above, alognside the profile pictures
  context.load.image('cardBackground', './assets/images/gameItems/card/HelpTooltip_BG-hd.png');
  context.load.image('cardSeparator', './assets/images/gameItems/card/HelpTooltip_Separator.png');
  context.load.image('hpBackground', './assets/images/gameItems/card/HelpTooltip_InsetHP-hd.png');
  context.load.image('hpBar', './assets/images/gameItems/card/HelpTooltip_HPBar-hd.png');
  context.load.image('magicalDamage', './assets/images/gameItems/card/TooltipIcon_MagicDmg-hd.png');
  context.load.image('physicalDamage', './assets/images/gameItems/card/TooltipIcon_PhysDmg-hd.png');
  context.load.image('magicalResistance', './assets/images/gameItems/card/TooltipIcon_MagicRes-hd.png');
  context.load.image('physicalResistance', './assets/images/gameItems/card/TooltipIcon_PhysDef-hd.png');
  context.load.image('movementRange', './assets/images/gameItems/card/TooltipIcon_Movement-hd.png');
  context.load.image('attackRange', './assets/images/gameItems/card/TooltipIcon_Range-hd.png');
  context.load.image('movementSquare', './assets/images/gameItems/card/TooltipIcon_MovementTile-hd.png');
  context.load.image('attackSquare', './assets/images/gameItems/card/TooltipIcon_RangeTile-hd.png');
  context.load.image('hpIcon', './assets/images/gameItems/card/HelpTooltip_HP-hd.png');
}
