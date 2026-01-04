import { EActionType, EAttackType, EClass, EEffect, EFaction, EGameSounds, EItems, EReticle, ETiles, EUnitEvent, EUnitTypes } from "../enums/gameEnums";
import { IUnitData, IItemData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, isEnemySpawn, playSound, roundToFive, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Unit } from "./unit";
import { Item } from "./item";
import { Tile } from "./tile";
import * as effects from "./effects"
import { Crystal } from "./crystal";

// Base Elf class with the racial passive
export abstract class Elf extends Unit {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  // Racial passive: Units are healed for 33% of damage dealt to enemy units
  onDamageDone(amount: number, target: Unit): void {
    if (!(target instanceof Crystal)) {
      const healAmount = roundToFive(amount * 0.33);
      this.getsHealed(healAmount);
    }
  }

  equipFactionBuff(handPosition: number): void {
    playSound(this.scene, EGameSounds.DRAGON_SCALE_USE);

    const soulStoneImg = this.scene.add.image(this.x + 10, this.y - 10, 'soulStone').setOrigin(0.5).setDepth(100);
    useAnimation(soulStoneImg);

    this.applyEffect(new effects.SoulStoneEquipment(this.context, this));

    this.context.gameController.afterAction(EActionType.USE, [-1, handPosition], this.boardPosition);
  }
}

// Hero Class: Void Monk
export class VoidMonk extends Elf {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.VOIDMONK_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.VOIDMONK_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
      this.onDamageDone(damage, target);

      // Splash damage to orthogonally adjacent enemies
      const adjacentTiles = this.getOrthogonalTiles(target.getTile());
      adjacentTiles.forEach(tile => {
        const unit =
          gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
          gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);
        if (unit && unit !== target && unit.belongsTo !== this.belongsTo) {
          const splashDamage = damage * 0.66;
          unit.getsDamaged(splashDamage, this.attackType);
          this.onDamageDone(splashDamage, unit);
        }
      });
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  private getOrthogonalTiles(targetTile: Tile): Tile[] {
    const targetPos = targetTile.boardPosition; // Assuming targetTile.boardPosition is now [row, col]
    const tiles: Tile[] = [];

    const orthogonalOffsets: [number, number][] = [
      [-1, 0], // Up
      [0, -1], // Left
      [1, 0],  // Down
      [0, 1]   // Right
    ];

    const getTileFromPos = (pos: [number, number]): Tile | null => {
      const [row, col] = pos;
      if (row < 0 || row >= 5 || col < 0 || col >= 9) {
        return null;
      }
      
      return this.context.gameController.board.getTileFromBoardPosition(pos);
    };

    orthogonalOffsets.forEach(offset => {
      const newPos: [number, number] = [targetPos[0] + offset[0], targetPos[1] + offset[1]];
      const tile = getTileFromPos(newPos);

      if (tile && canBeAttacked(this, tile)) {
        tiles.push(tile);
      }
    });

    return tiles;
  }
}

// Hero Class: Impaler
export class Impaler extends Elf {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.IMPALER_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.IMPALER_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
      gameController.pullEnemy(this, target);
      this.onDamageDone(damage, target);
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
}

// Hero Class: Necromancer
export class Necromancer extends Elf {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
    this.specialReticle = EReticle.SPECIAL_ATTACK;
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      distance === 1 &&
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.NECROMANCER_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.NECROMANCER_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
      this.onDamageDone(damage, target);
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();

    this.effectEvent(EUnitEvent.SPECIAL);

    if (!target.isKO) return;

    playSound(this.scene, EGameSounds.PHANTOM_SPAWN);

    // Create Phantom unit
    const phantomData: IUnitData = {
      unitId: `${target.unitId}_phantom`,
      faction: EFaction.DARK_ELVES,
      class: EClass.UNIT,
      type: EUnitTypes.PHANTOM,
      belongsTo: this.belongsTo,
      baseHealth: 100,
      currentHealth: 100,
      maxHealth: 100,
      basePower: 100,
      currentPower: 100,
      attackType: EAttackType.MAGICAL,
      attackRange: 1,
      specialRange: 0,
      movement: 3,
      basePhysicalDamageResistance: 0,
      baseMagicalDamageResistance: 0,
      physicalDamageResistance: 0,
      magicalDamageResistance: 0,
      effects: [],
      boardPosition: [0, 0],
      canSpecial: false,
      isKO: false,
      lastBreath: false,
    };
    const phantom = new Phantom(this.context, phantomData, target.getTile());
    this.context.gameController.board.units.push(phantom);

    // Remove original KO'd unit
    target.removeFromGame();

    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

}

// Hero Class: Priestess
export class Priestess extends Elf {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
    this.specialReticle = EReticle.HEAL;
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      distance === 1 &&
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.PRIESTESS_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.PRIESTESS_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
      this.onDamageDone(damage, target);

