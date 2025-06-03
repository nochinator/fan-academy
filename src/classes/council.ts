import { EActionType, EAttackType } from "../enums/gameEnums";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "../gameData/councilHeroData";
import { createItemData } from "../gameData/itemData";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, canBeAttacked, getAOETiles, getGridDistance, isOnBoard } from "../utils/gameUtils";
import { Board } from "./board";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export abstract class Human extends Hero {
  constructor(context: GameScene, data: IHero) {
    super(context, data);
  }

  equipFactionBuff(handPosition: number): void {
    this.factionBuff = true;
    this.factionBuffImage.setVisible(true);
    this.physicalDamageResistance += 20;

    this.increaseMaxHealth(this.maxHealth * 10 / 100);

    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }
}

export class Archer extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilArcherData(data));
  }
  attack(target: Hero | Crystal): void {
    const distance = this.getDistanceToTarget(target);

    if (distance === 1) {
      target.getsDamaged(this.getTotalPower(0.5), this.attackType);
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    this.powerModifier = 0;
    if (this.superCharge) this.superCharge = false;

    this.context.gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Knight extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilKnightData(data));
  }

  async attack(target: Hero | Crystal): Promise<void> {
    const gameController = this.context.gameController!;

    target.getsDamaged(this.getTotalPower(), this.attackType);

    if (target instanceof Hero) await gameController.pushEnemy(this, target);

    this.powerModifier = 0;
    if (this.superCharge) this.superCharge = false;

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Wizard extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilWizardData(data));
  }
  attack(target: Hero | Crystal): void {
    const gameController = this.context.gameController!;

    // Get directions for finding out the next targets
    const attackDirection = gameController.board.getAttackDirection(this.boardPosition, target.boardPosition);
    const opponentDirection = this.context.isPlayerOne ? [2, 3, 4] : [6, 7, 8];

    // Get targets
    const secondTarget = this.getNextTarget(target, attackDirection, opponentDirection, gameController.board, false);
    let thirdTarget: Hero | Crystal | undefined;
    if (secondTarget) thirdTarget = this.getNextTarget(secondTarget, attackDirection, opponentDirection, gameController.board, false, [target.boardPosition, secondTarget.boardPosition]);

    // Apply damage to targets
    target.getsDamaged(this.getTotalPower(), this.attackType);
    if (secondTarget) secondTarget.getsDamaged(this.getTotalPower(), this.attackType);
    if (thirdTarget) thirdTarget.getsDamaged(this.getTotalPower(), this.attackType);

    this.powerModifier = 0;
    if (this.superCharge) this.superCharge = false;

    gameController.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getNextTarget(target: Hero | Crystal, attackDirection: number, opponentDirection: number[], board: Board, isLastTarget: boolean, toIgnore?: number[]): Hero | Crystal {
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
       *    -being in the direction of the oponent's side of the board
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

    console.log('best target is', bestTarget);
    if (!bestTarget) {
      throw new Error("getNextTarget() No suitable adjacent target found.");
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
    const adjacentBoardPositions = [-10, -9, -8, -1, +1, +8, +9, +10];

    const adjacentTiles: Tile[] = [];

    adjacentBoardPositions.forEach(adjacentBp => {
      const tilePosition = boardPosition + adjacentBp;

      if (isOnBoard(tilePosition)) {
        const tile = this.context.gameController!.board.getTileFromBoardPosition(tilePosition);

        if (canBeAttacked(this.context, tile) &&
        !ignorePosition.includes(tile.boardPosition)) {
          adjacentTiles.push(tile);
        }}
    });

    if (!adjacentTiles.length) console.error('getAdjacentTiles() No tiles found');

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

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Ninja extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilNinjaData(data));
  }
  attack(target: Hero | Crystal): void {
    const gameController = this.context.gameController!;

    const attackerTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return;
    }

    const distance = getGridDistance(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col );

    console.log('distance', distance);

    if (distance === 1) {
      target.getsDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    this.powerModifier = 0;
    if (this.superCharge) this.superCharge = false;

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  teleport(target: Hero): void {
    const gameController = this.context.gameController!;

    const targetDestination = this.getTile();
    const unitDestination = target.getTile();
    const targetBoardPosition = target.boardPosition;

    target.updatePosition(this.boardPosition);
    targetDestination.hero = target.exportData();

    this.updatePosition(targetBoardPosition);
    unitDestination.hero = this.exportData();

    gameController?.afterAction(EActionType.TELEPORT, this.boardPosition, target.boardPosition);
  };

  heal(target: Hero): void {};
}

export class Cleric extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilClericData(data));
  }
  attack(target: Hero | Crystal): void {
    const gameController = this.context.gameController!;

    target.getsDamaged(this.getTotalPower(), this.attackType);

    this.powerModifier = 0;
    if (this.superCharge) this.superCharge = false;

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {
    if (target.isKO) {
      target.getsHealed(this.power * 2);
    } else {
      target.getsHealed(this.power * 3);
    }

    this.context.gameController?.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);
  };

  teleport(target: Hero): void {};
}

export class DragonScale extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    target.equipFactionBuff(this.boardPosition);
    this.removeFromGame();
  }
}

export class HealingPotion extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    const healingAmount = target.isKO ? 100 : 1000;
    target.getsHealed(healingAmount);

    this.context.gameController?.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);

    this.removeFromGame();
  }
}

export class Inferno extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData({
      dealsDamage: true,
      ...data
    }));
  }

  use(targetTile: Tile): void {
    // Damages enemy units and crystals, and removes enemy KO'd units
    const damage = 350;

    const { enemyHeroTiles, enemyCrystalTiles } = getAOETiles(this.context, targetTile);

    enemyHeroTiles?.forEach(tile => {
      const hero = this.context.gameController?.board.units.find(unit => unit.boardPosition === tile.boardPosition);
      if (!hero) throw new Error('Inferno use() hero not found');

      // Inferno removes KO'd enemy units
      if (hero.isKO){
        hero.removeFromGame();
        return;
      }

      hero.getsDamaged(damage, EAttackType.MAGICAL);
    });

    enemyCrystalTiles.forEach(tile => {
      const crystal = this.context.gameController?.board.crystals.find(crystal => crystal.boardPosition === tile.boardPosition);
      if (!crystal) throw new Error('Inferno use() crystal not found');

      if (!belongsToPlayer(this.context, crystal)) {
        crystal.getsDamaged(damage);
      }
    });

    this.context.gameController?.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);

    this.removeFromGame();
  }
}