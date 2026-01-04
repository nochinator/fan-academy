import { EActionType, EAttackType, EEffect, EGameSounds, EItems, EReticle, EUnitEvent } from "../enums/gameEnums";
import { IUnitData, IItemData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, playSound, roundToFive, turnIfBehind, useAnimation, isEnemySpawn } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Unit } from "./unit";
import { Item } from "./item";
import { Tile } from "./tile";
import * as effects from "./effects"


// Base Dwarf class with the racial passive
export abstract class Dwarf extends Unit {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  equipFactionBuff(handPosition: number): void {
    playSound(this.scene, EGameSounds.DRAGON_SCALE_USE);

    const dragonScaleImg = this.scene.add.image(this.x + 10, this.y - 10, 'dragonScale').setOrigin(0.5).setDepth(100);
    useAnimation(dragonScaleImg);

    this.applyEffect(new effects.DragonScaleEquipment(this.context, this));

    this.context.gameController.afterAction(EActionType.USE, [-1, handPosition], this.boardPosition);
  }}

// Hero Class: Paladin
export class Paladin extends Dwarf {

  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
    this.specialReticle = EReticle.HEAL;
  }

  // Heals self for 50% of any healing done
  onHealingDone(amount: number): void {
    const selfHealAmount = roundToFive(amount * 0.5);
    this.getsHealed(selfHealAmount);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);
    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.PALADIN_ATTACK);
      else playSound(this.scene, EGameSounds.PALADIN_ATTACK_BIG);

      target.getsDamaged(this.getTotalPower(), this.attackType);
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
    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  playHealSounds() {
    this.context.sound.play(EGameSounds.HEAL, { volume: 0.5 });
  }

  async move(targetTile: Tile): Promise<void> {
    // remove current auras
    let aoeTiles = getAOETiles(this.context, this, this.getTile(), true);
    let allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit =
        this.context.gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        unit.removeEffect(EEffect.PALADIN_BUFF, false);
      }
    });

    // add new auras
    aoeTiles = getAOETiles(this.context, this, targetTile, true);
    allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit =
        this.context.gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        unit.applyEffect(new effects.PaladinBuff(this.context, unit));
      }
    });

    super.move(targetTile);
  }
  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    let [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    let [specialTiles, LOSSpecialTiles] = board.getUnitsInRange(this, this.specialRange, false);;

    // healing ignores LOS
    specialTiles = [...specialTiles, ...LOSSpecialTiles];

    // no crystal healing
    specialTiles = specialTiles.filter(tile => !(tile.unit instanceof Crystal));

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
  }
}

// Hero Class: Grenadier
export class Grenadier extends Dwarf {
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

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GRENADIER_ATTACK_MELEE);
      target.getsDamaged(this.getTotalPower() * 0.5, this.attackType);
    } else { // Ranged attack, ignores LOS
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.GRENADIER_ATTACK_BIG);
      else playSound(this.scene, EGameSounds.GRENADIER_ATTACK);

      const damage = this.getTotalPower();
      const splashDamage = damage * 0.5;

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // AoE damage to nearby enemies
      const aoeTiles = getAOETiles(this.context, this, target.getTile(), false);
      const allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];
      allTiles.forEach(tile => {
        const unit =
          gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
          gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);
        if (unit && target !== unit && unit.belongsTo !== this.belongsTo) {
          unit.getsDamaged(splashDamage, this.attackType);
        }
      });
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    let [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    const specialTiles: Tile[] = [];

    // grenadier ignores LOS
    attackTiles = [...attackTiles, ...LOSBlocked];
    LOSBlocked = []

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
  }
}

// Hero Class: Gunner
export class Gunner extends Dwarf {
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

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);
    const board = gameController.board;

    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.GUNNER_ATTACK_ONLY);
      target.removeFromGame();
    } else if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK_ONLY);
      target.getsDamaged(this.getTotalPower(), this.attackType);
    } else { // Ranged cone attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK);
      const damage = this.getTotalPower() * 0.66;
      const attackDirection = board.getAttackDirection(this.boardPosition, target.boardPosition);
      const coneUnits = this.getConeTiles(this.boardPosition, attackDirection);

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // Damage up to two other targets in the cone
      let targetsHit = 0;
      coneUnits.forEach(unit => {
        if (targetsHit >= 2) return;
        if (unit && canBeAttacked(this, unit.getTile()) && unit !== target) {
          unit.getsDamaged(damage, this.attackType);
          targetsHit++;
        }
      });
    }
    
    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getConeTiles(startPos: [number, number], direction: number) {
    const units = [];
    const board = this.context.gameController.board;

    const findTile = (pos: [number, number]): any => {
      const [row, col] = pos;
      // Check if the position is within the board boundaries (0-4 for row, 0-8 for col).
      if (row < 0 || row >= 5 || col < 0 || col >= 9) {
        return undefined;
      }
      
      const unit = board.getUnitFromTile(board.getTileFromBoardPosition([row, col]));
      
      return unit?.belongsTo !== this.belongsTo ? unit : undefined;
    };
    
    // Define the offsets in [row, col] format.
    // The offsets are based on a 9x5 grid.
    const offsets: { [key: number]: [number, number][] } = {
      1: [[-1, 0], [-2, 0], [-1, -1], [-2, -2]], // vertical up
      5: [[1, 0], [2, 0], [1, 1], [2, 2]],      // vertical down
      2: [[-1, 1], [-2, 2], [0, 1], [0, 2]],    // up-right
      6: [[1, -1], [2, -2], [0, -1], [0, -2]],  // down-left
      3: [[0, -1], [0, -2], [1, 0], [1, 1]],    // horizontal left
      7: [[0, 1], [0, 2], [-1, 0], [-1, -1]],   // horizontal right
      4: [[1, 1], [2, 2], [0, 1], [0, 2]],      // down-right
      8: [[-1, -1], [-2, -2], [0, -1], [0, -2]], // up-left
    };
    
    const currentOffsets = offsets[direction];
    
    if (currentOffsets) {
      const unit1 = findTile([startPos[0] + currentOffsets[0][0], startPos[1] + currentOffsets[0][1]]) ??
                    findTile([startPos[0] + currentOffsets[1][0], startPos[1] + currentOffsets[1][1]]);
                    
      const unit2 = findTile([startPos[0] + currentOffsets[2][0], startPos[1] + currentOffsets[2][1]]) ??
                    findTile([startPos[0] + currentOffsets[3][0], startPos[1] + currentOffsets[3][1]]);
                    
      if (unit1) units.push(unit1);
      if (unit2) units.push(unit2);
    }
    
    return units;
  }
}

