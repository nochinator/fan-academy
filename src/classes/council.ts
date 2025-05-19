import { EActionType, EAttackType, EItems, ETiles } from "../enums/gameEnums";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "../gameData/councilHeroData";
import { createItemData } from "../gameData/itemData";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { getAOETiles, getGridDistance, isHero, isItem } from "../utils/gameUtils";
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
      target.getsDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Knight extends Human {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilKnightData(data));
  }

  override async attack(target: Hero): Promise<void> {
    console.log('Knight attack logs');

    const gameController = this.context.gameController!;

    target.getsDamaged(this.getTotalPower(), this.attackType);

    await gameController.pushEnemy(this, target);

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Wizard extends Human {
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

export class Ninja extends Human {
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
      target.getsDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

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
  override attack(target: Hero): void {
    console.log('Cleric attack logs');

    const gameController = this.context.gameController!;

    target.getsDamaged(this.getTotalPower(), this.attackType);

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  override heal(target: Hero): void {
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
    const { enemyHeroTiles, enemyCrystalTiles } = getAOETiles(this.context, targetTile);

    enemyHeroTiles?.forEach(tile => {
      const hero = this.context.gameController?.board.units.find(unit => unit.boardPosition === tile.boardPosition);
      if (!hero) throw new Error('Inferno use() hero not found');

      // Inferno removes KO'd enemy units
      if (hero.isKO){
        hero.removeFromGame();
        return;
      }

      hero.getsDamaged(350, EAttackType.MAGICAL);
    });

    enemyCrystalTiles.forEach(tile => {
      // TODO: I need a crystal class with a check to see if the crystal is friendly
    });

    this.context.gameController?.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);

    this.removeFromGame();
  }
}