      // Apply debuff to non-Crystal targets
      if (target instanceof Unit && !target.hasEffect(EEffect.PRIESTESS_DEBUFF)) {
        target.applyEffect(new effects.PriestessDebuffEffect(this.context, target));
      }
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();

    this.effectEvent(EUnitEvent.HEAL);

    turnIfBehind(this.context, this, target);
    playSound(this.scene, EGameSounds.HEAL);

    let healingAmount: number;
    if (target.isKO) {
      healingAmount = this.getTotalHealing(0.5);
      target.isKO = false;
    } else {
      healingAmount = this.getTotalHealing(2.0);
    }

    target.getsHealed(healingAmount);
    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    let [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    let [specialTiles, LOSSpecialTiles] = board.getUnitsInRange(this, this.specialRange, false);

    // healing ignores LOS
    specialTiles = [...specialTiles, ...LOSSpecialTiles];

    // no crystal healing
    specialTiles = specialTiles.filter(tile => !(tile.unit instanceof Crystal));

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
  }
}

// Hero Class: Wraith
export class Wraith extends Elf {

  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
    this.specialReticle = EReticle.ATTACK;
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.WRAITH_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.WRAITH_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
      this.onDamageDone(damage, target);
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    
    this.effectEvent([EUnitEvent.SPECIAL, EUnitEvent.HEAL]);

    if (!target.isKO || this.getDistanceToTarget(target) !== 1) return;

    playSound(this.scene, EGameSounds.WRAITH_CONSUME);

    target.removeFromGame();
    
    this.applyEffect(new effects.ConsumeBuff(this.context, this))

    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  showSpawn(): void {
    const spawns = new Set<Tile>();
    const board = this.context.gameController.board
    board.tiles.forEach(row => row.forEach(tile => {
      const enemySpawn = isEnemySpawn(this.context, tile);
      if (
        (tile.tileType === ETiles.SPAWN && !enemySpawn) ||
        tile.unit?.isKO // add
      ){
        if (!tile.unit) spawns.add(tile);
        if (tile.unit instanceof Unit && tile.unit?.isKO) spawns.add(tile);
        if (tile.unit instanceof Unit && tile.unit?.type === EUnitTypes.PHANTOM) spawns.add(tile);
      }
    }));

    spawns.forEach(spawn => spawn.setHighlight(EReticle.MOVE, this, this.spawn));
  }}

// Phantom Class
export class Phantom extends Elf {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.WRAITH_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.WRAITH_ATTACK);
      const damage = this.getTotalPower();
      target.getsDamaged(damage, this.attackType);
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  removeFromGame(_force?: boolean): void {
    super.removeFromGame(true); // No corpse left
  }
}

// Upgrades
export class SoulStone extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.SOUL_STONE;
  }

  use(target: Tile): void {
    const unit = target.unit;
    if (unit) {
      playSound(this.scene, EGameSounds.ITEM_USE);
      unit.equipFactionBuff(this.boardPosition[1]);
      this.removeFromGame();
    }
  }
}

export class SoulHarvest extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.SOUL_HARVEST;
  }

  use(targetTile: Tile): void {
    playSound(this.scene, EGameSounds.USE_HARVEST);
    const gameController = this.context.gameController;
    const damage = 100;
    let totalDamageToUnits = 0;

    // Apply damage in 3x3 area
    const aoeTiles = getAOETiles(this.context, this, targetTile, false);
    const allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit =
        gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);
      if (unit && unit.belongsTo !== this.belongsTo) {
        const dealtDamage = unit.getsDamaged(damage, EAttackType.MAGICAL);
        if (unit instanceof Unit) totalDamageToUnits += dealtDamage;
      }
    });

    // Distribute HP to friendly units
    const friendlyUnits = gameController.board.units.filter(u => u.belongsTo === this.belongsTo && !u.isKO);
    const hpGain = roundToFive(totalDamageToUnits / (friendlyUnits.length + 3));
    friendlyUnits.forEach(unit => {
      unit.currentHealth += hpGain;
      unit.maxHealth += hpGain;
      unit.getsHealed(hpGain); // Revive if KO'd
    });

    this.context.gameController.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);
    this.removeFromGame();
  }
  showActions(): void {
    playSound(this.scene, EGameSounds.AOE_SPELL_SELECT);
    this.context.gameController.board.tiles.forEach(row => {row.forEach(tile => {
        tile.setHighlight(EReticle.MOVE, this, this.use)
      });
    });
  }
}

export class ManaVial extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.MANA_VIAL;
  }

  use(target: Tile): void {
    const unit = target.unit;
    if (unit) {
      playSound(this.scene, EGameSounds.POTION_USE);
      const vialImage = this.scene.add.image(unit.x, unit.y - 10, 'manaVial').setOrigin(0.5).setDepth(100);
      useAnimation(vialImage);
  
      unit.getsHealed(1000);
      unit.maxHealth += 50;
  
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
      this.removeFromGame();
    }
  }
}