// Hero Class: Engineer
export class Engineer extends Dwarf {
  private shieldedTarget: Unit | null = null;

  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
    this.specialReticle = EReticle.HEAL;
  }

  // Engineer's special ability: Shield
  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();
    
    this.effectEvent(EUnitEvent.SPECIAL);

    playSound(this.scene, EGameSounds.ENGINEER_SHIELD_MAKE);

    // Remove old shield if one exists
    if (this.shieldedTarget) {
      this.shieldedTarget.removeEffect(EEffect.SHIELD_BUFF)
      playSound(this.scene, EGameSounds.ENGINEER_SHIELD_BREAK);
    }

    // Apply new shield
    this.shieldedTarget = target;
    target.applyEffect(new effects.ShiledBuff(this.context, this));

    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);
    
    const distance = this.getDistanceToTarget(target);
    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.ENGINEER_ATTACK);
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    let [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    let [specialTiles, LOSSpecialTiles] = board.getUnitsInRange(this, this.specialRange, false);

    // shielding ignores LOS
    specialTiles = [...specialTiles, ...LOSSpecialTiles];

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
  }
}

// Hero Class: Annihilator
export class Annihilator extends Dwarf {
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

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);
    
    const distance = this.getDistanceToTarget(target);
    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile()) &&
      distance === 1
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else {
      playSound(this.scene, EGameSounds.ANNIHILATOR_SHOOT);

      const damage = this.getTotalPower();
      const splashDamage = damage * 0.2;

      // Apply debuff to main target
      if (!target.hasEffect(EEffect.ANNIHILATOR_DEBUFF)) {
        target.applyEffect(new effects.AnnihilatorDebuffEffect(this.context, this));
      }
      target.getsDamaged(damage, this.attackType);

      // Apply AoE splash damage and knockback
      const aoeTiles = getAOETiles(this.context, this, target.getTile(), false);
      const allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];   
      let enemiesToPush: Unit[] = []
      allTiles.forEach(tile => {
        const unit =
          gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
          gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);

        if (unit && unit.belongsTo !== this.belongsTo && unit !== target) {
          unit.getsDamaged(splashDamage, this.attackType);
          
          if (unit instanceof Unit) {
            enemiesToPush.push(unit);
          }
        }
      });
      // so paladin aura isn't removed before damaging
      enemiesToPush.forEach(enemy => {
        gameController.pushEnemy(target, enemy);
      });
    }

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
}

export class DwarvenBrew extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.DWARVERN_BREW;
    this.selectSound = EGameSounds.BREW_SELECT;
  }
  use(target: Tile): void {
    const unit = target.unit;
    if (unit) {
      unit.applyEffect(new effects.dwarvernBrewEquipment(this.context, unit));
      playSound(this.scene, EGameSounds.BREW_USE);
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
      this.removeFromGame();
    }
  }
}

export class Pulverizer extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.PULVERIZER;
    this.selectSound = EGameSounds.DRILL_USE;
  }
  use(targetTile: Tile): void {
    const target = this.context.gameController.board.getUnitFromTile(targetTile);
    const damage = 600;

    // Apply damage to main target
    if (target){
      const totalDamage = target.getsDamaged(damage, EAttackType.PHYSICAL);
      playSound(this.scene, EGameSounds.DRILL_USE);
  
      // Has no effect on units without the effects
      target.removeEffect(EEffect.SOUL_STONE_EQUIPMENT);
      target.removeEffect(EEffect.DRAGON_SCALE_EQUIPMENT);
  
      // AoE splash logic for crystals
      if (target instanceof Crystal) {
        const splashDamage = totalDamage * 0.333;
        const aoeTiles = getAOETiles(this.context, this, targetTile, false);
        const allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];
  
        allTiles.forEach(tile => {
          const unit = this.context.gameController.board.getUnitFromTile(tile);
  
          if (unit && unit !== target) unit.getsDamaged(splashDamage, EAttackType.PHYSICAL);
        });
      }
  
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
      this.removeFromGame();
    }
  }
  showActions(): void {
    this.context.gameController.board.tiles.forEach(row => {row.forEach(tile => {
          if (tile.unit && tile.unit.belongsTo !== this.belongsTo) {
            tile.setHighlight(EReticle.MOVE, this, this.use)
          }
      });
    });
  }
}