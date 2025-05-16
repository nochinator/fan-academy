import { EAction } from "../enums/gameEnums";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "../gameData/councilHeroData";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { getGridDistance } from "../utils/gameUtils";
import { Hero } from "./hero";

export class Archer extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilArcherData(data));
  }
  override attack(target: Hero): void {
    console.log('Archer attack logs');
    const gameController = this.context.gameController!;

    const attackerTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return;
    }

    const distance = getGridDistance(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col );

    if (distance === 1) {
      target.getDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getDamaged(this.getTotalPower(), this.attackType);
    }

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Knight extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilKnightData(data));
  }

  override async attack(target: Hero): Promise<void> {
    console.log('Knight attack logs');

    const gameController = this.context.gameController!;

    target.getDamaged(this.getTotalPower(), this.attackType);

    await gameController.pushEnemy(this, target);

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Wizard extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilWizardData(data));
  }
  // TODO: add chain attack
  override attack(target: Hero): void {
    console.log('Wizard attack logs');
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Ninja extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilNinjaData(data));
  }
  override attack(target: Hero): void {
    console.log('Ninja attack logs');
    const gameController = this.context.gameController!;

    const attackerTile = gameController.board.getTileFromBoardPosition(this.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return;
    }

    const distance = getGridDistance(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col );

    if (distance === 1) {
      target.getDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getDamaged(this.getTotalPower(), this.attackType);
    }

    gameController?.afterAction(EAction.ATTACK, this, target);
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

    gameController?.afterAction(EAction.TELEPORT, this, target);
  };

  heal(target: Hero): void {};
}

export class Cleric extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilClericData(data));
  }
  override attack(target: Hero): void {
    console.log('Cleric attack logs');

    const gameController = this.context.gameController!;

    target.getDamaged(this.getTotalPower(), this.attackType);

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  override heal(target: Hero): void {
    if (target.currentHealth === 0) {
      target.getHealed(this.power * 2);
      target.revived();
    } else {
      target.getHealed(this.power * 3);
    }

    this.context.gameController?.afterAction(EAction.HEAL, this, target);
  };

  teleport(target: Hero): void {};
}

// FIXME:
// export class ShiningHelm extends Item {
//   constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
//     super(context, createItemData({
//       unitId,
//       itemType: EItems.SHINING_HELM,
//       boardPosition,
//     }));
//   }
// }

// export class HealingPotion extends Item {
//   constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
//     super(context, createItemData({
//       unitId,
//       itemType: EItems.HEALING_POTION,
//       boardPosition
//     }));
//   }
// }

// export class Inferno extends Item {
//   constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
//     super(context, {
//       unitId,
//       itemType: EItems.INFERNO,
//       boardPosition
//     });
//   }
// }