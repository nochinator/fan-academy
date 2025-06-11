import { EActionType, EAttackType, EClass, EFaction, EHeroes, EItems, ETiles } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { getGridDistance, moveAnimation, roundToFive, updateUnitsLeft } from "../utils/gameUtils";
import { makeUnitClickable } from "../utils/makeUnitClickable";
import { Crystal } from "./crystal";
import { FloatingText } from "./floatingText";
import { HealthBar } from "./healthBar";
import { Item } from "./item";
import { Tile } from "./tile";

export abstract class Hero extends Phaser.GameObjects.Container {
  class: EClass = EClass.HERO;
  faction: EFaction;
  unitType: EHeroes;
  unitId: string;
  boardPosition: number;
  row: number;
  col: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  healingRange: number;
  attackType: EAttackType;
  power: number;
  powerModifier: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  superCharge: boolean;
  isActiveValue: boolean;
  belongsTo: number;
  canHeal: boolean;
  unitsConsumed: number;
  isDebuffed: boolean;

  context: GameScene;

  characterImage: Phaser.GameObjects.Image;
  runeMetalImage: Phaser.GameObjects.Image;
  shiningHelmImage: Phaser.GameObjects.Image;
  factionBuffImage: Phaser.GameObjects.Image;
  attackReticle: Phaser.GameObjects.Image;
  healReticle: Phaser.GameObjects.Image;
  allyReticle: Phaser.GameObjects.Image;
  blockedLOS: Phaser.GameObjects.Image;
  debuffImage: Phaser.GameObjects.Image;
  crystalDebuffTileAnim: Phaser.GameObjects.Image;
  powerTileAnim: Phaser.GameObjects.Image;
  magicalResistanceTileAnim: Phaser.GameObjects.Image;
  physicalResistanceTileAnim: Phaser.GameObjects.Image;
  superChargeAnim: Phaser.GameObjects.Image;
  reviveAnim: Phaser.GameObjects.Image;
  smokeAnim?: Phaser.GameObjects.Image;

  crystalDebuffEvent: Phaser.Time.TimerEvent;
  powerTileEvent: Phaser.Time.TimerEvent;
  magicalResistanceTileEvent: Phaser.Time.TimerEvent;
  physicalResistanceTileEvent: Phaser.Time.TimerEvent;
  superChargeEvent: Phaser.Time.TimerEvent;
  reviveEvent?: Phaser.Time.TimerEvent;
  smokeEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  healthBar: HealthBar;

  constructor(context: GameScene, data: IHero, tileType?: ETiles) {
    const { x, y } = context.centerPoints[data.boardPosition];
    super(context, x, y);
    this.context = context;

    // Interface properties assignment
    this.faction = data.faction;
    this.unitType = data.unitType;
    this.unitId = data.unitId;
    this.boardPosition = data.boardPosition;
    this.row = data.row;
    this.col = data.col;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.isKO = data.isKO;
    this.lastBreath = data.lastBreath;
    this.movement = data.movement;
    this.attackRange = data.attackRange;
    this.healingRange = data.healingRange;
    this.attackType = data.attackType;
    this.power = data.power;
    this.powerModifier = data.powerModifier;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.factionBuff = data.factionBuff;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
    this.superCharge = data.superCharge;
    this.isActiveValue = false;
    this.belongsTo = data.belongsTo ?? 1;
    this.canHeal = data.canHeal ?? false;
    this.unitsConsumed = data.unitsConsumed ?? 0;
    this.isDebuffed = data.isDebuffed;

    this.healthBar = new HealthBar(context, data, -38, -60);
    if (this.boardPosition >= 45) this.healthBar.setVisible(false);

    // Create the unit's image and images for its upgrades
    this.characterImage = context.add.image(0, -10, this.unitType).setOrigin(0.5).setName('body');
    if (this.belongsTo === 2 && this.boardPosition < 45) this.characterImage.setFlipX(true);
    if (this.isKO) this.characterImage.angle = 90;

    this.runeMetalImage = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setName('runeMetal');
    if (!this.runeMetal) this.runeMetalImage.setVisible(false);

    this.shiningHelmImage = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setName('shiningHelm');
    if (!this.shiningHelm) this.shiningHelmImage.setVisible(false);

    if (this.faction === EFaction.COUNCIL) {
      this.factionBuffImage = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setName('dragonScale');
    } else {
      this.factionBuffImage = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.3).setName('soulStone');
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined
    if (!this.factionBuff) this.factionBuffImage.setVisible(false);

    if (this.faction === EFaction.COUNCIL) {
      this.smokeAnim = context.add.image(0, 0, 'smokeAnim_1').setOrigin(0.5).setScale(2.5).setVisible(false).setTint(0x393D47);
    }

    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setName('attackReticle').setVisible(false);
    this.healReticle = context.add.image(0, -10, 'healReticle').setOrigin(0.5).setScale(0.8).setName('healReticle').setVisible(false);
    this.allyReticle = context.add.image(0, -10, 'allyReticle').setOrigin(0.5).setScale(0.6).setName('allyReticle').setVisible(false);
    this.debuffImage = context.add.image(0, -10, 'debuff').setOrigin(0.5).setScale(2.5).setName('debuff').setVisible(false);

    // Add animations to the reticles
    const addCirclingTween = (reticle: Phaser.GameObjects.Image) => {
      context.tweens.add({
        targets: reticle,
        angle: 360,
        duration: 7000,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          // Reset the angle to 0 each time to prevent overflow
          reticle.angle = 0;
        }
      });
    };
    addCirclingTween(this.attackReticle);
    addCirclingTween(this.healReticle);
    addCirclingTween(this.allyReticle);
    addCirclingTween(this.debuffImage);

