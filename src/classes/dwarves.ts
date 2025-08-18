import { EActionType, EAttackType, EGameSounds, ETiles } from "../enums/gameEnums";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, isOnBoard, playSound, roundToFive, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";


// Helper function to get tiles in a cone shape
// This is a simple implementation and might need to be refined for a real game engine
function getConeTiles(startPos: number, direction: number, boardWidth = 9, range = 2): number[] {
  const tiles: number[] = [];
  const startRow = Math.floor(startPos / boardWidth);
  const startCol = startPos % boardWidth;

  for (let r = 1; r <= range; r++) {
    for (let c = -r; c <= r; c++) {
      let targetRow = startRow;
      let targetCol = startCol;

      switch (direction) {
        case 0: // North
          targetRow = startRow - r;
          targetCol = startCol + c;
          break;
        case 1: // North-East
          targetRow = startRow - r;
          targetCol = startCol + r;
          break;
        case 2: // East
          targetRow = startRow;
          targetCol = startCol + r;
          break;
        case 3: // South-East
          targetRow = startRow + r;
          targetCol = startCol + r;
          break;
        case 4: // South
          targetRow = startRow + r;
          targetCol = startCol + c;
          break;
        case 5: // South-West
          targetRow = startRow + r;
          targetCol = startCol - r;
          break;
        case 6: // West
          targetRow = startRow;
          targetCol = startCol - r;
          break;
        case 7: // North-West
          targetRow = startRow - r;
          targetCol = startCol - r;
          break;
      }

      const targetPos = targetRow * boardWidth + targetCol;
      if (isOnBoard(targetPos)) {
        tiles.push(targetPos);
      }
    }
  }

  return tiles;
}

// Base Dwarf class with the racial passive
export abstract class Dwarf extends Hero {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Abstract methods to be implemented by children
  special(_target: Hero): void { };
  equipFactionBuff(handPosition: number): void {
    playSound(this.scene, EGameSounds.DRAGON_SCALE_USE);

    const dragonScaleImg = this.scene.add.image(this.x + 10, this.y - 10, 'dragonScale').setOrigin(0.5).setDepth(100);
    useAnimation(dragonScaleImg);

    this.factionBuff = true;
    this.factionBuffImage.setVisible(true);
    this.characterImage.setTexture(this.updateCharacterImage());

    this.physicalDamageResistance += 20;

    this.increaseMaxHealth(this.baseHealth * 0.1);

    this.unitCard.updateCardData(this);
    this.updateTileData();

    this.scene.sound.play(EGameSounds.DRAGON_SCALE_USE);

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }}

// Hero Class: Paladin
export class Paladin extends Dwarf {

  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Heals self for 50% of any healing done
  onHealingDone(amount: number): void {
    const selfHealAmount = roundToFive(amount * 0.5);
    this.getsHealed(selfHealAmount);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    if (this.superCharge) {
      playSound(this.scene, EGameSounds.PALADIN_ATTACK);
    } else {
      playSound(this.scene, EGameSounds.PALADIN_ATTACK_BIG);
    }

    target.getsDamaged(this.getTotalPower(), this.attackType);

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  async heal(target: Hero): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    this.playHealSounds();

    let healingAmount: number;
    if (target.isKO) {
      healingAmount = this.getTotalHealing(0.5);
      // Revive KO'd hero
      target.isKO = false;
    } else {
      healingAmount = this.getTotalHealing(2.0);
    }

    target.getsHealed(healingAmount);
    if (healingAmount > 0) {
      this.onHealingDone(healingAmount);
    }
    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);
  }

  playHealSounds() {
    this.context.sound.play(EGameSounds.HEAL, { volume: 0.5 });
  }

  async move(targetTile: Tile): Promise<void> {
    // remove current auras
    let aoeTiles = getAOETiles(this.context, this, this.getTile(), true);
    let allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit = this.context.gameController!.board.units.find(unit => unit.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        this.magicalDamageResistance -= 5;
        this.physicalDamageResistance -= 5;
        this.paladinAura -= 1;
      }
    });

    // add new auras
    aoeTiles = getAOETiles(this.context, this, targetTile, true);
    allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit = this.context.gameController!.board.units.find(unit => unit.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        unit.magicalDamageResistance += 5;
        unit.physicalDamageResistance += 5;
        unit.paladinAura += 1;
        unit.unitCard.updateCardData(unit);
      }
    });

    super.move(targetTile);
  }

  special(_target: Hero): void {};
}

