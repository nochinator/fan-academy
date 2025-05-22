import { EActionType, EAttackType } from "../enums/gameEnums";
import { createElvesImpalerData, createElvesNecromancerData, createElvesPhantomData, createElvesPriestessData, createElvesVoidMonkData, createElvesWraithData } from "../gameData/elvesHeroData";
import { createItemData } from "../gameData/itemData";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, getAOETiles, roundToFive } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export abstract class DarkElf extends Hero {
  constructor(context: GameScene, data: IHero) {
    super(context, data);
  }

  equipFactionBuff(handPosition: number): void {
    this.factionBuff = true;
    this.factionBuffImage.setVisible(true);
    this.increaseMaxHealth(this.maxHealth * 10 / 100);

    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  lifeSteal(damage: number): void {
    if (this.factionBuff) {
      console.log('Soul Stone equipped');
      const roundedHealing = roundToFive(damage * 67 / 100);
      this.getsHealed(roundedHealing);
    } else {
      const roundedHealing = roundToFive(damage * 33 / 100);
      this.getsHealed(roundedHealing);
    }
  }
}

export class Impaler extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesImpalerData(data));
  }
  async attack(target: Hero | Crystal): Promise<void> {
    console.log('Impaler attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
    if (damageDone) this.lifeSteal(damageDone);

    if (target instanceof Hero) await gameController.pullEnemy(this, target);

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class VoidMonk extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesVoidMonkData(data));
  }
  // TODO: add aoe to attack
  attack(target: Hero | Crystal): void {
    console.log('VoidMonk attack logs');
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Necromancer extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesNecromancerData(data));
  }
  attack(target: Hero | Crystal): void {
    console.log('Necromancer attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    if (target instanceof Hero && target.isKO) {
      const phantom = new Phantom(this.context, {
        unitId: `${this.context.userId}_phantom_${++this.context.gameController!.phantomCounter}`,
        boardPosition: target.boardPosition
      });

      const tile = target.getTile();

      target.removeFromGame();

      tile.hero = phantom.exportData();

      gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
      gameController?.addActionToState(EActionType.SPAWN_PHANTOM, this.boardPosition); // Adding action directly to state. It shares the turnActionNumber of the attack
    } else {
      const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
      if (damageDone) this.lifeSteal(damageDone);

      gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
    }
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Priestess extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPriestessData(data));
  }
  attack(target: Hero | Crystal): void {
    console.log('Priestess attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
    if (damageDone) this.lifeSteal(damageDone);

    // Apply a 50% debuff to the target's next attack
    if (target instanceof Hero) target.modifyPower(-50); // TODO: add debuff animation

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {
    if (target.isKO) {
      target.getsHealed(this.power / 2);
    } else {
      target.getsHealed(this.power * 2);
    }

    this.context.gameController?.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);
  };

  teleport(target: Hero): void {};
}

export class Wraith extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesWraithData(data));
  }
  // TODO: add consuming units
  attack(target: Hero | Crystal): void {
    console.log('Wraith attack logs');
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Phantom extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPhantomData(data));
  }
  attack(target: Hero | Crystal): void {
    console.log('Phantom attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }
    target.getsDamaged(this.getTotalPower(), this.attackType);

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
  equipFactionBuff(): void {}
}

export class SoulStone extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    target.equipFactionBuff(this.boardPosition);
    this.removeFromGame();
  }
}

export class ManaVial extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    if (target.isKO) return;
    target.getsHealed(1000);
    target.increaseMaxHealth(50);

    this.context.gameController?.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class SoulHarvest extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData({
      dealsDamage: true,
      ...data
    }));
  }

  use(targetTile: Tile): void {
    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('SoulHarvest use() No gamecontroller');
      return;
    }
    // Damages enemy units and crystals but doesn't remove KO'd enemy units
    const damage = 100;

    const { enemyHeroTiles, enemyCrystalTiles } = getAOETiles(this.context, targetTile);

    // Keep track of the cumulative damage done (not attack power used) to enemy heroes (not crystals)
    let totalDamageInflicted = 0;

    enemyHeroTiles?.forEach(tile => {
      const hero = gameController.board.units.find(unit => unit.boardPosition === tile.boardPosition);

      if (!hero) throw new Error('Inferno use() hero not found');
      if (hero.isKO) return;

      totalDamageInflicted += hero.getsDamaged(damage, EAttackType.MAGICAL);
    });

    enemyCrystalTiles.forEach(tile => {
      const crystal = gameController.board.crystals.find(crystal => crystal.boardPosition === tile.boardPosition);
      if (!crystal) throw new Error('Inferno use() crystal not found');

      if (!belongsToPlayer(this.context, crystal)) {
        crystal.getsDamaged(damage);
      }
    });

    // Get total amount of friendly units in the map, including KO'd ones
    const friendlyUnits = gameController.board.units.filter(unit => unit.belongsTo === this.belongsTo);

    // Divide damage dealt by that number + 3, then round to nearest 5. Formula: 1 / (units + 3) * damage
    const lifeIncreaseAmount = roundToFive(1 / (friendlyUnits.length + 3) * totalDamageInflicted);

    console.log('totalDamageInflicted', totalDamageInflicted);
    console.log('friendlyUnits', friendlyUnits);
    console.log('lifeIncreaseAmount', lifeIncreaseAmount);

    // Increase max health of all units, including KO'd ones, and revive them
    friendlyUnits.forEach(unit => unit.increaseMaxHealth(lifeIncreaseAmount));

    gameController.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);

    this.removeFromGame();
  }
}