    // Add blocked LOS and its animation
    this.blockedLOS = context.add.image(0, -10, 'blockedLOS').setOrigin(0.5).setName('blockedLOS').setVisible(false);
    context.tweens.add({
      targets: this.blockedLOS,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add special tile and character animations
    this.crystalDebuffTileAnim = context.add.image(0, 25, 'crystalDamageAnim_1').setOrigin(0.5).setScale(0.6);
    if (tileType === ETiles.CRYSTAL_DAMAGE) {
      this.crystalDebuffTileAnim.setVisible(true);
    } else {
      this.crystalDebuffTileAnim.setVisible(false);
    }
    this.crystalDebuffEvent = this.continuousEvent(this.crystalDebuffTileAnim, ['crystalDamageAnim_1', 'crystalDamageAnim_2', 'crystalDamageAnim_3']);

    this.powerTileAnim = context.add.image(0, 25, 'powerTileAnim_1').setOrigin(0.5).setScale(0.6);
    if (tileType === ETiles.POWER) {
      this.powerTileAnim.setVisible(true);
    } else {
      this.powerTileAnim.setVisible(false);
    }

    this.powerTileEvent = this.continuousEvent(this.powerTileAnim, ['powerTileAnim_1', 'powerTileAnim_2', 'powerTileAnim_3']);

    this.magicalResistanceTileAnim = context.add.image(0, 25, 'magicalResistanceAnim_1').setOrigin(0.5).setScale(0.6);
    if (tileType === ETiles.POWER) {
      this.magicalResistanceTileAnim.setVisible(true);
    } else {
      this.magicalResistanceTileAnim.setVisible(false);
    }

    this.magicalResistanceTileEvent = this.continuousEvent(this.magicalResistanceTileAnim, ['magicalResistanceAnim_1', 'magicalResistanceAnim_2', 'magicalResistanceAnim_3']);

    this.physicalResistanceTileAnim = context.add.image(0, 25, 'physicalResistanceAnim_1').setOrigin(0.5).setScale(0.6);
    if (tileType === ETiles.POWER) {
      this.physicalResistanceTileAnim.setVisible(true);
    } else {
      this.physicalResistanceTileAnim.setVisible(false);
    }

    this.physicalResistanceTileEvent = this.continuousEvent(this.physicalResistanceTileAnim, ['physicalResistanceAnim_1', 'physicalResistanceAnim_2', 'physicalResistanceAnim_3']);

    this.superChargeAnim = context.add.image(0, -10, 'superChargeAnim_1').setOrigin(0.5).setScale(0.6);
    if (this.superCharge) {
      this.superChargeAnim.setVisible(true);
    } else {
      this.superChargeAnim.setVisible(false);
    }

    this.superChargeEvent = this.continuousEvent(this.superChargeAnim, ['superChargeAnim_1', 'superChargeAnim_2', 'superChargeAnim_3']);

    this.reviveAnim = context.add.image(0, -10, 'reviveAnim_1').setOrigin(0.5).setScale(0.7).setVisible(false);

    // Add all individual images to container
    this.add([
      this.superChargeAnim,
      this.reviveAnim,
      this.debuffImage,
      this.characterImage,
      this.runeMetalImage,
      this.factionBuffImage,
      this.shiningHelmImage,
      this.healthBar,
      this.crystalDebuffTileAnim,
      this.powerTileAnim,
      this.magicalResistanceTileAnim,
      this.physicalResistanceTileAnim,
      this.attackReticle,
      this.healReticle,
      this.allyReticle,
      ...this.smokeAnim ? [this.smokeAnim] : [],
      this.blockedLOS]).setSize(50, 50).setInteractive().setName(this.unitId).setDepth(this.boardPosition + 10); // REVIEW: depth

    // Hide if in deck
    if (this.boardPosition === 51) this.setVisible(false);

    makeUnitClickable(this, context);

    this.scene.input.enableDebug(this);

    context.add.existing(this);
  }

  get isActive() {
    return this.isActiveValue;
  }

  set isActive(value: boolean) {
    this.isActiveValue = value;
    if (value) {
      this.onActivate();
    } else {
      this.onDeactivate();
    }
  }

  updatePosition(tile: Tile): void {
    const { x, y } = this.context.centerPoints[tile.boardPosition];
    this.x = x;
    this.y = y;
    this.boardPosition = tile.boardPosition;
    this.row = tile.row;
    this.col = tile.col;
  }

  exportData(): IHero {
    return {
      class: this.class,
      faction: this.faction,
      unitType: this.unitType,
      unitId: this.unitId,
      boardPosition: this.boardPosition,
      row: this.row,
      col: this.col,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isKO: this.isKO,
      lastBreath: this.lastBreath,
      movement: this.movement,
      attackRange: this.attackRange,
      healingRange: this.healingRange,
      attackType: this.attackType,
      power: this.power,
      powerModifier: this.powerModifier,
      physicalDamageResistance: this.physicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
      factionBuff: this.factionBuff,
      runeMetal: this.runeMetal,
      shiningHelm: this.shiningHelm,
      superCharge: this.superCharge,
      belongsTo: this.belongsTo,
      canHeal: this.canHeal,
      unitsConsumed: this.unitsConsumed,
      isDebuffed: this.isDebuffed
    };
  }

  private continuousEvent(image: Phaser.GameObjects.Image, textures: string[]): Phaser.Time.TimerEvent {
    let frame = 0;

    return this.scene.time.addEvent({
      delay: 100, // milliseconds between frames
      loop: true,
      callback: () => {
        image.setTexture(textures[frame]);
        frame = (frame + 1) % textures.length;
      }
    });
  };

  singleEvent(image: Phaser.GameObjects.Image, textures: string[], delay: number): Phaser.Time.TimerEvent {
    let frame = 0;

    image.setVisible(true);
    const event = this.scene.time.addEvent({
      delay, // milliseconds between frames
      repeat: textures.length - 1,
      callback: () => {
        image.setTexture(textures[frame]);
        frame++;

        console.log('frame', frame, this.unitType);
        if (frame === textures.length) {
          image.setVisible(false);
          event.remove();
        }
      }
    });

    return event;
  };

  singleTween(image: Phaser.GameObjects.Image, duration: number): void {
    image.setVisible(true);
    this.context.tweens.add({
      targets: image,
      scaleX: 0,
      scaleY: 0,
      duration,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        image.setVisible(false);
      }
    });
  }

