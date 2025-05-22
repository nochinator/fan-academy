import { EActionType, EAttackType, EItems, ETiles } from "../enums/gameEnums";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "../gameData/councilHeroData";
import { createItemData } from "../gameData/itemData";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, getAOETiles, getGridDistance, isHero, isItem } from "../utils/gameUtils";
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
      target.getsDamaged(this.getTotalPower(2), this.attackType);
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);
    }

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
  attack(target: Hero | Crystal): void {

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