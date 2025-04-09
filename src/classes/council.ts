import { IHero } from "../interfaces/gameInterface";
import { EItems } from "../enums/gameEnums";
import { Hero } from "./hero";
import { Item } from "./item";
import GameScene from "../scenes/game.scene";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "../lib/unitData/councilHeroData";
import { createItemData } from "../lib/unitData/itemData";

export class Archer extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilArcherData(data));
  }
  // TODO: dmg (m/r)
}

export class Knight extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilKnightData(data));
  }
  // TODO: add push to attack
}

export class Wizard extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilWizardData(data));
  }
  // TODO: add chain attack
}

export class Ninja extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilNinjaData(data));
  }
  // TODO: add teleport function and dmg (m/r)
}

export class Cleric extends Hero {
  constructor(context: GameScene, data: Partial<IHero>) {
    super(context, createCouncilClericData(data));
  }
  // TODO: add healing/revive functions
}

export class ShiningHelm extends Item {
  constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
    super(context, createItemData({
      unitId,
      itemType: EItems.SHINING_HELM,
      boardPosition
    }));
  }
}

export class HealingPotion extends Item {
  constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
    super(context, {
      unitId,
      itemType: EItems.HEALING_POTION,
      boardPosition
    });
  }
}

export class Inferno extends Item {
  constructor(context: GameScene, unitId: string, boardPosition: number = 51) {
    super(context, {
      unitId,
      itemType: EItems.INFERNO,
      boardPosition
    });
  }
}