  onActivate(): void {
    console.log(`${this.unitId} is now active`);
    this.setScale(1.2);
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.setScale(1);
  }

  getsDamaged(damage: number, attackType: EAttackType): number {
    // Flash the unit red
    this.characterImage.setTint(0xff0000); // TODO: remove once I get floating dmg numbers working
    this.scene.time.delayedCall(1000, () => this.characterImage.clearTint());

    // Calculate damage after applying resistances
    const totalDamage = roundToFive(this.getLifeLost(damage, attackType));

    this.currentHealth -= totalDamage;
    if (this.currentHealth <= 0) this.getsKnockedDown();

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show damage numbers
    if (totalDamage > 0) new FloatingText(this.context, this.x, this.y - 50, totalDamage.toString());

    this.updateTileData();

    return totalDamage; // Return damage taken for lifesteal
  }

  modifyPower(amount: number): void {
    this.powerModifier += amount;
    this.updateTileData();
  }

  getTotalPower(multiplier = 1): number {
    if (this.powerModifier === 0) return this.power * multiplier;

    const totalPower = this.power * this.powerModifier / 100 * multiplier;

    this.updateTileData();

    return totalPower;
  }

  getLifeLost(damage: number, attackType: EAttackType) {
    const resistance = {
      [EAttackType.MAGICAL]: this.magicalDamageResistance,
      [EAttackType.PHYSICAL]: this.physicalDamageResistance
    };

    const reduction = resistance[attackType];

    const totalDamage = resistance ? damage - damage * reduction / 100 : damage;
    return totalDamage > this.currentHealth ? this.currentHealth : totalDamage;
  }

