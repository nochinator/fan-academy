import { EActionType, EAttackType, EEffect, EGameSounds, EItems, EReticle, EUnitEvent, EUnitTypes } from "../enums/gameEnums";
import { IUnitData, IItemData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, isEnemySpawn, playSound, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Board } from "./board";
import { Crystal } from "./crystal";
import { Unit } from "./unit";
import { Item } from "./item";
import { Tile } from "./tile";
import * as effects from "./effects"

export abstract class Human extends Unit {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  equipFactionBuff(handPosition: number): void {
    const dragonScaleImg = this.scene.add.image(this.x + 10, this.y - 10, 'dragonScale').setOrigin(0.5).setDepth(100);
    useAnimation(dragonScaleImg);

    this.applyEffect(new effects.DragonScaleEquipment(this.context, this));

    this.context.gameController.afterAction(EActionType.USE, [-1, handPosition], this.boardPosition);
  }
}

export class Archer extends Human {
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

    const distance = this.getDistanceToTarget(target);

    turnIfBehind(this.context, this, target);

    if (distance === 1) {
      // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
      if (
        target instanceof Unit &&
        target.isKO &&
        isEnemySpawn(this.context, target.getTile())
      ) {
        playSound(this.scene, EGameSounds.ARCHER_ATTACK_MELEE);

        target.removeFromGame();
      } else {
        playSound(this.scene, EGameSounds.ARCHER_ATTACK_MELEE);

        target.getsDamaged(this.getTotalPower(0.5), this.attackType);
      }
    } else {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.ARCHER_ATTACK_BIG)
      else playSound(this.scene, EGameSounds.ARCHER_ATTACK);

      target.getsDamaged(this.getTotalPower(), this.attackType);
    }


    this.context.gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
}

export class Knight extends Human {
  constructor(context: GameScene, data: IUnitData, tile?: Tile) {
    super(context, data, tile);
  }

  attack(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }    this.flashActingUnit();

    this.effectEvent(EUnitEvent.ATTACK);

    const gameController = this.context.gameController;
    turnIfBehind(this.context, this, target);

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.KNIGHT_ATTACK_BIG);
      else playSound(this.scene, EGameSounds.ARCHER_ATTACK_MELEE);

      target.getsDamaged(this.getTotalPower(), this.attackType);

      if (target instanceof Unit && target.type !== EUnitTypes.PHANTOM) gameController.pushEnemy(this, target);
    }

    this.context.gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
}

