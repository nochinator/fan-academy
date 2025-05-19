import { EActionType } from "../enums/gameEnums";
import { createElvesImpalerData, createElvesNecromancerData, createElvesPhantomData, createElvesPriestessData, createElvesVoidMonkData, createElvesWraithData } from "../gameData/elvesHeroData";
import { createItemData } from "../gameData/itemData";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
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
      this.getsHealed(damage * 67 / 100);
    } else {
      this.getsHealed(damage * 33 / 100);
    }
  }
}

export class Impaler extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesImpalerData(data));
  }
  override async attack(target: Hero): Promise<void> {
    console.log('Impaler attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
    this.lifeSteal(damageDone);

    await gameController.pullEnemy(this, target);

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
  override attack(target: Hero): void {
    console.log('VoidMonk attack logs');
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Necromancer extends DarkElf {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesNecromancerData(data));
  }
  override attack(target: Hero): void {
    console.log('Necromancer attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    if (target.isKO) {
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
      this.lifeSteal(damageDone);

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
  override attack(target: Hero): void {
    console.log('Priestess attack logs');

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('hero attack() No gameController found');
      return;
    }

    const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
    this.lifeSteal(damageDone);

    // Apply a 50% debuff to the target's next attack
    target.modifyPower(-50); // TODO: add debuff animation

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  override heal(target: Hero): void {
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
  override attack(target: Hero): void {
    console.log('Wraith attack logs');
  }

  heal(target: Hero): void {};
  teleport(target: Hero): void {};
}

export class Phantom extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPhantomData(data));
  }
  override attack(target: Hero): void {
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

// TODO:
export class SoulHarvest extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData({
      dealsDamage: true,
      ...data
    }));
  }

  use(targetNewTile: Tile): void {
    // Damages crystals but doesn't remove enemy units
    // Revive KO'd friendly units anywhere in the map healing them and raising their life total by the dmg done value
    this.removeFromGame();
  }
}