  getsHealed(healing: number): void {
    if (healing <= 0) return;
    if (this.isKO) this.getsRevived();

    let actualHealing: number;

    if (this.currentHealth + healing >= this.maxHealth) {
      actualHealing = this.maxHealth - this.currentHealth;
      this.currentHealth = this.maxHealth;
    } else {
      this.currentHealth += healing;
      actualHealing = healing;
    }

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show healing numbers
    if (actualHealing > 0) new FloatingText(this.context, this.x, this.y - 50, actualHealing.toString(), true);

    this.updateTileData();
  }

  private getsRevived(): void {
    this.reviveEvent = this.singleEvent(this.reviveAnim, ['reviveAnim_1', 'reviveAnim_2', 'reviveAnim_3'], 150);
    this.isKO = false;
    this.lastBreath = false;
    this.characterImage.angle = 0;
  }

  increaseMaxHealth(amount: number): void {
    if (amount <= 0) return;
    if (this.isKO) this.getsRevived(); // for Soul Harvest

    const roundedHealtGain = roundToFive(amount);
    this.maxHealth += roundedHealtGain;
    this.currentHealth += roundedHealtGain;

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show healing numbers
    new FloatingText(this.context, this.x, this.y - 50, amount.toString(), true);

    this.updateTileData();
  }

  getsKnockedDown(): void {
    if (this.unitType === EHeroes.PHANTOM) {
      this.removeFromGame();
      return;
    }

    this.currentHealth = 0;
    this.isKO = true;
    const tile = this.getTile();
    tile.setOccupied(false);
    tile.hero = this.exportData();

    // TODO: Switch to KO'd image
    this.characterImage.angle = 90; // REVIEW: p1 units are face down, P2 face up
  }

  getTile(): Tile {
    const tile = this.context?.gameController?.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  updateTileData(): void {
    const tile = this.getTile();
    tile.hero = this.exportData();
    tile.setOccupied(!this.isKO);
  }

  removeFromGame(): void {
    // Remove animations
    this.scene.tweens.killTweensOf(this);

    this.list.forEach(child => {
      this.scene.tweens.killTweensOf(child);
    });

    // Remove hero data from tile
    const tile = this.getTile();
    tile.removeHero();

    // Remove hero from board array
    const index = this.context.gameController!.board.units.findIndex(unit => unit.unitId === this.unitId);
    if (index !== -1) { this.context.gameController!.board.units.splice(index, 1); }

    // Update hero counter
    if (this.unitType !== EHeroes.PHANTOM) updateUnitsLeft(this.context, this);

    // Remove events
    this.crystalDebuffEvent.remove(false);
    this.powerTileEvent.remove(false);
    this.magicalResistanceTileEvent.remove(false);
    this.physicalResistanceTileEvent.remove(false);
    this.superChargeEvent.remove(false);
    if (this.spawnEvent) this.spawnEvent?.remove(false);

    // Destroy container and children
    this.destroy(true);
  }

  getDistanceToTarget(target: Hero | Crystal): number {
    const gameController = this.context.gameController!;

    const attackerTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return 0;
    }

    return getGridDistance(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col );
  }

  async move(targetTile: Tile): Promise<void> {
    const gameController = this.context.gameController!;

    const startTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    if (!startTile) return;

    await moveAnimation(this.context, this, targetTile);

    // Stomp KO'd units
    if (targetTile.hero && targetTile.hero.isKO) {
      const hero = gameController.board.units.find(unit => unit.unitId === targetTile.hero?.unitId);
      if (!hero) console.error('move() Found heroData on targetTile, but no Hero to remove', targetTile);
      hero?.removeFromGame();
    }

    // Check if the unit is leaving or entering a special tile and apply any effects
    this.specialTileCheck(startTile, targetTile);

    this.updatePosition(targetTile);
    targetTile.hero = this.exportData();
    targetTile.setOccupied(true);
    startTile.removeHero();

    gameController.afterAction(EActionType.MOVE, startTile.boardPosition, targetTile.boardPosition);
  }