export class Wizard extends Human {
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

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      distance === 1 &&
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.WIZARD_ATTACK);
      target.removeFromGame();
    } else {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.WIZARD_ATTACK_BIG);
      else playSound(this.scene, EGameSounds.WIZARD_ATTACK);

      // Get directions for finding out the next targets
      const attackDirection = gameController.board.getAttackDirection(this.boardPosition, target.boardPosition);
      const opponentDirection = this.context.isPlayerOne ? [2, 3, 4] : [6, 7, 8];

      // Collect all targets
      const secondTarget = this.getNextTarget(target, attackDirection, opponentDirection, gameController.board, false);
      let thirdTarget: Unit | undefined;
      if (secondTarget) thirdTarget = this.getNextTarget(secondTarget, attackDirection, opponentDirection, gameController.board, false, [target.boardPosition, secondTarget.boardPosition]);

      // Apply damage to targets
      target.getsDamaged(this.getTotalPower(), this.attackType);
      if (secondTarget) secondTarget.getsDamaged(this.getTotalPower() * 0.75, this.attackType);
      if (thirdTarget) thirdTarget.getsDamaged(this.getTotalPower() * 0.56, this.attackType);

      if (target && target instanceof Unit && target.isKO && target.type === EUnitTypes.PHANTOM) target.removeFromGame();
      if (secondTarget && secondTarget instanceof Unit && secondTarget.isKO && secondTarget.type === EUnitTypes.PHANTOM) secondTarget.removeFromGame();
      if (thirdTarget && thirdTarget instanceof Unit && thirdTarget.isKO && thirdTarget.type === EUnitTypes.PHANTOM) thirdTarget.removeFromGame();
    }

    this.context.gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getNextTarget(target: Unit, attackDirection: number, opponentDirection: number[], board: Board, isLastTarget: boolean, toIgnore?: [number, number][]): Unit | undefined {
    const positionsToIgnore = toIgnore ? toIgnore : [target.boardPosition];
    const adjacentEnemies = this.getAdjacentEnemyTiles(target.boardPosition, positionsToIgnore);

    let maxScore = -1;
    let bestTarget: Tile | undefined;

    for (const enemyTile of adjacentEnemies) {
      const enemyTileDirection = board.getAttackDirection(target.boardPosition, enemyTile.boardPosition);

      let score = 0;

      /**
       *  An enemy unit gets points for:
       *    -being in the same direction of the attack
       *    -being in the general direction of the attack
       *    -being in the direction of the opponent's side of the board
       *    -being in an orthogonal direction (tie breaker)
       *    -having an adjacent enemy unit (the attack prioritizes number of target versus direction)
       *  */
      if (enemyTileDirection === attackDirection) score += 2;
      if (this.getGeneralDirections(attackDirection).includes(enemyTileDirection)) score += 1.5;
      if (opponentDirection.includes(enemyTileDirection)) score += 1;
      if ([1, 3, 5, 7].includes(enemyTileDirection)) score += 1;

      if (!isLastTarget) {
        const enemyHasAdjacentEnemies = this.getAdjacentEnemyTiles(enemyTile.boardPosition, [enemyTile.boardPosition]);
        if (enemyHasAdjacentEnemies.length) {
          score += 1.5;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestTarget = enemyTile;
      }

      if (maxScore === 6) break;
    }

    if (!bestTarget) {
      console.log("getNextTarget() No suitable adjacent target found.");
      return undefined;
    }

    if (bestTarget.unit) {
      const unit = board.units.find(unit => unit.unitId === bestTarget.unit!.unitId);
      if (unit) return unit;
    }

    throw new Error("getNextTarget() Target found on tile, but not in board units");
  }

  getAdjacentEnemyTiles(boardPosition: [number, number], ignorePosition: [number, number][] = []): Tile[] {
    const adjacentTiles: Tile[] = [];
    const boardWidth = 9;
    const boardHeight = 5;

    const [row, col] = boardPosition;

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        // Skip the center tile (the unit's own position)
        if (rowOffset === 0 && colOffset === 0) continue;

        const newRow = row + rowOffset;
        const newCol = col + colOffset;

        // Check if the new coordinates are within the board boundaries
        if (newRow >= 0 && newRow < boardHeight && newCol >= 0 && newCol < boardWidth) {
          const newPosition: [number, number] = [newRow, newCol];
          // Check if the new position is in the ignore list
          const isIgnored = ignorePosition.some(pos => pos[0] === newRow && pos[1] === newCol);
          if (!isIgnored) {
            const tile = this.context.gameController.board.getTileFromBoardPosition(newPosition);
            if (canBeAttacked(this, tile)) {
              adjacentTiles.push(tile);
            }
          }
        }
      }
    }
    return adjacentTiles;
  }

  private getGeneralDirections(direction: number): number[] {
    switch (direction) {
      case 1: return [1, 2, 8];
      case 2: return [[1, 2, 8], [2, 3, 4]].flat();
      case 3: return [2, 3, 4];
      case 4: return [[2, 3, 4], [4, 5, 6]].flat();
      case 5: return [4, 5, 6];
      case 6: return [[4, 5, 6], [6, 7, 8]].flat();
      case 7: return [6, 7, 8];
      case 8: return [[1, 2, 8], [6, 7, 8]].flat();
      default: return [];
    }
  }
}

export class Ninja extends Human {
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

    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    const ninjaAttackSound = () => {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.NINJA_ATTACK_BIG);
      else playSound(this.scene, EGameSounds.NINJA_ATTACK);
    };

    if (distance === 1) {
      // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
      if (
        target instanceof Unit &&
        target.isKO &&
        isEnemySpawn(this.context, target.getTile())
      ) {
        playSound(this.scene, EGameSounds.NINJA_ATTACK);
        target.removeFromGame();
      } else {
        ninjaAttackSound();
        target.getsDamaged(this.getTotalPower(2), this.attackType);
      }
    } else {
      ninjaAttackSound();
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    this.context.gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    playSound(this.scene, EGameSounds.NINJA_SMOKE);
    const targetDestination = this.getTile();
    const unitDestination = target.getTile();

    // Smoke bomb animation
    this.singleTween(this.smokeAnim!, 500);
    target.singleTween(target.smokeAnim!, 500);

    this.effectEvent(EUnitEvent.SPECIAL);

    target.specialTileCheck(targetDestination);
    target.updatePosition(targetDestination);
    targetDestination.unit = target;

    this.specialTileCheck(unitDestination);
    this.updatePosition(unitDestination);
    unitDestination.unit = this;

    this.context.gameController.afterAction(EActionType.SPECIAL, targetDestination.boardPosition, unitDestination.boardPosition);
  };

  _calculateActionTiles(): { moveTiles: Tile[], attackTiles: Tile[], LOSBlocked: Tile[], specialTiles: Tile[] } {
    const board = this.context.gameController.board;
    const moveTiles = board.getTilesInRange(this.boardPosition, this.movement).filter(tile => !tile.unit);
    const [attackTiles, LOSBlocked] = board.getUnitsInRange(this, this.attackRange, true);
    // teleport
    let specialTiles: Tile[] = []
    board.tiles.forEach(row => row.forEach(tile => {
      if (tile.unit?.belongsTo === this.belongsTo) {
        specialTiles.push(tile);
      }
    }));

    return { moveTiles, attackTiles, LOSBlocked, specialTiles };
  }
}

