import { EActionType, EAttackType, EClass, EFaction, EGameSounds, EUnitTypes, EItems, ETiles, EEffect, EUnitEvent, EReticle } from "../enums/gameEnums";
import { IUnitData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { checkUnitGameOver, getAOETiles, getGridDistance, isEnemySpawn, moveAnimation, playSound, roundToFive, selectDeathSound } from "../utils/gameUtils";
import * as effects from "./effects";
import { FloatingText } from "./floatingText";
import { HealthBar } from "./healthBar";
import { UnitCard } from "./unitCard";
import { Tile } from "./tile";

export abstract class Unit extends Phaser.GameObjects.Container {
  class: EClass;
  faction: EFaction;
  type: EUnitTypes;
  unitId: string;
  boardPosition: [number, number];
  baseHealth: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  specialRange: number;
  attackType: EAttackType;
  basePower: number;
  powerMultiplier: Map<string, number> = new Map();
  physicalDamageResistance: number;
  basePhysicalDamageResistance: number;
  magicalDamageResistance: number;
  baseMagicalDamageResistance: number;
  isActive: boolean;
  belongsTo: number;
  canHeal: boolean;
  effects: effects.Effect[];

  specialReticle: EReticle;

  context: GameScene;
  unitCard: UnitCard;

  characterImage: Phaser.GameObjects.Image;
  runeMetalImage: Phaser.GameObjects.Image;
  shiningHelmImage: Phaser.GameObjects.Image;
  factionBuffImage: Phaser.GameObjects.Image;
  priestessDebuffImage?: Phaser.GameObjects.Image = undefined;
  annihilatorDebuffImage?: Phaser.GameObjects.Image = undefined;
  shieldImage?: Phaser.GameObjects.Image = undefined;
  crystalDebuffTileAnim: Phaser.GameObjects.Image;
  powerTileAnim: Phaser.GameObjects.Image;
  magicalResistanceTileAnim: Phaser.GameObjects.Image;
  physicalResistanceTileAnim: Phaser.GameObjects.Image;
  superChargeAnim?: Phaser.GameObjects.Image = undefined;
  reviveAnim: Phaser.GameObjects.Image;
  smokeAnim?: Phaser.GameObjects.Image = undefined;

  crystalDebuffEvent: Phaser.Time.TimerEvent;
  powerTileEvent: Phaser.Time.TimerEvent;
  magicalResistanceTileEvent: Phaser.Time.TimerEvent;
  physicalResistanceTileEvent: Phaser.Time.TimerEvent;
  superChargeEvent: Phaser.Time.TimerEvent;
  reviveEvent?: Phaser.Time.TimerEvent;
  smokeEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  healthBar: HealthBar;

  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    const { x, y } = context.centerPoints[JSON.stringify(data.boardPosition)];
    super(context, x, y);
    this.context = context;

    // Interface properties assignment
    this.class = data.class;
    this.faction = data.faction;
    this.type = data.type;
    this.unitId = data.unitId;
    this.boardPosition = data.boardPosition;
    this.baseHealth = data.baseHealth;
    this.maxHealth = data.baseHealth;
    this.currentHealth = data.baseHealth;
    this.isKO = false;
    this.lastBreath = false;
    this.movement = data.movement;
    this.attackRange = data.attackRange;
    this.specialRange = data.specialRange;
    this.attackType = data.attackType;
    this.basePower = data.currentPower;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.basePhysicalDamageResistance = data.basePhysicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.baseMagicalDamageResistance = data.baseMagicalDamageResistance;
    this.isActive = false;
    this.belongsTo = data.belongsTo;
    this.canHeal = data.canSpecial;
    this.effects = []; // Initialize empty array for effects

    this.specialReticle = EReticle.ALLY;


    this.unitCard = new UnitCard(context, {
      ...data,
      currentPower: this.getTotalPower()
    }).setVisible(false);

    this.healthBar = new HealthBar(context, data, -38, -75);
    if (this.boardPosition[0] === -1) this.healthBar.setVisible(false);

    // Create the unit's image and images for its upgrades
    const inHand = this.boardPosition[0] === -1;
    const { charImageX, charImageY } = this.positionUnitImage();
    this.characterImage = context.add.image(charImageX, charImageY, this.updateCharacterImage()).setOrigin(0.5).setName('body').setDepth(this.boardPosition[0] + 10);
    if (this.belongsTo === 2) this.characterImage.setFlipX(true);
    if (inHand) this.characterImage.setScale(0.8);

    this.runeMetalImage = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.4).setName('runeMetal').setVisible(!!this.hasEffect(EEffect.RUNE_METAL_EQUIPMENT));

    this.shiningHelmImage = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.4).setName('shiningHelm').setVisible(!!this.hasEffect(EEffect.HELM_EQUIPMENT));

    if (this.faction === EFaction.COUNCIL || EFaction.DWARVES) {
      this.factionBuffImage = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.4).setName('dragonScale').setVisible(!!this.hasEffect(EEffect.DRAGON_SCALE_EQUIPMENT));
    } else {
      this.factionBuffImage = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.4).setName('soulStone').setVisible(!!this.hasEffect(EEffect.SOUL_STONE_EQUIPMENT));
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined

    if (this.faction === EFaction.COUNCIL) {
      this.smokeAnim = context.add.image(0, 0, 'smokeAnim_1').setOrigin(0.5).setScale(2.5).setVisible(false).setTint(0x393D47);
    }

    // Add special tile and character animations
    this.crystalDebuffTileAnim = context.add.image(0, 30, 'crystalDamageAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.CRYSTAL_DAMAGE && !this.isKO);
    this.crystalDebuffEvent = this.continuousEvent(this.crystalDebuffTileAnim, ['crystalDamageAnim_1', 'crystalDamageAnim_2', 'crystalDamageAnim_3']);

    this.powerTileAnim = context.add.image(0, 27, 'powerTileAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.POWER && !this.isKO);
    this.powerTileEvent = this.continuousEvent(this.powerTileAnim, ['powerTileAnim_1', 'powerTileAnim_2', 'powerTileAnim_3']);

    this.magicalResistanceTileAnim = context.add.image(0, 30, 'magicalResistanceAnim_1').setOrigin(0.5).setScale(0.6).setVisible((tile?.tileType === ETiles.MAGICAL_RESISTANCE || tile?.tileType === ETiles.SPEED) && !this.isKO);
    this.magicalResistanceTileEvent = this.continuousEvent(this.magicalResistanceTileAnim, ['magicalResistanceAnim_1', 'magicalResistanceAnim_2', 'magicalResistanceAnim_3']);

    this.physicalResistanceTileAnim = context.add.image(0, 30, 'physicalResistanceAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.PHYSICAL_RESISTANCE && !this.isKO);
    this.physicalResistanceTileEvent = this.continuousEvent(this.physicalResistanceTileAnim, ['physicalResistanceAnim_1', 'physicalResistanceAnim_2', 'physicalResistanceAnim_3']);

    this.superChargeAnim = context.add.image(0, -18, 'superChargeAnim_1').setOrigin(0.5).setScale(0.8).setVisible(false);

    this.superChargeEvent = this.continuousEvent(this.superChargeAnim, ['superChargeAnim_1', 'superChargeAnim_2', 'superChargeAnim_3']);

    this.reviveAnim = context.add.image(0, -10, 'reviveAnim_1').setOrigin(0.5).setScale(0.7).setVisible(false);

    // Set hitbox
    // Add all individual images to container
    this.add([
      this.superChargeAnim,
      this.reviveAnim,
      this.characterImage,
      this.runeMetalImage,
      this.factionBuffImage,
      this.shiningHelmImage,
      this.healthBar,
      this.crystalDebuffTileAnim,
      this.powerTileAnim,
      this.magicalResistanceTileAnim,
      this.physicalResistanceTileAnim,
      ...this.smokeAnim ? [this.smokeAnim] : [],
      this.unitCard
    ]).setName(this.unitId).setDepth(this.boardPosition[0] + 10);

    // Hide if in deck
    if (this.boardPosition[0] === -1 && this.boardPosition[1] === 6) this.setVisible(false);

    context.add.existing(this);

    // Initialize effect visuals
    this.priestessDebuffImage = context.add.image(0, -10, 'priestessDebuff').setOrigin(0.5).setScale(2.5).setName('priesetessDebuff').setVisible(false);
    this.annihilatorDebuffImage = context.add.image(0, -10, 'annihilatorDebuff').setOrigin(0.5).setName('annihilatorDebuff').setVisible(false);
    this.shieldImage = context.add.image(0, -10, 'shield').setOrigin(0.5).setName('shield').setVisible(false);
    // this.add([this.priestessDebuffImage, this.annihilatorDebuffImage, this.shieldImage]); // Removed from here

    // Initialize effects from data
    data.effects?.forEach(effectData => {
      if (effectData.name === EEffect.CRYSTAL_TILE_EFFECT) this.applyEffect(new effects.CrystalTileEffect(this.context, this, effectData.potency));
      else this.applyEffect(effectData.name);
    });
  }

  updatePosition(tile: Tile): void {
    const { x, y } = this.context.centerPoints[JSON.stringify(tile.boardPosition)];
    this.x = x;
    this.y = y;
    this.boardPosition = tile.boardPosition;
    this.setDepth(tile.boardPosition[0] + 10);
    tile.unit = this
  }

  exportData(): IUnitData {
    return {
      class: this.class,
      faction: this.faction,
      type: this.type,
      unitId: this.unitId,
      boardPosition: this.boardPosition,
      baseHealth: this.baseHealth,
      basePower: this.basePower,
      currentPower: this.basePower,
      movement: this.movement,
      attackRange: this.attackRange,
      specialRange: this.specialRange,
      effects: this.effects.map(effect => effect.exportData()),
      belongsTo: this.belongsTo,
      canSpecial: this.canHeal,
      attackType: this.attackType,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth,
      isKO: this.isKO,
      lastBreath: this.lastBreath,
      basePhysicalDamageResistance: this.basePhysicalDamageResistance,
      baseMagicalDamageResistance: this.baseMagicalDamageResistance,
      physicalDamageResistance: this.basePhysicalDamageResistance,
      magicalDamageResistance: this.baseMagicalDamageResistance,
    };
  }

  positionUnitImage(): { charImageX: number, charImageY: number } {
    let charImageX = 5;
    let charImageY = -15;

    switch (this.type) {
      case EUnitTypes.NECROMANCER:
        charImageX = 5;
        charImageY = 10;
        break;
      default:
        break;
    }
    if (this.isKO) charImageY = 30;
    return { charImageX, charImageY };
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

  getsDamaged(damage: number, attackType: EAttackType, pushed = false): number {
    // Flash the unit red
    this.characterImage.setTint(0xff0000);
    this.scene.time.delayedCall(500, () => this.characterImage.clearTint());

    // Calculate damage after applying resistances
    const totalDamage = roundToFive(this.getLifeLost(damage, attackType));

    let triggers = []

    if (attackType === EAttackType.MAGICAL) triggers.push(EUnitEvent.HURT_MAGICAL)
    else if (attackType === EAttackType.PHYSICAL) triggers.push(EUnitEvent.HURT_PHYSICAL)
    if (pushed) triggers.push(EUnitEvent.PUSHED);
    this.effectEvent(triggers);

    this.currentHealth -= totalDamage;

    if (this.currentHealth <= 0) this.getsKnockedDown();

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show damage numbers
    if (totalDamage > 0) new FloatingText(this.context, this.x, this.y - 50, totalDamage.toString());

    this.unitCard.updateCardData({ ...this.exportData(), currentPower: this.exportData().currentPower ?? 0 });

    if (this instanceof Unit && this.isKO && this.type === EUnitTypes.PHANTOM) this.removeFromGame();

    return totalDamage; // Return damage taken for lifesteal
  }

  getTotalPower(rangeModifier = 1): number {
    /**
     * Calculation order:
     * - base attack power
     * - range modifiers (archer, ninja)
     * - assault tile bonus
     * - any other multiplicative modifier from the powerMultipliers Map
     * - paladin aura
     */

    let totalPower = this.basePower;

    this.powerMultiplier.forEach(multiplier => {
      totalPower *= multiplier;
    });

    totalPower *= rangeModifier;

    return totalPower
  }

  getLifeLost(damage: number, attackType: EAttackType) {
    const resistance = {
      [EAttackType.MAGICAL]: this.magicalDamageResistance,
      [EAttackType.PHYSICAL]: this.physicalDamageResistance
    };

    const reduction = resistance[attackType];

    const totalDamage = reduction ? Math.max(0, damage - damage * reduction / 100) : damage;
    return totalDamage > this.currentHealth ? this.currentHealth : totalDamage;
  }

  getTotalHealing(unitHealingMult: number): number {
    const runeMetalBuff = this.runeMetalImage.visible ? 1.5 : 1;

    return this.basePower * unitHealingMult * runeMetalBuff;
  }

  getsHealed(healing: number, addText = true): number | undefined {
    if (healing <= 0) return;

    this.effectEvent(EUnitEvent.HEALED);

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
    if (actualHealing > 0 && addText) new FloatingText(this.context, this.x, this.y - 50, actualHealing.toString(), true);

    if (this.isKO) this.getsRevived();

    this.unitCard.updateCardData({ ...this.exportData(), currentPower: this.exportData().currentPower ?? 0 });

    return actualHealing;
  }

  private getsRevived(): void {
    this.reviveEvent = this.singleEvent(this.reviveAnim, ['reviveAnim_1', 'reviveAnim_2', 'reviveAnim_3'], 150);

    this.isKO = false;
    this.lastBreath = false;
    this.characterImage.setTexture(this.updateCharacterImage());
    const { charImageX, charImageY } = this.positionUnitImage();
    this.specialTileCheck(this.getTile());

    this.characterImage.x = charImageX;
    this.characterImage.y = charImageY;
  }

  increaseMaxHealth(amount: number, addText = true): void {
    if (amount <= 0) return;
    if (this.isKO) this.getsRevived(); // for Soul Harvest

    const roundedHealtGain = roundToFive(amount);
    this.maxHealth += roundedHealtGain;
    this.currentHealth += roundedHealtGain;

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show healing numbers
    if (addText) new FloatingText(this.context, this.x, this.y - 50, amount.toString(), true);

    this.unitCard.updateCardData({ ...this.exportData(), currentPower: this.exportData().currentPower ?? 0 });
  }

  healAndIncreaseHealth(healing: number, increase: number): void {
    const actualHealing = this.getsHealed(healing, false);
    this.increaseMaxHealth(increase, false);

    // Show total number
    const textFigure = actualHealing ? actualHealing + increase : increase;
    new FloatingText(this.context, this.x, this.y - 50, textFigure.toString(), true);
  };

  getsKnockedDown(): void {
    if (this.type !== EUnitTypes.PHANTOM) selectDeathSound(this.scene, this.type);
    this.removeSpecialTileOnKo();

    this.currentHealth = 0;
    this.isKO = true;

    this.characterImage.setTexture(this.updateCharacterImage());
    const { charImageX, charImageY } = this.positionUnitImage();
    this.characterImage.x = charImageX;
    this.characterImage.y = charImageY;

    checkUnitGameOver(this.context, this);
  }

  getTile(): Tile {
    const tile = this.context.gameController.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  shuffleInDeck(): void {
    this.boardPosition = [-1, 6];

    const unitData = this.exportData();

    this.context.gameController.hand.removeFromHand(unitData);
    this.context.gameController.deck.addToDeck(unitData);

    this.removeFromGame(false);
  }

  removeFromGame(board = true): void {
    // Remove animations
    this.scene.tweens.killTweensOf(this);

    this.list.forEach(child => {
      this.scene.tweens.killTweensOf(child);
    });

    // Remove events
    this.crystalDebuffEvent.remove(false);
    this.powerTileEvent.remove(false);
    this.magicalResistanceTileEvent.remove(false);
    this.physicalResistanceTileEvent.remove(false);
    this.superChargeEvent.remove(false);
    if (this.spawnEvent) this.spawnEvent?.remove(false);

    if (board) this.removeFromBoard();

    // Destroy container and children
    this.destroy(true);
  }

  removeFromBoard(): void {
    // Remove unit data from tile
    const tile = this.getTile();
    tile.removeUnit();

    // Remove unit from board array
    const index = this.context.gameController.board.units.findIndex(unit => unit.unitId === this.unitId);
    if (index !== -1) { this.context.gameController.board.units.splice(index, 1); }

    checkUnitGameOver(this.context, this);
  }

  getDistanceToTarget(target: Unit): number {
    const gameController = this.context.gameController;

    const attackerTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return 0;
    }

    return getGridDistance(attackerTile.boardPosition[0], attackerTile.boardPosition[1], targetTile.boardPosition[0], targetTile.boardPosition[1] );
  }

  async move(targetTile: Tile): Promise<void> {
    const gameController = this.context.gameController;

    playSound(this.context, EGameSounds.UNIT_MOVE);
    playSound(this.context, EGameSounds.MOVE_WALK);

    this.effectEvent(EUnitEvent.MOVE);

    const startTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    if (!startTile) return;

    await moveAnimation(this.context, this, targetTile);

    // Stomp KO'd units
    if (targetTile.unit && targetTile.unit.isKO) {
      const unit = gameController.board.units.find(unit => unit.unitId === targetTile.unit?.unitId);
      if (!unit) console.error('move() Found unitData on targetTile, but no Unit to remove', targetTile);
      playSound(this.context, EGameSounds.UNIT_STOMP);
      unit?.removeFromGame(true);
    }

    // Check if the unit is leaving or entering a special tile and apply any effects
    this.specialTileCheck(targetTile);
    this.updatePosition(targetTile);
    startTile.removeUnit();

    gameController.afterAction(EActionType.MOVE, startTile.boardPosition, targetTile.boardPosition);
  }

  spawn(tile: Tile): void {
    const startingPosition = this.boardPosition;
    const gameController = this.context.gameController;

    // Stomp KO'd units and enemy phantoms
    if (tile.unit && (tile.unit.isKO || tile.unit.type === EUnitTypes.PHANTOM)) {
      const unit = gameController.board.units.find(unit => unit.unitId === tile.unit?.unitId);
      if (!unit) console.error('spawn() Found unitData on tile, but no Unit to remove', tile);
      playSound(this.context, EGameSounds.UNIT_STOMP);
      unit?.removeFromGame(true);
    }


    gameController.hand.removeFromHand(this.exportData());
    gameController.board.units.push(this);

    // Modify image
    this.characterImage.setScale(1);
    const { charImageX, charImageY } = this.positionUnitImage();
    this.characterImage.x = charImageX;
    this.characterImage.y = charImageY;
    this.setDepth(tile.boardPosition[0] + 10);
    // Flip image if player is player 2

    // Update vertical positioning of the info card
    this.unitCard.y = 0;
    // A Wraith can spawn on a special tile. Phantom spawning is handled within its class
    this.specialTileCheck(tile);
    // Position unit on the board
    this.updatePosition(tile);

    this.healthBar.setVisible(true);

    playSound(this.context, EGameSounds.UNIT_SPAWN);

    gameController.afterAction(EActionType.SPAWN, startingPosition, tile.boardPosition);
  }

  abstract attack(target: Tile): void;
  special(_target: Tile): void {
    this.effectEvent(EUnitEvent.SPECIAL);
  };
  abstract equipFactionBuff(handPosition: number): void;

  isFullHP(): boolean {
    return this.maxHealth === this.currentHealth;
  }

  isAlreadyEquipped(item: EItems): boolean {
    const map: Partial<Record<EItems, boolean>> = {
      [EItems.DRAGON_SCALE]: !!this.hasEffect(EEffect.DRAGON_SCALE_EQUIPMENT),
      [EItems.SOUL_STONE]: !!this.hasEffect(EEffect.SOUL_STONE_EQUIPMENT),
      [EItems.RUNE_METAL]: !!this.hasEffect(EEffect.RUNE_METAL_EQUIPMENT),
      [EItems.SHINING_HELM]: !!this.hasEffect(EEffect.HELM_EQUIPMENT),
      [EItems.SUPERCHARGE]: !!this.hasEffect(EEffect.SUPERCHARGED_BUFF),
    };
    return !!map[item];
  }  

  specialTileCheck(targetTile: Tile, sound = true): void {
    const targetType = targetTile.tileType;

    // If unit is entering a special tile
    switch (targetType) {
      case ETiles.CRYSTAL_DAMAGE:
        this.applyEffect(new effects.CrystalTileEffect(this.context, this));
        if (sound) playSound(this.scene, EGameSounds.CRYSTAL_TILE);
        break;
      case ETiles.POWER:
        this.applyEffect(new effects.PowerTileEffect(this.context, this));
        if (sound) playSound(this.scene, EGameSounds.SWORD_TILE);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.applyEffect(new effects.MagicalTileEffect(this.context, this));
        if (sound) playSound(this.scene, EGameSounds.HELM_TILE);
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.applyEffect(new effects.PhysicalTileEffect(this.context, this));
        if (sound) playSound(this.scene, EGameSounds.SHIELD_TILE);
        break;
      case ETiles.SPEED:
        this.applyEffect(new effects.SpeedTileEffect(this.context, this));
        if (sound) playSound(this.scene, EGameSounds.HELM_TILE);
        break;
    }

    // check for new auras
    const unitTiles = getAOETiles(this.context, this, targetTile, true).unitTiles;
    unitTiles.forEach(tile => {
      const unit = this.context.gameController.board.units.find(u => u.boardPosition === tile.boardPosition)
      if (unit && !unit.isKO && unit.type === EUnitTypes.PALADIN && unit !== this) {
        this.applyEffect(new effects.PaladinBuff(this.context, this));
      }
    });

    this.unitCard.updateCardData({ ...this.exportData(), currentPower: this.exportData().currentPower ?? 0 });
  }

  removeSpecialTileOnKo(): void {
    const currentType = this.getTile().tileType;

    switch (currentType) {
      case ETiles.CRYSTAL_DAMAGE:
        this.removeEffect(EEffect.POWER_TILE_BUFF)
        break;
      case ETiles.POWER:
        this.removeEffect(EEffect.POWER_TILE_BUFF)
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.removeEffect(EEffect.MAGICAL_TILE_BUFF)
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.removeEffect(EEffect.PHYSICAL_TILE_BUFF)
        break;
      case ETiles.SPEED:
        this.removeEffect(EEffect.MAGICAL_TILE_BUFF)
        break;
    }
  }

  showSpawn(): void {
    playSound(this.context, EGameSounds.UNIT_HAND_SELECT);
    const spawns = new Set<Tile>();
    const board = this.context.gameController.board
    board.tiles.forEach(row => row.forEach(tile => {
      const enemySpawn = isEnemySpawn(this.context, tile);
      if (tile.tileType === ETiles.SPAWN && !enemySpawn){
        if (!tile.unit) spawns.add(tile);
        if (tile.unit instanceof Unit && tile.unit?.isKO) spawns.add(tile);
        if (tile.unit instanceof Unit && tile.unit?.type === EUnitTypes.PHANTOM) spawns.add(tile);
      }
    }));

    spawns.forEach(spawn => spawn.setHighlight(EReticle.MOVE, this, this.spawn));
  }

  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    if (this.getTile().tileType == ETiles.TELEPORTER) {
      board.tiles.forEach(row => row.forEach(tile => {  
        if (tile.tileType == ETiles.TELEPORTER && tile != this.getTile()) {
          moveTiles.push(tile)
        }
      }));
    }
    const [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    const specialTiles: Tile[] = [];

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
}

  showActions(): void {
    const { moveTiles, attackTiles, LOSBlocked, specialTiles } = this._calculateActionTiles();

    if (moveTiles || attackTiles || specialTiles) { // only play if it can take actions
      playSound(this.context, EGameSounds.UNIT_BOARD_SELECT);
      this.context.thinkingTune.play();
    }

    moveTiles.forEach(tile => tile.setHighlight(EReticle.MOVE, this, this.move));
    attackTiles.forEach(tile => tile.setHighlight(EReticle.ATTACK, this, this.attack));
    specialTiles.forEach(tile => tile.setHighlight(this.specialReticle, this, this.special));
    LOSBlocked.forEach(tile => tile.setHighlight(EReticle.BLOCKED, this, undefined));
  }

  updateCharacterImage(): string {
    if (this.type === EUnitTypes.PHANTOM) return 'phantom_1';

    if (this.isKO) return `${this.type}_9`;

    const hasRune = this.hasEffect(EEffect.RUNE_METAL_EQUIPMENT);
    const hasSoul = this.hasEffect(EEffect.SOUL_STONE_EQUIPMENT);
    const hasHelm = this.hasEffect(EEffect.HELM_EQUIPMENT);
    
    if (hasRune && hasSoul && hasHelm) return `${this.type}_8`;
    if (hasRune && hasHelm) return `${this.type}_7`;
    if (hasSoul && hasHelm) return `${this.type}_6`;
    if (hasSoul && hasRune) return `${this.type}_5`;
    if (hasSoul) return `${this.type}_4`;
    if (hasHelm) return `${this.type}_3`;
    if (hasRune) return `${this.type}_2`;

    return `${this.type}_1`;
  }

  flashActingUnit(): void {
    // Flash the unit blue to better identify which unit is attacking / healing on a replay
    this.characterImage.setTint(0x3399ff);
    this.scene.time.delayedCall(800, () => this.characterImage.clearTint());
  }

  effectEvent(trigger: EUnitEvent[] | EUnitEvent) {
    this.effects.sort((a, b) => a.priority - b.priority);
    if (!Array.isArray(trigger)){
      trigger = [trigger]
    }

    for (const effect of this.effects) {
       // effects can prevent other effects from applying (eg. shield)
      if (effect.onEvent(trigger)) break;
    }
  }

  // Effect management methods
applyEffect(effect: effects.Effect | EEffect): void {
  if (!(effect instanceof effects.Effect)) {
    // A map to link EEffect enum values to their corresponding Effect classes
    const effectMap = new Map<EEffect, new (context: any, owner: any) => effects.Effect>([
      [EEffect.RUNE_METAL_EQUIPMENT, effects.RuneMetalEquipment],
      [EEffect.DRAGON_SCALE_EQUIPMENT, effects.DragonScaleEquipment],
      [EEffect.HELM_EQUIPMENT, effects.HelmEquipment],
      [EEffect.SOUL_STONE_EQUIPMENT, effects.SoulStoneEquipment],
      [EEffect.MANA_VIAL_BUFF, effects.ManaVialEquipment],
      [EEffect.SUPERCHARGED_BUFF, effects.SuperChargeBuff],
      [EEffect.PHYSICAL_TILE_BUFF, effects.PhysicalTileEffect],
      [EEffect.MAGICAL_TILE_BUFF, effects.MagicalTileEffect],
      [EEffect.POWER_TILE_BUFF, effects.PowerTileEffect],
      [EEffect.SPEED_TILE_BUFF, effects.SpeedTileEffect],
      [EEffect.PALADIN_BUFF, effects.PaladinBuff],
      [EEffect.DRUNK_BUFF, effects.dwarvernBrewEquipment],
      [EEffect.CRYSTAL_TILE_EFFECT, effects.CrystalTileEffect],
      [EEffect.CONSUME_BUFF, effects.ConsumeBuff],
      [EEffect.SHIELD_BUFF, effects.ShiledBuff],
      [EEffect.PRIESTESS_DEBUFF, effects.PriestessDebuffEffect],
      [EEffect.ANNIHILATOR_DEBUFF, effects.AnnihilatorDebuffEffect],
    ]);

    const EffectClass = effectMap.get(effect as EEffect);
    if (EffectClass) {
      effect = new EffectClass(this.context, this);
    } else {
      console.error(`Unknown effect: ${effect}`);
      return; // Stop execution if the effect is unknown
    }
  }

  effect.apply();
  this.effects.push(effect);
}

  removeEffect(targetEffect: effects.Effect | EEffect, all = true): void {
    if (typeof targetEffect === 'object') {
      this.effects = this.effects.filter(effect => effect !== targetEffect);
      targetEffect.remove();
    } else {
      if (all) {
        const effectsToRemove = this.effects.filter(effect => effect.name === targetEffect);
        effectsToRemove.forEach(effect => effect.remove());
        this.effects = this.effects.filter(effect => effect.name !== targetEffect);
      } else {
        const indexToRemove = this.effects.findIndex(effect => effect.name === targetEffect);
        if (indexToRemove !== -1) {
          const [effectToRemove] = this.effects.splice(indexToRemove, 1);
          if (effectToRemove) {
            effectToRemove.remove();
          }
        }
      }
    }
  }

  hasEffect(targetEffect: EEffect[] | EEffect): number {
    const effectsToCheck = Array.isArray(targetEffect) ? targetEffect : [targetEffect];
    
    // Use a Set for efficient lookup of target effect names
    const targetNames = new Set(effectsToCheck.map(e => e));

    // Filter the current effects to find matches and return the count
    return this.effects.filter(currentEffect => targetNames.has(currentEffect.name)).length;
  }

  // overloads for different typings based on parameters
  getEffect(targetEffect: EEffect, all?: false): effects.Effect | undefined;
  getEffect(targetEffect: EEffect, all: true): effects.Effect[];
  getEffect(targetEffect: EEffect, all = false): effects.Effect[] | effects.Effect | undefined {
    if (all) return this.effects.filter(effect => effect.name === targetEffect);
    return this.effects.find(effect => effect.name === targetEffect);    
  }
}
