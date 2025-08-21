import { EActionType, EAttackType, EClass, EFaction, EGameSounds, EHeroes, EItems, ETiles } from "../enums/gameEnums";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { checkUnitGameOver, getAOETiles, getGridDistance, isInHand, moveAnimation, playSound, roundToFive, selectDeathSound, useAnimation } from "../utils/gameUtils";
import { positionHeroImage } from "../utils/heroImagePosition";
import { makeUnitClickable } from "../utils/makeUnitClickable";
import { Crystal } from "./crystal";
import { FloatingText } from "./floatingText";
import { HealthBar } from "./healthBar";
import { HeroCard } from "./heroCard";
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
  baseHealth: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  healingRange: number;
  attackType: EAttackType;
  basePower: number;
  physicalDamageResistance: number;
  basePhysicalDamageResistance: number;
  magicalDamageResistance: number;
  baseMagicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  superCharge: boolean;
  attackTile: number;
  isActiveValue: boolean;
  belongsTo: number;
  canHeal: boolean;
  unitsConsumed: number;
  priestessDebuff: boolean;
  annihilatorDebuff: boolean;
  isShielded: boolean;
  isDrunk: boolean;
  paladinAura: number;
  manaVial?: boolean;
  speedTile?: number;

  context: GameScene;
  unitCard: HeroCard;

  characterImage: Phaser.GameObjects.Image;
  runeMetalImage: Phaser.GameObjects.Image;
  shiningHelmImage: Phaser.GameObjects.Image;
  factionBuffImage: Phaser.GameObjects.Image;
  attackReticle: Phaser.GameObjects.Image;
  healReticle: Phaser.GameObjects.Image;
  allyReticle: Phaser.GameObjects.Image;
  blockedLOS: Phaser.GameObjects.Image;
  priestessDebuffImage: Phaser.GameObjects.Image;
  annihilatorDebuffImage: Phaser.GameObjects.Image;
  shieldImage: Phaser.GameObjects.Image;
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

  constructor(context: GameScene, data: IHero, tile?: Tile) {
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
    this.baseHealth = data.baseHealth;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.isKO = data.isKO;
    this.lastBreath = data.lastBreath;
    this.movement = data.movement;
    this.attackRange = data.attackRange;
    this.healingRange = data.healingRange;
    this.attackType = data.attackType;
    this.basePower = data.basePower;
    this.physicalDamageResistance = data.physicalDamageResistance;
    this.basePhysicalDamageResistance = data.basePhysicalDamageResistance;
    this.magicalDamageResistance = data.magicalDamageResistance;
    this.baseMagicalDamageResistance = data.baseMagicalDamageResistance;
    this.factionBuff = data.factionBuff;
    this.runeMetal = data.runeMetal;
    this.shiningHelm = data.shiningHelm;
    this.superCharge = data.superCharge;
    this.attackTile = data.attackTile;
    this.isActiveValue = false;
    this.belongsTo = data.belongsTo ?? 1;
    this.canHeal = data.canHeal ?? false;
    this.unitsConsumed = data.unitsConsumed ?? 0;
    this.priestessDebuff = data.priestessDebuff ?? false;
    this.annihilatorDebuff = data.annihilatorDebuff ?? false;
    this.isShielded = data.isShielded ?? false;
    this.isDrunk = data.isDrunk ?? false;
    this.paladinAura = data.paladinAura ?? 0;
    this.manaVial = data?.manaVial ?? undefined;
    this.speedTile = data.speedTile;

    this.unitCard = new HeroCard(context, {
      ...data,
      currentPower: this.getTotalPower()
    }).setVisible(false);

    this.healthBar = new HealthBar(context, data, -38, -75);
    if (this.boardPosition >= 45) this.healthBar.setVisible(false);

    // Create the unit's image and images for its upgrades
    const inHand = isInHand(this.boardPosition);
    const { charImageX, charImageY } = positionHeroImage(this.unitType, this.belongsTo === 1, inHand, data.isKO);
    this.characterImage = context.add.image(charImageX, charImageY, this.updateCharacterImage()).setOrigin(0.5).setName('body').setDepth(this.row + 10);
    if (inHand) this.characterImage.setScale(0.8);
    if (this.belongsTo === 2 && this.boardPosition < 45) this.characterImage.setFlipX(true);

    this.runeMetalImage = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.4).setName('runeMetal').setVisible(this.runeMetal);
    if (!this.runeMetal) this.runeMetalImage.setVisible(false);

    this.shiningHelmImage = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.4).setName('shiningHelm');
    if (!this.shiningHelm) this.shiningHelmImage.setVisible(false);

    if (this.faction === EFaction.COUNCIL || EFaction.DWARVES) {
      this.factionBuffImage = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.4).setName('dragonScale').setVisible(this.factionBuff);
    } else {
      this.factionBuffImage = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.4).setName('soulStone').setVisible(this.factionBuff);
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined

    if (this.faction === EFaction.COUNCIL) {
      this.smokeAnim = context.add.image(0, 0, 'smokeAnim_1').setOrigin(0.5).setScale(2.5).setVisible(false).setTint(0x393D47);
    }

    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setName('attackReticle').setVisible(false);
    this.healReticle = context.add.image(0, -10, 'healReticle').setOrigin(0.5).setScale(0.8).setName('healReticle').setVisible(false);
    this.allyReticle = context.add.image(0, -10, 'allyReticle').setOrigin(0.5).setScale(0.6).setName('allyReticle').setVisible(false);
    this.priestessDebuffImage = context.add.image(0, -10, 'priestessDebuff').setOrigin(0.5).setScale(2.5).setName('priesetessDebuff').setVisible(this.priestessDebuff);
    this.annihilatorDebuffImage = context.add.image(0, -10, 'annihilatorDebuff').setOrigin(0.5).setName('annihilatorDebuff').setVisible(this.annihilatorDebuff);
    this.shieldImage = context.add.image(0, -10, 'shield').setOrigin(0.5).setName('shield').setVisible(this.isShielded);

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
    addCirclingTween(this.priestessDebuffImage);

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
    this.crystalDebuffTileAnim = context.add.image(0, 30, 'crystalDamageAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.CRYSTAL_DAMAGE && !this.isKO);
    this.crystalDebuffEvent = this.continuousEvent(this.crystalDebuffTileAnim, ['crystalDamageAnim_1', 'crystalDamageAnim_2', 'crystalDamageAnim_3']);

    this.powerTileAnim = context.add.image(0, 27, 'powerTileAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.POWER && !this.isKO);
    this.powerTileEvent = this.continuousEvent(this.powerTileAnim, ['powerTileAnim_1', 'powerTileAnim_2', 'powerTileAnim_3']);

    this.magicalResistanceTileAnim = context.add.image(0, 30, 'magicalResistanceAnim_1').setOrigin(0.5).setScale(0.6).setVisible((tile?.tileType === ETiles.MAGICAL_RESISTANCE || tile?.tileType === ETiles.SPEED) && !this.isKO);
    this.magicalResistanceTileEvent = this.continuousEvent(this.magicalResistanceTileAnim, ['magicalResistanceAnim_1', 'magicalResistanceAnim_2', 'magicalResistanceAnim_3']);

    this.physicalResistanceTileAnim = context.add.image(0, 30, 'physicalResistanceAnim_1').setOrigin(0.5).setScale(0.6).setVisible(tile?.tileType === ETiles.PHYSICAL_RESISTANCE && !this.isKO);
    this.physicalResistanceTileEvent = this.continuousEvent(this.physicalResistanceTileAnim, ['physicalResistanceAnim_1', 'physicalResistanceAnim_2', 'physicalResistanceAnim_3']);

    this.superChargeAnim = context.add.image(0, -18, 'superChargeAnim_1').setOrigin(0.5).setScale(0.8).setVisible(this.superCharge);

    this.superChargeEvent = this.continuousEvent(this.superChargeAnim, ['superChargeAnim_1', 'superChargeAnim_2', 'superChargeAnim_3']);

    this.reviveAnim = context.add.image(0, -10, 'reviveAnim_1').setOrigin(0.5).setScale(0.7).setVisible(false);

    // Set hitbox
    const hitArea = new Phaser.Geom.Rectangle(-35, -50, 75, 85); // centered on (0,0)
    // Add all individual images to container
    this.add([
      this.priestessDebuffImage,
      this.annihilatorDebuffImage,
      this.shieldImage,
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
      this.attackReticle,
      this.healReticle,
      this.allyReticle,
      ...this.smokeAnim ? [this.smokeAnim] : [],
      this.blockedLOS,
      this.unitCard
    ]).setInteractive({
      hitArea,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    }).setName(this.unitId).setDepth(this.row + 10);

    // Hide if in deck
    if (this.boardPosition === 51) this.setVisible(false);

    makeUnitClickable(this, context);

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
    this.setDepth(this.row + 10);
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
      baseHealth: this.baseHealth,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      isKO: this.isKO,
      lastBreath: this.lastBreath,
      movement: this.movement,
      attackRange: this.attackRange,
      healingRange: this.healingRange,
      attackType: this.attackType,
      basePower: this.basePower,
      physicalDamageResistance: this.physicalDamageResistance,
      basePhysicalDamageResistance: this.basePhysicalDamageResistance,
      magicalDamageResistance: this.magicalDamageResistance,
      baseMagicalDamageResistance: this.baseMagicalDamageResistance,
      factionBuff: this.factionBuff,
      runeMetal: this.runeMetal,
      shiningHelm: this.shiningHelm,
      superCharge: this.superCharge,
      attackTile: this.attackTile,
      belongsTo: this.belongsTo,
      canHeal: this.canHeal,
      unitsConsumed: this.unitsConsumed,
      priestessDebuff: this.priestessDebuff,
      annihilatorDebuff: this.annihilatorDebuff,
      isShielded: this.isShielded,
      paladinAura: this.paladinAura,
      isDrunk: this.isDrunk,
      manaVial: this.manaVial,
      speedTile: this.speedTile
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
    this.characterImage.setTint(0xff0000);
    this.scene.time.delayedCall(500, () => this.characterImage.clearTint());

    // Calculate damage after applying resistances
    const totalDamage = roundToFive(this.getLifeLost(damage, attackType));

    this.currentHealth -= totalDamage;

    if (this.currentHealth <= 0) this.getsKnockedDown();

    // Update hp bar
    this.healthBar.setHealth(this.maxHealth, this.currentHealth);

    // Show damage numbers
    if (totalDamage > 0) new FloatingText(this.context, this.x, this.y - 50, totalDamage.toString());

    this.unitCard.updateCardData(this);
    this.updateTileData();

    if (this instanceof Hero && this.isKO && this.unitType === EHeroes.PHANTOM) this.removeFromGame();

    return totalDamage; // Return damage taken for lifesteal
  }

  getTotalPower(rangeModifier = 1): number {
    /**
     * Calculation order:
     * - base attack power
     * - range modifiers (archer, ninja)
     * - assault tile bonus
     * - any other multiplicative modifier (scroll, debuff, runemetal)
     */
    if (rangeModifier === 0) rangeModifier = 1;
    const runeMetalBuff = this.runeMetal ? 1.5 : 1;
    const attackTileBuff = this.attackTile;
    const superCharge = this.superCharge ? 3 : 1;
    const priestessDebuff = this.priestessDebuff ? 0.5 : 1;
    const paladinAura = (this.paladinAura * 0.05) + 1;

    return (this.basePower + attackTileBuff) * paladinAura * rangeModifier * superCharge * priestessDebuff * runeMetalBuff;
  }

  getLifeLost(damage: number, attackType: EAttackType) {
    const resistance = {
      [EAttackType.MAGICAL]: this.magicalDamageResistance,
      [EAttackType.PHYSICAL]: this.physicalDamageResistance
    };

    if (this.isShielded) {
      this.isShielded = false;
      this.shieldImage.setVisible(false);
      return 0
    } else if (this.isDrunk) {
      this.physicalDamageResistance -= 50;
      this.magicalDamageResistance -= 50;
      this.isDrunk = false;
      //this.drunkImage.setVisible(false);
    }
    if (this.annihilatorDebuff && attackType === EAttackType.PHYSICAL) {
      this.physicalDamageResistance += 50;
      this.annihilatorDebuff = false;
      this.annihilatorDebuffImage.setVisible(false);
    }

    const reduction = resistance[attackType];

    const totalDamage = resistance ? damage - damage * reduction / 100 : damage;
    return totalDamage > this.currentHealth ? this.currentHealth : totalDamage;
  }

  getTotalHealing(unitHealingMult: number): number {
    const runeMetalBuff = this.runeMetal ? 1.5 : 1;
    const attackTileBuff = this.attackTile;
    const superCharge = this.superCharge ? 3 : 1;
    const priestessDebuff = this.priestessDebuff ? 0.5 : 1;

    return (this.basePower + attackTileBuff) * unitHealingMult * superCharge * priestessDebuff * runeMetalBuff;
  }

  getsHealed(healing: number, addText = true): number | undefined {
    if (healing <= 0) return;

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

    this.unitCard.updateCardData(this);
    this.updateTileData();

    return actualHealing;
  }

  private getsRevived(): void {
    this.reviveEvent = this.singleEvent(this.reviveAnim, ['reviveAnim_1', 'reviveAnim_2', 'reviveAnim_3'], 150);

    this.isKO = false;
    this.lastBreath = false;
    this.characterImage.setTexture(this.updateCharacterImage());
    const { charImageX, charImageY } = positionHeroImage(this.unitType, this.belongsTo === 1, false, false);
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

    this.unitCard.updateCardData(this);
    this.updateTileData();
  }

  healAndIncreaseHealth(healing: number, increase: number): void {
    const actualHealing = this.getsHealed(healing, false);
    this.increaseMaxHealth(increase, false);

    // Show total number
    const textFigure = actualHealing ? actualHealing + increase : increase;
    new FloatingText(this.context, this.x, this.y - 50, textFigure.toString(), true);
  };

  getsKnockedDown(): void {
    if (this.unitType !== EHeroes.PHANTOM) selectDeathSound(this.scene, this.unitType);
    this.removeSpecialTileOnKo();

    this.currentHealth = 0;
    this.isKO = true;

    const tile = this.getTile();
    tile.hero = this.exportData();

    this.characterImage.setTexture(this.updateCharacterImage());
    const { charImageX, charImageY } = positionHeroImage(this.unitType, this.belongsTo === 1, false, true);
    this.characterImage.x = charImageX;
    this.characterImage.y = charImageY;

    checkUnitGameOver(this.context, this);
  }

  getTile(): Tile {
    const tile = this.context?.gameController?.board.getTileFromBoardPosition(this.boardPosition);
    if (!tile) throw new Error('getTile() -> No tile found');

    return tile;
  }

  updateTileData(): void {
    const tile = this.getTile();
    tile.hero = this.exportData();
  }

  shuffleInDeck(): void {
    this.boardPosition = 51;

    const unitData = this.exportData();

    this.context.gameController!.hand.removeFromHand(unitData);
    this.context.gameController!.deck.addToDeck(unitData);

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
    // Remove hero data from tile
    const tile = this.getTile();
    tile.removeHero();

    // Remove hero from board array
    const index = this.context.gameController!.board.units.findIndex(unit => unit.unitId === this.unitId);
    if (index !== -1) { this.context.gameController!.board.units.splice(index, 1); }

    checkUnitGameOver(this.context, this);
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
      playSound(this.context, EGameSounds.HERO_STOMP);
      hero?.removeFromGame(true);
    }

    // Check if the unit is leaving or entering a special tile and apply any effects
    this.specialTileCheck(targetTile, startTile);
    this.updatePosition(targetTile);
    targetTile.hero = this.exportData();
    startTile.removeHero();

    gameController.afterAction(EActionType.MOVE, startTile.boardPosition, targetTile.boardPosition);
  }

  spawn(tile: Tile): void {
    const startingPosition = this.boardPosition;
    const gameController = this.context.gameController!;

    // Stomp KO'd units and enemy phantoms
    if (tile.hero && (tile.hero.isKO || tile.hero.unitType === EHeroes.PHANTOM)) {
      const hero = gameController.board.units.find(unit => unit.unitId === tile.hero?.unitId);
      if (!hero) console.error('spawn() Found heroData on tile, but no Hero to remove', tile);
      playSound(this.context, EGameSounds.HERO_STOMP);
      hero?.removeFromGame(true);
    }

    gameController.hand.removeFromHand(this);
    gameController.board.units.push(this);

    // Modify image
    this.characterImage.setScale(1);
    const { charImageX, charImageY } = positionHeroImage(this.unitType, this.belongsTo === 1, false, false);
    this.characterImage.x = charImageX;
    this.characterImage.y = charImageY;
    this.setDepth(this.row + 10);
    // Flip image if player is player 2
    if (this.belongsTo === 2) this.characterImage.setFlipX(true);

    // Update vertical positioning of the info card
    this.unitCard.y = 0;
    // A Wraith can spawn on a special tile. Phantom spawning is handled within its class
    this.specialTileCheck(tile);
    // Position hero on the board
    this.updatePosition(tile);
    // Update tile data
    this.updateTileData();

    this.healthBar.setVisible(true);

    playSound(this.context, EGameSounds.HERO_SPAWN);

    gameController.afterAction(EActionType.SPAWN, startingPosition, tile.boardPosition);
  }

  abstract attack(target: Hero | Crystal): void;
  abstract heal(target: Hero): void;
  abstract special(target: Hero): void;
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
    const helmImage = this.scene.add.image(this.x, this.y, 'shiningHelm').setDepth(100);
    useAnimation(helmImage);

    this.shiningHelm = true;
    this.magicalDamageResistance += 20;

    this.increaseMaxHealth(this.baseHealth * 0.1);

    this.shiningHelmImage.setVisible(true);
    this.characterImage.setTexture(this.updateCharacterImage());

    this.unitCard.updateCardData(this);
    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  equipRunemetal(handPosition: number): void {
    const helmImage = this.scene.add.image(this.x, this.y, 'runeMetal').setDepth(100);
    useAnimation(helmImage);

    this.runeMetal = true;
    this.runeMetalImage.setVisible(true);

    this.runeMetalImage.setVisible(true);
    this.characterImage.setTexture(this.updateCharacterImage());

    this.unitCard.updateCardData(this);
    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  equipSuperCharge(handPosition: number): void {
    this.superCharge = true;

    this.unitCard.updateCardData(this);
    this.updateTileData();

    this.superChargeAnim.setVisible(true);

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  private updateCrystals(change: number): void {
    this.context.gameController!.board.crystals.forEach(crystal => {
      if (crystal.belongsTo !== this.belongsTo) {
        let newLevel: number = 0;

        if (change > 0) newLevel = crystal.debuffLevel + 1;
        else if (change < 0 && crystal.debuffAmount > 0) newLevel = crystal.debuffLevel + 1;
        else return

        crystal.updateDebuffAnimation(newLevel);
        crystal.debuffAmount += change
      }
    });
  };

  specialTileCheck(targetTile: Tile, currentTile?: Tile, sound = true): void {
    let multiplier = 1;
    if (this.faction === EFaction.DWARVES) {
      multiplier = 1.2;
      if (this.unitType === EHeroes.ENGINEER){
        multiplier = 1.4;
      }
    }
    // TODO: speed tile buffs with dwarves

    const targetType = targetTile.tileType;
    const currentType = currentTile?.tileType;

    // If hero is leaving a special tile
    switch (currentType) {
      case ETiles.CRYSTAL_DAMAGE:
        this.updateCrystals(-300 * multiplier);
        this.crystalDebuffTileAnim.setVisible(false);
        break;
      case ETiles.POWER:
        this.attackTile = 0;
        this.powerTileAnim.setVisible(false);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.magicalDamageResistance -= 20 * multiplier;
        this.magicalResistanceTileAnim.setVisible(false);
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.physicalDamageResistance -= 20 * multiplier;
        this.physicalResistanceTileAnim.setVisible(false);
        break;
      case ETiles.SPEED:
        this.speedTile = 0;
        this.magicalResistanceTileAnim.setVisible(false);
        break;
    }

    // If hero is entering a special tile
    switch (targetType) {
      case ETiles.CRYSTAL_DAMAGE:
        console.log("crystal");
        this.updateCrystals(300 * multiplier);
        this.crystalDebuffTileAnim.setVisible(true);
        if (sound) playSound(this.scene, EGameSounds.CRYSTAL_TILE);
        break;
      case ETiles.POWER:
        this.attackTile = 100 * multiplier;
        this.powerTileAnim.setVisible(true);
        if (sound) playSound(this.scene, EGameSounds.SWORD_TILE);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.magicalDamageResistance += 20 * multiplier;
        this.magicalResistanceTileAnim.setVisible(true);
        if (sound) playSound(this.scene, EGameSounds.HELM_TILE);
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.physicalDamageResistance += 20 * multiplier;
        this.physicalResistanceTileAnim.setVisible(true);
        if (sound) playSound(this.scene, EGameSounds.SHIELD_TILE);
        break;
      case ETiles.SPEED:
        this.speedTile = 2;
        if (multiplier < 1) {
          this.speedTile = 3;
          if (multiplier < 1.2) {
            this.speedTile = 4;
          }
        }        this.magicalResistanceTileAnim.setVisible(true);
        if (sound) playSound(this.scene, EGameSounds.HELM_TILE);
        break;
    }
    
    // remove auras
    this.magicalDamageResistance -= this.paladinAura * 5;
    this.physicalDamageResistance -= this.paladinAura * 5;
    this.paladinAura = 0;

    // check for new auras
    const heroTiles = getAOETiles(this.context, this, targetTile, true).heroTiles;
    heroTiles.forEach(tile => {
      const unit = this.context.gameController!.board.units.find(u => u.boardPosition === tile.boardPosition)
      if (unit && !unit.isKO && unit.unitType === EHeroes.PALADIN && unit !== this) {
        this.magicalDamageResistance += 5;
        this.physicalDamageResistance += 5;
        this.paladinAura += 1;
      }
    });

    this.unitCard.updateCardData(this);
  }

  removeSpecialTileOnKo(): void {
    const currentType = this.getTile().tileType;

    let multiplier = 1;
    if (this.faction === EFaction.DWARVES) {
      multiplier = 1.2;
      if (this.unitType === EHeroes.ENGINEER){
        multiplier = 1.4;
      }
    }

    switch (currentType) {
      case ETiles.CRYSTAL_DAMAGE:
        this.updateCrystals(-300 * multiplier);
        this.crystalDebuffTileAnim.setVisible(false);
        break;
      case ETiles.POWER:
        this.attackTile = 0;
        this.powerTileAnim.setVisible(false);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.magicalDamageResistance -= 20 * multiplier;
        this.magicalResistanceTileAnim.setVisible(false);
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.physicalDamageResistance -= 20 * multiplier;
        this.physicalResistanceTileAnim.setVisible(false);
        break;
      case ETiles.SPEED:
        this.speedTile = 0;
        this.magicalResistanceTileAnim.setVisible(false);
        break;
    }

    this.unitCard.updateCardData(this);
  }

  updateCharacterImage(): string {
    if (this.unitType === EHeroes.PHANTOM) return 'phantom_1';

    if (this.isKO) return `${this.unitType}_9`;

    if (this.runeMetal && this.factionBuff && this.shiningHelm) return `${this.unitType}_8`;
    if (this.runeMetal && this.shiningHelm) return `${this.unitType}_7`;
    if (this.factionBuff && this.shiningHelm) return `${this.unitType}_6`;
    if (this.factionBuff && this.runeMetal) return `${this.unitType}_5`;
    if (this.factionBuff) return `${this.unitType}_4`;
    if (this.shiningHelm) return `${this.unitType}_3`;
    if (this.runeMetal) return `${this.unitType}_2`;

    return `${this.unitType}_1`;
  }

  removeAttackModifiers() {
    this.priestessDebuff = false;
    this.priestessDebuffImage.setVisible(false);
    this.superCharge = false;
    this.superChargeAnim.setVisible(false);

    this.unitCard.updateCardData(this);

    const tile = this.getTile();
    tile.hero = this.exportData();
  }

  flashActingUnit(): void {
    // Flash the unit blue to better identify which unit is attacking / healing on a replay
    this.characterImage.setTint(0x3399ff);
    this.scene.time.delayedCall(800, () => this.characterImage.clearTint());
  }
}
