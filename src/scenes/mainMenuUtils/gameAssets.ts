import { EHeroes, EItems } from "../../enums/gameEnums";
import GameScene from "../game.scene";
import { CDN_PATH } from "../preloader.scene";

export function loadGameAssets(context: GameScene) {
  // Load tiles
  context.load.image('spawnTile', `${CDN_PATH}/images/gameItems/DeployZone01-hd.webp`);
  context.load.image('helmetTile', `${CDN_PATH}/images/gameItems/PremiumTile_Resist-hd.webp`);
  context.load.image('powerTile', `${CDN_PATH}/images/gameItems/PremiumTile_Sword-hd.webp`);
  context.load.image('shieldTile', `${CDN_PATH}/images/gameItems/PremiumTile_Shield-hd.webp`);
  context.load.image('speedTile', `${CDN_PATH}/images/gameItems/PremiumTile_Speed-hd.webp`);
  context.load.image('crystalDamageTile', `${CDN_PATH}/images/gameItems/PremiumTile_VictoryDamageMultiplier-hd.webp`);
  context.load.image('teleporterTile', `${CDN_PATH}/images/gameItems/PremiumTile_Teleport-hd.webp`);

  // Special tiles animation
  context.load.image('crystalDamageAnim_1', `${CDN_PATH}/images/gameItems/animations/CrystalPremiumTile_BottomSplash01-hd.webp`);
  context.load.image('crystalDamageAnim_2', `${CDN_PATH}/images/gameItems/animations/CrystalPremiumTile_BottomSplash02-hd.webp`);
  context.load.image('crystalDamageAnim_3', `${CDN_PATH}/images/gameItems/animations/CrystalPremiumTile_BottomSplash03-hd.webp`);

  context.load.image('magicalResistanceAnim_1', `${CDN_PATH}/images/gameItems/animations/ResistPremiumTile_BottomSplash01-hd.webp`);
  context.load.image('magicalResistanceAnim_2', `${CDN_PATH}/images/gameItems/animations/ResistPremiumTile_BottomSplash02-hd.webp`);
  context.load.image('magicalResistanceAnim_3', `${CDN_PATH}/images/gameItems/animations/ResistPremiumTile_BottomSplash03-hd.webp`);

  context.load.image('physicalResistanceAnim_1', `${CDN_PATH}/images/gameItems/animations/ShieldPremiumTile_BottomSplash01-hd.webp`);
  context.load.image('physicalResistanceAnim_2', `${CDN_PATH}/images/gameItems/animations/ShieldPremiumTile_BottomSplash02-hd.webp`);
  context.load.image('physicalResistanceAnim_3', `${CDN_PATH}/images/gameItems/animations/ShieldPremiumTile_BottomSplash03-hd.webp`);

  context.load.image('powerTileAnim_1', `${CDN_PATH}/images/gameItems/animations/SwordPremiumTile_BottomSplash01-hd.webp`);
  context.load.image('powerTileAnim_2', `${CDN_PATH}/images/gameItems/animations/SwordPremiumTile_BottomSplash02-hd.webp`);
  context.load.image('powerTileAnim_3', `${CDN_PATH}/images/gameItems/animations/SwordPremiumTile_BottomSplash03-hd.webp`);

  // Item animations
  context.load.image('superChargeAnim_1', `${CDN_PATH}/images/gameItems/animations/Scroll_Backspash01-hd.webp`);
  context.load.image('superChargeAnim_2', `${CDN_PATH}/images/gameItems/animations/Scroll_Backspash02-hd.webp`);
  context.load.image('superChargeAnim_3', `${CDN_PATH}/images/gameItems/animations/Scroll_Backspash03-hd.webp`);

  context.load.image('soulHarvestAnim_1', `${CDN_PATH}/images/gameItems/animations/SoulHarvest_Explosion01-hd.webp`);
  context.load.image('soulHarvestAnim_2', `${CDN_PATH}/images/gameItems/animations/SoulHarvest_Explosion02-hd.webp`);
  context.load.image('soulHarvestAnim_3', `${CDN_PATH}/images/gameItems/animations/SoulHarvest_Explosion03-hd.webp`);

  context.load.image('infernoAnim_1', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball01-hd.webp`);
  context.load.image('infernoAnim_2', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball02-hd.webp`);
  context.load.image('infernoAnim_3', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball03-hd.webp`);
  context.load.image('infernoAnim_4', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball04-hd.webp`);
  context.load.image('infernoAnim_5', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball05-hd.webp`);
  context.load.image('infernoAnim_6', `${CDN_PATH}/images/gameItems/animations/Inferno_Fireball06-hd.webp`);

  // Character animations
  context.load.image('smokeAnim_1', `${CDN_PATH}/images/gameItems/animations/NinjaSmoke_Puff01-hd.webp`);
  context.load.image('smokeAnim_2', `${CDN_PATH}/images/gameItems/animations/NinjaSmoke_Puff02-hd.webp`);
  context.load.image('smokeAnim_3', `${CDN_PATH}/images/gameItems/animations/NinjaSmoke_Puff03-hd.webp`);

  context.load.image('reviveAnim_1', `${CDN_PATH}/images/gameItems/animations/Revive_Backsplash01-hd.webp`);
  context.load.image('reviveAnim_2', `${CDN_PATH}/images/gameItems/animations/Revive_Backsplash02-hd.webp`);
  context.load.image('reviveAnim_3', `${CDN_PATH}/images/gameItems/animations/Revive_Backsplash03-hd.webp`);

  context.load.image('phantomSpawnAnim_1', `${CDN_PATH}/images/gameItems/animations/PhantomSpawn_Explosion01-hd.webp`);
  context.load.image('phantomSpawnAnim_2', `${CDN_PATH}/images/gameItems/animations/PhantomSpawn_Explosion02-hd.webp`);

  context.load.image('debuff', `${CDN_PATH}/images/gameItems/animations/MoveDebuff_PurpleGlow-hd.webp`);

  // Crystal tile images
  context.load.image('crystalFull', `${CDN_PATH}/images/gameItems/crystal_full.webp`);
  context.load.image('pedestal', `${CDN_PATH}/images/gameItems/crystal_pedestal.webp`);
  context.load.image('crystalDamaged', `${CDN_PATH}/images/gameItems/crystal_damaged.webp`);
  context.load.image('crystalDebuff_1', `${CDN_PATH}/images/gameItems/animations/CrystalDebuff1_BgFlames01-hd.webp`);
  context.load.image('crystalDebuff_2', `${CDN_PATH}/images/gameItems/animations/CrystalDebuff1_BgFlames02-hd.webp`);
  context.load.image('crystalDebuff_3', `${CDN_PATH}/images/gameItems/animations/CrystalDebuff2_BgFlames01-hd.webp`);
  context.load.image('crystalDebuff_4', `${CDN_PATH}/images/gameItems/animations/CrystalDebuff2_BgFlames02-hd.webp`);

  // Crystal card icon
  context.load.image('crystalCardPic', `${CDN_PATH}/images/profilePics/crystalIcon.webp`);

  // Loading units
  const councilArray = ['archer', 'cleric', 'knight', 'ninja', 'wizard'];
  const darkElvesArray = ['priestess', 'impaler', 'necromancer', 'phantom', 'voidmonk', 'wraith'];

  councilArray.forEach(asset => {
    for (let i = 1; i <= 9; i++) {
      context.load.image(`${asset}_${i}`, `${CDN_PATH}/images/factions/council/${asset}/${asset}_${i}.webp`);
    }
    context.load.image(`${asset}CardPic`, `${CDN_PATH}/images/profilePics/${asset}_v1-hd.webp`); // Unit picture for its unit card
  });
  darkElvesArray.forEach(asset => {
    if (asset !== EHeroes.PHANTOM) {
      for (let i = 1; i <= 9; i++) {
        context.load.image(`${asset}_${i}`, `${CDN_PATH}/images/factions/darkElves/${asset}/${asset}_${i}.webp`);
      }
    } else {
      context.load.image(`${asset}_1`, `${CDN_PATH}/images/factions/darkElves/${asset}/${asset}_1.webp`);
    }
    context.load.image(`${asset}CardPic`, `${CDN_PATH}/images/profilePics/${asset}_v1-hd.webp`); // Unit picture for its unit card
  });

  // Loading item card icons
  Object.entries(EItems).forEach(([_key, value]) => {
    context.load.image(`${value}CardPic`, `${CDN_PATH}/images/profilePics/${value}Icon.webp`);
  });

  // Council
  context.load.image('dragonScale', `${CDN_PATH}/images/factions/council/dragon_scale.webp`);
  context.load.image('inferno', `${CDN_PATH}/images/factions/council/inferno.webp`);
  context.load.image('healingPotion', `${CDN_PATH}/images/factions/council/healing_potion.webp`);

  // Dark Elves
  context.load.image('soulStone', `${CDN_PATH}/images/factions/darkElves/soul_stone.webp`);
  context.load.image('soulHarvest', `${CDN_PATH}/images/factions/darkElves/soul_harvest.webp`);
  context.load.image('manaVial', `${CDN_PATH}/images/factions/darkElves/mana_vial.webp`);

  // Shared items
  context.load.image('superCharge', `${CDN_PATH}/images/factions/common/super_charge.webp`);
  context.load.image('runeMetal', `${CDN_PATH}/images/factions/common/rune_metal.webp`);
  context.load.image('shiningHelm', `${CDN_PATH}/images/factions/common/shining_helm.webp`);

  // Load reticles (attack and healing)
  context.load.image('attackReticle', `${CDN_PATH}/images/gameItems/attack_reticle.webp`);
  context.load.image('healReticle', `${CDN_PATH}/images/gameItems/heal_reticle.webp`);
  context.load.image('allyReticle', `${CDN_PATH}/images/gameItems/ally_reticle.webp`);

  // Blocked line of sight
  context.load.image('blockedLOS', `${CDN_PATH}/images/gameItems/blocked_los.webp`);

  // Health bar
  context.load.image('HpBackground', `${CDN_PATH}/images/gameItems/hp_background.webp`);
  context.load.image('HpAlly', `${CDN_PATH}/images/gameItems/hp_green.webp`);
  context.load.image('HpEnemy', `${CDN_PATH}/images/gameItems/hp_red.webp`);

  // Floating text fonts
  context.load.atlas(
    'greenFont',
    `${CDN_PATH}/fonts/green_font.png`,
    `${CDN_PATH}/fonts/green_font.json`
  );
  context.load.atlas(
    'redFont',
    `${CDN_PATH}/fonts/red_font.png`,
    `${CDN_PATH}/fonts/red_font.json`
  );

  // Unit card images -the unit picture is loaded above, alognside the profile pictures
  context.load.image('cardBackground', `${CDN_PATH}/images/gameItems/card/HelpTooltip_BG-hd.webp`);
  context.load.image('cardSeparator', `${CDN_PATH}/images/gameItems/card/HelpTooltip_Separator.webp`);
  context.load.image('hpBackground', `${CDN_PATH}/images/gameItems/card/HelpTooltip_InsetHP-hd.webp`);
  context.load.image('hpBar', `${CDN_PATH}/images/gameItems/card/HelpTooltip_HPBar-hd.webp`);
  context.load.image('magicalDamage', `${CDN_PATH}/images/gameItems/card/TooltipIcon_MagicDmg-hd.webp`);
  context.load.image('physicalDamage', `${CDN_PATH}/images/gameItems/card/TooltipIcon_PhysDmg-hd.webp`);
  context.load.image('magicalResistance', `${CDN_PATH}/images/gameItems/card/TooltipIcon_MagicRes-hd.webp`);
  context.load.image('physicalResistance', `${CDN_PATH}/images/gameItems/card/TooltipIcon_PhysDef-hd.webp`);
  context.load.image('movementRange', `${CDN_PATH}/images/gameItems/card/TooltipIcon_Movement-hd.webp`);
  context.load.image('attackRange', `${CDN_PATH}/images/gameItems/card/TooltipIcon_Range-hd.webp`);
  context.load.image('movementSquare', `${CDN_PATH}/images/gameItems/card/TooltipIcon_MovementTile-hd.webp`);
  context.load.image('attackSquare', `${CDN_PATH}/images/gameItems/card/TooltipIcon_RangeTile-hd.webp`);
  context.load.image('hpIcon', `${CDN_PATH}/images/gameItems/card/HelpTooltip_HP-hd.webp`);
}
