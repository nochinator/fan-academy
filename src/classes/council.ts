import { EActionType, EAttackType, EGameSounds, EHeroes } from "../enums/gameEnums";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, isEnemySpawn, isOnBoard, playSound, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Board } from "./board";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export abstract class Human extends Hero {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

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

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }
}

export class Archer extends Human {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();

    const distance = this.getDistanceToTarget(target);

    turnIfBehind(this.context, this, target);

    let delay = 0;

    if (distance === 1) {
      // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
      if (
        target instanceof Hero &&
        target.isKO &&
        isEnemySpawn(this.context, target.getTile())
      ) {
        playSound(this.scene, EGameSounds.ARCHER_ATTACK_MELEE);
        delay = 500

        target.removeFromGame();
      } else {
        playSound(this.scene, EGameSounds.ARCHER_ATTACK_MELEE);
        delay = 500

        target.getsDamaged(this.getTotalPower(0.5), this.attackType, delay);
        this.removeAttackModifiers();
      }
    } else {
      if (this.superCharge) playSound(this.scene, EGameSounds.ARCHER_ATTACK_BIG); delay = 750;
      if (!this.superCharge) playSound(this.scene, EGameSounds.ARCHER_ATTACK); delay = 600;

      target.getsDamaged(this.getTotalPower(), this.attackType, delay);
      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.isKO && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Knight extends Human {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();

    const gameController = this.context.gameController!;
    turnIfBehind(this.context, this, target);

    let delay = 0;

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.KNIGHT_ATTACK);
      target.removeFromGame();
    } else {
      if (this.superCharge) playSound(this.scene, EGameSounds.KNIGHT_ATTACK_BIG); delay = 750;
      if (!this.superCharge)playSound(this.scene, EGameSounds.KNIGHT_ATTACK); delay = 500;

      target.getsDamaged(this.getTotalPower(), this.attackType, delay);

      if (target instanceof Hero && target.unitType !== EHeroes.PHANTOM) gameController.pushEnemy(this, target);

      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.isKO && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Wizard extends Human {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();

    const gameController = this.context.gameController!;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      distance === 1 &&
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      playSound(this.scene, EGameSounds.WIZARD_ATTACK);
      target.removeFromGame();
    } else {
      if (this.superCharge) playSound(this.scene, EGameSounds.WIZARD_ATTACK_BIG);
      if (!this.superCharge) playSound(this.scene, EGameSounds.WIZARD_ATTACK);

      // Get directions for finding out the next targets
      const attackDirection = gameController.board.getAttackDirection(this.boardPosition, target.boardPosition);
      const opponentDirection = this.context.isPlayerOne ? [2, 3, 4] : [6, 7, 8];

      // Collect all targets
      let targets: (Hero | Crystal)[] = [target];

      const secondTarget = this.getNextTarget(target, attackDirection, opponentDirection, gameController.board, false);
      if (secondTarget) {
        targets.push(secondTarget);
        const thirdTarget = this.getNextTarget(secondTarget, attackDirection, opponentDirection, gameController.board, false, [target.boardPosition, secondTarget.boardPosition]);
        if (thirdTarget) {
          targets.push(thirdTarget);
        }
      }

      const damageMultipliers = [1, 0.75, 0.56];
      const delayIncrements = [650, 775, 900];
  
      targets.forEach((currentTarget, index) => {
        const power = this.getTotalPower() * (damageMultipliers[index] || 0);
        const delay = delayIncrements[index] || delayIncrements[0];
        currentTarget.getsDamaged(power, this.attackType, delay);
        if (currentTarget && currentTarget instanceof Hero && currentTarget.isKO && currentTarget.unitType === EHeroes.PHANTOM) currentTarget.removeFromGame();
      });

      this.removeAttackModifiers();
    }

    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getNextTarget(target: Hero | Crystal, attackDirection: number, opponentDirection: number[], board: Board, isLastTarget: boolean, toIgnore?: number[]): Hero | Crystal | undefined {
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

    if (bestTarget.hero) {
      const hero = board.units.find(unit => unit.unitId === bestTarget.hero!.unitId);
      if (hero) return hero;
    }

    if (bestTarget.crystal) {
      const crystal = board.crystals.find(c => c.boardPosition === bestTarget.crystal!.boardPosition);
      if (crystal) return crystal;
    }

    throw new Error("getNextTarget() Target found on tile, but not in board units or crystals");
  }

  getAdjacentEnemyTiles(boardPosition: number, ignorePosition: number[] = []): Tile[] {
    const adjacentOffsets = [-10, -9, -8, -1, +1, +8, +9, +10];
    const leftOffset = [-10, -1, +8];
    const rightOffset = [+10, +1, -8];
    const adjacentTiles: Tile[] = [];
    const boardWidth = 9;

    const isOnLeftEdge = boardPosition % boardWidth === 0;
    const isOnRightEdge = (boardPosition + 1) % boardWidth === 0;

    for (const offset of adjacentOffsets) {
      if (isOnLeftEdge && leftOffset.includes(offset) ||
          isOnRightEdge && rightOffset.includes(offset)) continue;

      const tilePosition = boardPosition + offset;

      if (isOnBoard(tilePosition) && !ignorePosition.includes(tilePosition)) {
        const tile = this.context.gameController!.board.getTileFromBoardPosition(tilePosition);
        if (canBeAttacked(this, tile)) adjacentTiles.push(tile);
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

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Ninja extends Human {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();

    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    let delay = 0;
    const ninjaAttackSound = () => {
      if (this.superCharge) playSound(this.scene, EGameSounds.NINJA_ATTACK_BIG); delay = 650;
      if (distance === 1) playSound(this.scene, EGameSounds.NINJA_ATTACK); delay = 500;
      if (distance !== 1) playSound(this.scene, EGameSounds.NINJA_ATTACK_RANGED); delay = 500
    };

    if (distance === 1) {
      // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
      if (
        target instanceof Hero &&
        target.isKO &&
        isEnemySpawn(this.context, target.getTile())
      ) {
        playSound(this.scene, EGameSounds.NINJA_ATTACK);
        target.removeFromGame();
      } else {
        ninjaAttackSound();
        target.getsDamaged(this.getTotalPower(2), this.attackType, delay);
        this.removeAttackModifiers();
      }
    } else {
      ninjaAttackSound();
      target.getsDamaged(this.getTotalPower(), this.attackType, delay);
      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.isKO && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  teleport(target: Hero): void {
    playSound(this.scene, EGameSounds.NINJA_SMOKE);
    const targetDestination = this.getTile();
    const unitDestination = target.getTile();

    // Smoke bomb animation
    this.singleTween(this.smokeAnim!, 500);
    target.singleTween(target.smokeAnim!, 500);

    target.specialTileCheck(targetDestination.tileType, unitDestination.tileType);
    target.updatePosition(targetDestination);
    targetDestination.hero = target.exportData();

    this.specialTileCheck(unitDestination.tileType, targetDestination.tileType);
    this.updatePosition(unitDestination);
    unitDestination.hero = this.exportData();

    this.context.gameController!.afterAction(EActionType.TELEPORT, targetDestination.boardPosition, unitDestination.boardPosition);
  };

  heal(_target: Hero): void {};
}

export class Cleric extends Human {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();

    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    let delay = 0;

    if (
      distance === 1 &&
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      if (!this.superCharge) playSound(this.scene, EGameSounds.CLERIC_ATTACK);
      target.removeFromGame();
    } else {
      if (this.superCharge) playSound(this.scene, EGameSounds.CLERIC_ATTACK_BIG); delay = 750;
      if (!this.superCharge) playSound(this.scene, EGameSounds.CLERIC_ATTACK); delay = 300;
      target.getsDamaged(this.getTotalPower(), this.attackType, delay);
      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.isKO && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {
    this.flashActingUnit();

    turnIfBehind(this.context, this, target);

    if (target.isKO) {
      const healingAmount = this.getTotalHealing(2);
      target.getsHealed(healingAmount);
    } else {
      const healingAmount = this.getTotalHealing(3);
      target.getsHealed(healingAmount);
    }

    this.removeAttackModifiers();

    this.context.gameController?.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);

    playSound(this.scene, EGameSounds.HEAL);
    setTimeout(playSound, 750, this.scene, EGameSounds.HEAL_EXTRA);
  };

  teleport(_target: Hero): void {};
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

export class HealingPotion extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(target: Hero): void {
    playSound(this.scene, EGameSounds.POTION_USE);

    const potionImage = this.scene.add.image(target.x, target.y - 10, 'healingPotion').setDepth(100);
    useAnimation(potionImage);

    const healingAmount = target.isKO ? 100 : 1000;
    target.getsHealed(healingAmount);

    this.removeFromGame();

    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
  }
}

export class Inferno extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  };

  use(targetTile: Tile): void {
    const infernoImage = this.scene.add.image(targetTile.x, targetTile.y, 'infernoShockWave').setDepth(100);
    useAnimation(infernoImage, 3);
    playSound(this.scene, EGameSounds.INFERNO_USE);

    // Damages enemy units and crystals, and removes enemy KO'd units
    const damage = 350;

    const { enemyHeroTiles, enemyCrystalTiles } = getAOETiles(this.context, this, targetTile);

    enemyHeroTiles?.forEach(tile => {
      const hero = this.context.gameController!.board.units.find(unit => unit.boardPosition === tile.boardPosition);
      if (!hero) throw new Error('Inferno use() hero not found');

      // Inferno removes KO'd enemy units
      if (hero.isKO){
        hero.removeFromGame(true);
        return;
      }

      hero.getsDamaged(damage, EAttackType.MAGICAL, 800);

      if (hero && hero instanceof Hero && hero.unitType === EHeroes.PHANTOM) hero.removeFromGame();
    });

    enemyCrystalTiles.forEach(tile => {
      const crystal = this.context.gameController!.board.crystals.find(crystal => crystal.boardPosition === tile.boardPosition);
      if (!crystal) throw new Error('Inferno use() crystal not found');

      if (crystal.belongsTo !== this.belongsTo) crystal.getsDamaged(damage, EAttackType.MAGICAL, 800);
    });

    this.removeFromGame();
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);
  }
}