export class Cleric extends Human {
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

    this.effectEvent(EUnitEvent.ATTACK);

    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (
      distance === 1 &&
      target instanceof Unit &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.CLERIC_ATTACK);
      target.removeFromGame();
    } else {
      if (this.hasEffect(EEffect.SUPERCHARGED_BUFF)) playSound(this.scene, EGameSounds.CLERIC_ATTACK_BIG);
      else playSound(this.scene, EGameSounds.CLERIC_ATTACK);
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    this.context.gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  special(targetTile: Tile): void {
    const target = targetTile.unit;
    if (target == undefined) {
      console.error("NO UNIT FOUND ON TARGET TILE WHEN ATTACKING");
      return;
    }
    this.flashActingUnit();

    playSound(this.scene, EGameSounds.HEAL);
    playSound(this.scene, EGameSounds.HEAL_EXTRA);

    turnIfBehind(this.context, this, target);

    this.effectEvent(EUnitEvent.HEAL);

    if (target.isKO) {
      const healingAmount = this.getTotalHealing(2);
      target.getsHealed(healingAmount);
    } else {
      const healingAmount = this.getTotalHealing(3);
      target.getsHealed(healingAmount);
    }

    this.context.gameController.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  };

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

export class DragonScale extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.DRAGON_SCALE;
    this.selectSound = EGameSounds.SHIELD_SELECT;
  }

  use(target: Tile): void {
    const unit = target.unit;
    if (unit) {
      playSound(this.scene, EGameSounds.DRAGON_SCALE_USE);
      unit.equipFactionBuff(this.boardPosition[1]);
      this.removeFromGame();
    }

  }
}

export class HealingPotion extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.HEALING_POTION;
    this.selectSound = EGameSounds.POTION_SELECT
  }

  use(target: Tile): void {
    const unit = target.unit;

    if (unit){
      playSound(this.scene, EGameSounds.POTION_USE);

      const potionImage = this.scene.add.image(unit.x, unit.y - 10, 'healingPotion').setDepth(100);
      useAnimation(potionImage);
  
      const healingAmount = unit.isKO ? 100 : 1000;
      unit.getsHealed(healingAmount);
  
      this.removeFromGame();
  
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
    }
  }
}

export class Inferno extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.INFERNO;
  };

  use(targetTile: Tile): void {
    const infernoImage = this.scene.add.image(targetTile.x, targetTile.y, 'infernoShockWave').setDepth(100);
    useAnimation(infernoImage, 3);
    playSound(this.scene, EGameSounds.INFERNO_USE);

    // Damages enemy units and crystals, and removes enemy KO'd units
    const damage = 350;

    const aoeTiles = getAOETiles(this.context, this, targetTile, false);
    const allTiles = [...aoeTiles.unitTiles, ...aoeTiles.crystalTiles];

    allTiles?.forEach(tile => {
      const unit =
        this.context.gameController.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController.board.crystals.find(c => c.boardPosition === tile.boardPosition);
      if (!unit) throw new Error('Inferno use() hero not found');

      // Inferno removes KO'd enemy units
      if (!(unit instanceof Crystal) && unit.isKO) {
        unit.removeFromGame(true);
        return;
      }

      unit.getsDamaged(damage, EAttackType.MAGICAL);
    });

    this.removeFromGame();
    this.context.gameController.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);
  }

  showActions(): void {
    playSound(this.context, EGameSounds.AOE_SPELL_SELECT);
    this.context.gameController.board.tiles.forEach(row => {row.forEach(tile => {
        tile.setHighlight(EReticle.MOVE, this, this.use)
      });
    });
  }
}
