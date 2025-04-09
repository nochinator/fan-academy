import { IHero } from "../interfaces/gameInterface";
import { Hero } from "./hero";
import GameScene from "../scenes/game.scene";
import { createElvesImpalerData, createElvesNecromancerData, createElvesPhantomData, createElvesPriestessData, createElvesVoidMonkData, createElvesWraithData } from "../lib/unitData/elvesHeroData";

export class Impaler extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesImpalerData(data));
  }
  // TODO: add pull to attack
}

export class VoidMonk extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesVoidMonkData(data));
  }
  // TODO: add aoe to attack
}

export class Necromancer extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesNecromancerData(data));
  }
  // TODO: add phantom check to attack
}

export class Priestess extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPriestessData(data));
  }
  // TODO: add healing and revive
}

export class Wraith extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesWraithData(data));
  }
  // TODO: add consuming units
}

export class Phantom extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createElvesPhantomData(data));
  }
}