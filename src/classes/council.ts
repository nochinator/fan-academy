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
    const attacker = this.context.activeUnit!;

    const attackerTile = gameController.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = gameController.board.getTileFromBoardPosition(target.boardPosition);

    if (!attackerTile || !targetTile) {
      console.error('Archer attack() No attacker or target tile found');
      return;
    }

    const distance = getGridDistance(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col );

    if (distance === 1) {
      target.currentHealth -= this.power / 2;
    } else {
      target.currentHealth -= this.power;
    }

    if (target.currentHealth <= 0) target.knockedDown();
    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  move(x: number, y: number): void {};

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Knight extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilKnightData(data));
  }

  override async attack(target: Hero): Promise<void> {
    console.log('Knight attack logs');
    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }
    target.currentHealth -= this.power;
    if (target.currentHealth <= 0) target.knockedDown();

    await gameController.pushEnemy(this, target);

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  move(x: number, y: number): void {};

  heal(target: Hero): void {};

  revive(target: Hero): void {};

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

  move(x: number, y: number): void {};

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Ninja extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilNinjaData(data));
  }
  // TODO: add teleport function and dmg (m/r)
  override attack(target: Hero): void {
    console.log('Ninja attack logs');
  }

  move(x: number, y: number): void {};

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Cleric extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilClericData(data));
  }
  // TODO: add healing/revive functions
  override attack(target: Hero): void {
    console.log('Cleric attack logs');
  }

  move(x: number, y: number): void {};

  heal(target: Hero): void {};

  revive(target: Hero): void {};

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