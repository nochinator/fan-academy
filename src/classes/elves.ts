import { EAction } from "../enums/gameEnums";
import { createElvesImpalerData, createElvesNecromancerData, createElvesPhantomData, createElvesPriestessData, createElvesVoidMonkData, createElvesWraithData } from "../gameData/elvesHeroData";
import { IHero } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { Hero } from "./hero";

export class Impaler extends Hero {
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
    target.currentHealth -= this.power;
    if (target.currentHealth <= 0) target.knockedDown();

    await gameController.pullEnemy(this, target);

    gameController?.afterAction(EAction.ATTACK, this, target);
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class VoidMonk extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesVoidMonkData(data));
  }
  // TODO: add aoe to attack
  override attack(target: Hero): void {
    console.log('VoidMonk attack logs');
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Necromancer extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesNecromancerData(data));
  }
  // TODO: add phantom check to attack
  override attack(target: Hero): void {
    console.log('Necromancer attack logs');
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Priestess extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPriestessData(data));
  }
  // TODO: add healing and revive
  override attack(target: Hero): void {
    console.log('Priestess attack logs');
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Wraith extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesWraithData(data));
  }
  // TODO: add consuming units
  override attack(target: Hero): void {
    console.log('Wraith attack logs');
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}

export class Phantom extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPhantomData(data));
  }
  override attack(target: Hero): void {
    console.log('Phantom attack logs');
  }

  heal(target: Hero): void {};

  revive(target: Hero): void {};

  teleport(target: Hero): void {};
}