  spawn(tile: Tile): void {
    const startingPosition = this.boardPosition;
    const gameController = this.context.gameController!;

    // Stomp KO'd units
    if (tile.hero && tile.hero.isKO) {
      const hero = gameController.board.units.find(unit => unit.unitId === tile.hero?.unitId);
      if (!hero) console.error('spawn() Found heroData on tile, but no Hero to remove', tile);
      hero?.removeFromGame();
    }

    gameController.hand.removeFromHand(this);
    gameController.board.units.push(this);

    // Flip image if player is player 2
    if (this.belongsTo === 2) (this.getByName('body') as Phaser.GameObjects.Image)?.setFlipX(true);
    // Position hero on the board
    this.updatePosition(tile);
    // Update tile data
    this.updateTileData();

    this.healthBar.setVisible(true);

    gameController.afterAction(EActionType.SPAWN, startingPosition, tile.boardPosition);
  }

  abstract attack(target: Hero | Crystal): void;
  abstract heal(target: Hero): void;
  abstract teleport(target: Hero): void;
  abstract equipFactionBuff(handPosition: number): void;

  isFullHP(): boolean {
    return this.maxHealth === this.currentHealth;
  }

  isAlreadyEquipped(item: Item): boolean {
    const map: Partial<Record<EItems, boolean>> = {
      [EItems.DRAGON_SCALE]: this.factionBuff,
      [EItems.SOUL_STONE]: this.factionBuff,
      [EItems.RUNE_METAL]: this.runeMetal,
      [EItems.SHINING_HELM]: this.shiningHelm,
      [EItems.SUPERCHARGE]: this.superCharge
    };

    return !!map[item.itemType];
  }

  equipShiningHelm(handPosition: number): void {
    this.shiningHelm = true;
    this.magicalDamageResistance += 20;

    this.increaseMaxHealth(this.maxHealth * 10 / 100);

    this.shiningHelmImage.setVisible(true);
    this.updateTileData();

    this.context.gameController?.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  equipRunemetal(handPosition: number): void {
    this.runeMetal = true;
    this.runeMetalImage.setVisible(true);
    this.power += this.power * 50 / 100;

    this.runeMetalImage.setVisible(true);
    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  equipSuperCharge(handPosition: number): void {
    this.superCharge = true;
    this.powerModifier += 300;

    // TODO: add visual effect
    this.updateTileData();

    this.superChargeAnim.setVisible(true);

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  specialTileCheck(currentTile: Tile, targetTile: Tile): void {
    const updateCrystals = (increase: boolean) => {
      this.context.gameController!.board.crystals.forEach(crystal => {
        console.log('crystal', crystal.boardPosition, crystal.debuffLevel);
        if (crystal.belongsTo !== this.belongsTo) {
          let newLevel: number = 0;

          if (increase) newLevel = crystal.debuffLevel + 1;
          if (!increase) newLevel = crystal.debuffLevel - 1;

          crystal.updateDebuffAnimation(newLevel);
        }
      });
    };

    // If hero is leaving a special tile
    if (currentTile.tileType === ETiles.CRYSTAL_DAMAGE) {
      updateCrystals(false);
      this.crystalDebuffTileAnim.setVisible(false);
    }
    if (currentTile.tileType === ETiles.POWER) {
      this.power -= 100;
      this.powerTileAnim.setVisible(false);
    }
    if (currentTile.tileType === ETiles.MAGICAL_RESISTANCE) {
      this.magicalDamageResistance -= 20;
      this.magicalResistanceTileAnim.setVisible(false);
    }
    if (currentTile.tileType === ETiles.PHYSICAL_RESISTANCE) {
      this.physicalDamageResistance -= 20;
      this.physicalResistanceTileAnim.setVisible(false);
    }

    // If hero is entering a special tile
    if (targetTile.tileType === ETiles.CRYSTAL_DAMAGE) {
      updateCrystals(true);
      this.crystalDebuffTileAnim.setVisible(true);
    }
    if (targetTile.tileType === ETiles.POWER) {
      this.power += 100;
      this.powerTileAnim.setVisible(true);
    }
    if (targetTile.tileType === ETiles.MAGICAL_RESISTANCE) {
      this.magicalDamageResistance += 20;
      this.magicalResistanceTileAnim.setVisible(true);
    }
    if (targetTile.tileType === ETiles.PHYSICAL_RESISTANCE) {
      this.physicalDamageResistance += 20;
      this.physicalResistanceTileAnim.setVisible(true);
    }
  }
}
