import { EAction } from "../enums/gameEnums";
import { createElvesImpalerData, createElvesNecromancerData, createElvesPhantomData, createElvesPriestessData, createElvesVoidMonkData, createElvesWraithData } from "../gameData/elvesHeroData";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { Hero } from "./hero";

export abstract class DarkElf extends Hero {
  constructor(context: GameScene, data: IHero) {
    super(context, data);
  }

  lifeSteal(damage: number): void {
    if (this.factionBuff) {
      this.getHealed(damage * 67 / 100);
    } else {
      this.getHealed(damage * 33 / 100);
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

    const damageDone = target.getDamaged(this.getTotalPower(), this.attackType);
    this.lifeSteal(damageDone);

    await gameController.pullEnemy(this, target);

    gameController?.afterAction(EAction.ATTACK, this, target);
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

      target.removeFromBoard();

      tile.hero = phantom.exportData();

      gameController?.afterAction(EAction.ATTACK, this, target);
      gameController?.addActionToState(EAction.SPAWN, this, phantom); // Adding action directly to state. It shares the turnActionNumber of the attack
    } else {
      const damageDone = target.getDamaged(this.getTotalPower(), this.attackType);
      this.lifeSteal(damageDone);

      gameController?.afterAction(EAction.ATTACK, this, target);
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

    const damageDone = target.getDamaged(this.getTotalPower(), this.attackType);
    this.lifeSteal(damageDone);

    // Apply a 50% debuff to the target's next attack
    target.modifyPower(-50); // TODO: add debuff animation

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  override heal(target: Hero): void {
    if (target.currentHealth === 0) {
      target.getHealed(this.power / 2);
      target.revived();
    } else {
      target.getHealed(this.power * 2);
    }

    // Update target tile data
    target.updateTileData();

    this.context.gameController?.afterAction(EAction.HEAL, this, target);
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
    target.getDamaged(this.getTotalPower(), this.attackType);

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  heal(target: Hero): void {};

  teleport(target: Hero): void {};
}

function createGenericElvesData(data: Partial<IHero>): IHero {
  throw new Error("Function not implemented.");
}