// Hero Class: Grenadier
export class Grenadier extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);
    const board = this.context.gameController!.board;

    if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GRENADIER_ATTACK_MELEE);
      target.getsDamaged(this.getTotalPower() * 0.5, this.attackType);
    } else { // Ranged attack, ignores LOS
      if (!this.superCharge) {
        playSound(this.scene, EGameSounds.GRENADIER_ATTACK);
      } else {
        playSound(this.scene, EGameSounds.GRENADIER_ATTACK_BIG);
      }
      const damage = this.getTotalPower();
      const splashDamage = damage * 0.5;

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // AoE damage to nearby enemies
      const aoeTiles = getAOETiles(this.context, this, target.getTile(), true);
      const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
      allTiles.forEach(tile => {
        const unit = board.units.find(u => u.boardPosition === tile.boardPosition);
        if (unit && target !== unit && unit.belongsTo !== this.belongsTo) {
          unit.getsDamaged(splashDamage, this.attackType);
          if (unit instanceof Hero) {
            this.context.gameController!.pushEnemy(target, unit); // knocked away from target
          }
        }
      });
    }

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Hero Class: Gunner
export class Gunner extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);
    const board = this.context.gameController!.board;

    if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK_ONLY);
      target.getsDamaged(this.getTotalPower(), this.attackType);
    } else { // Ranged cone attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK);
      const damage = this.getTotalPower() * 0.66;
      const attackDirection = board.getAttackDirection(this.boardPosition, target.boardPosition);
      const coneTiles = getConeTiles(target.boardPosition, attackDirection, this.boardPosition, 2);

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // Damage up to two other targets in the cone
      let targetsHit = 0;
      coneTiles.forEach(tilePos => {
        if (targetsHit >= 2) return;
        const tile = board.getTileFromBoardPosition(tilePos);
        if (tile && canBeAttacked(this, tile)) {
          const hero = tile.hero ? board.units.find(u => u.unitId === tile.hero!.unitId) : null;
          const crystal = tile.crystal ? board.crystals.find(c => c.boardPosition === tile.crystal!.boardPosition) : null;

          if (hero && hero !== target) {
            hero.getsDamaged(damage, this.attackType);
            targetsHit++;
          } else if (crystal && crystal !== target) {
            crystal.getsDamaged(damage, this.attackType);
            targetsHit++;
          }
        }
      });
    }

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Hero Class: Engineer
export class Engineer extends Dwarf {
  private shieldedTarget: Hero | Crystal | null = null;

  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Engineer's special ability: Shield
  async special(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    playSound(this.scene, EGameSounds.ENGINEER_SHIELD_MAKE);

    // Remove old shield if one exists
    if (this.shieldedTarget) {
      playSound(this.scene, EGameSounds.ENGINEER_SHIELD_BREAK);
      this.shieldedTarget.shieldImage.setVisible(false);
      this.shieldedTarget.isShielded = false;
    }

    // Apply new shield
    this.shieldedTarget = target;
    target.isShielded = true;
    target.shieldImage.setVisible(true);

    this.context.gameController!.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  // Override the racial passive to apply double benefits
  applyTilePassive(): void {
    const tile = this.getTile();
    if (!tile) return;

    // Apply double the racial passive based on the tile type
    switch (tile.tileType) {
      case ETiles.POWER:
        this.basePower += 240;
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.basePhysicalDamageResistance += (this.basePhysicalDamageResistance * 0.48);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.baseMagicalDamageResistance += (this.baseMagicalDamageResistance * 0.48);
        break;
      case ETiles.CRYSTAL_DAMAGE:
        this.basePower += 720;
        break;
      case ETiles.SPEED:
        this.movement += 4;
        break;
    }
    this.unitCard.updateCardData(this);
    this.updateTileData();
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    playSound(this.scene, EGameSounds.ENGINEER_ATTACK);
    target.getsDamaged(this.getTotalPower(), this.attackType);

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void { };
}

// Hero Class: Annihilator
export class Annihilator extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    playSound(this.scene, EGameSounds.ANNIHILATOR_SHOOT);

    const damage = this.getTotalPower();
    const splashDamage = damage * 0.2;
    const board = this.context.gameController!.board;

    // Apply debuff to main target
    target.annihilatorDebuff = true;
    target.getsDamaged(damage, this.attackType);

    // Apply AoE splash damage and knockback
    const aoeTiles = getAOETiles(this.context, this, target.getTile(), true);
    const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];    allTiles.forEach(tile => {
      const unit = board.units.find(u => u.boardPosition === tile.boardPosition);

      if (unit && unit.belongsTo !== this.belongsTo) {
        unit.getsDamaged(splashDamage, this.attackType);
        
        if (unit instanceof Hero) {
          this.context.gameController!.pushEnemy(target, unit);
        }
      }
    });

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Upgrades and Consumables
// --- UPGRADES ---
export class Sword extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.basePower *= 1.5;
    target.unitCard.updateCardData(target);
    target.updateTileData();
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class DragonScale extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(target: Hero): void {
    target.equipFactionBuff(this.boardPosition);
    this.removeFromGame();
  }
}

export class Helm extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.baseMagicalDamageResistance += 20;
    target.increaseMaxHealth(target.baseHealth * 0.1);
    target.unitCard.updateCardData(target);
    target.updateTileData();
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class DwarvenBrew extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.getsHealed(1000);
    target.isDrunk = true;
    target.physicalDamageResistance += 50;
    target.magicalDamageResistance += 50;
    target.unitCard.updateCardData(target);
    target.updateTileData();
    playSound(this.scene, EGameSounds.BREW_USE);
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class Pulverizer extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero | Crystal): void {
    const board = this.context.gameController!.board;
    const damage = 600;

    // Apply damage to main target
    const totalDamageDone = target.getsDamaged(damage, EAttackType.PHYSICAL);
    playSound(this.scene, EGameSounds.DRILL_USE);

    // If target is a hero, destroy specific items
    if (target instanceof Hero) {
      target.factionBuff = false;
    }

    // AoE splash logic for crystals
    if (target instanceof Crystal) {
      const splashDamage = totalDamageDone! * 0.33;
      const aoeTiles = getAOETiles(this.context, this, target.getTile(), true);
      const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];

      allTiles.forEach(tile => {
        const hero = board.units.find(u => u.boardPosition === tile.boardPosition);

        if (hero) hero.getsDamaged(splashDamage, EAttackType.PHYSICAL);
      });
    }

    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}