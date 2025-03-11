import { Unit } from "./unit";
import { IFaction, IUnit } from "../interfaces/gameInterface";
import { EAttackType, EFaction } from "../enums/gameEnums";
import { shuffleArray } from "../utils/shuffleArray";

export class Impaler extends Unit {
  constructor(
    data: {
      unitId: string,
      boardPosition?: number,
      currentHealth?: number,
      isKO?: boolean,
      dragonScale?: boolean,
      runeMetal?: boolean,
      shiningHelm?: boolean
    }
  ) {
    const maxHealth  = 800;

    super(
      {
        unitClass: "hero",
        unitType: 'impaler',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 0, // positions go from 0-50, 0 being the deck and 46-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.PHYSICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 300,
        healingPower: 0, // If > 0, the unit can heal
        physicalDamageResistance: 0,
        magicalDamageResistance: 0,
        dragonScale: data.dragonScale ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

// FIXME: correct data after testing
export class VoidMonk extends Unit {
  constructor(
    data: {
      unitId: string,
      boardPosition?: number,
      currentHealth?: number,
      isKO?: boolean,
      dragonScale?: boolean,
      runeMetal?: boolean,
      shiningHelm?: boolean
    }
  ) {
    const maxHealth  = 800;

    super(
      {
        unitClass: "hero",
        unitType: 'voidMonk',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 0, // positions go from 0-50, 0 being the deck and 46-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.PHYSICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 300,
        healingPower: 0, // If > 0, the unit can heal
        physicalDamageResistance: 0,
        magicalDamageResistance: 0,
        dragonScale: data.dragonScale ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class Necromancer extends Unit {
  constructor(
    data: {
      unitId: string,
      boardPosition?: number,
      currentHealth?: number,
      isKO?: boolean,
      dragonScale?: boolean,
      runeMetal?: boolean,
      shiningHelm?: boolean
    }
  ) {
    const maxHealth  = 800;

    super(
      {
        unitClass: "hero",
        unitType: 'necromancer',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 0, // positions go from 0-50, 0 being the deck and 46-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.PHYSICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 300,
        healingPower: 0, // If > 0, the unit can heal
        physicalDamageResistance: 0,
        magicalDamageResistance: 0,
        dragonScale: data.dragonScale ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class ElvesFaction implements IFaction {
  factionName: string;
  unitsInHand: IUnit[];
  unitsInDeck: IUnit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;

  constructor(
    unitsOnBoard?: IUnit[],
    unitsInDeck?: IUnit[],
    unitsInHand?: IUnit[],
    cristalOneHealth?: number,
    cristalTwoHealth?: number

  ) {
    const newDeck = unitsInDeck ?? this.createElvesDeck(); // REVIEW:
    const startingHand = unitsInHand ?? newDeck.splice(0, 6) ;

    this.factionName = EFaction.DARK_ELVES;
    this.unitsInDeck = unitsInDeck ?? newDeck;
    this.unitsInHand = unitsInHand ?? startingHand;
    this.cristalOneHealth = cristalOneHealth ?? 4500;
    this.cristalTwoHealth = cristalTwoHealth ?? 4500;
  }

  createElvesDeck(): IUnit[] {
    const deck = [];

    for (let index = 0; index < 3; index++) {
      const impaler = new Impaler({ unitId: 'impaler_' + index });
      const voidMonk = new VoidMonk({ unitId: 'voidMonk_' + index });
      const necromancer = new Necromancer({ unitId: 'necromancer_' + index });

      deck.push(impaler, voidMonk, necromancer);
    }

    // TODO: add items to the deck
    // TODO: create items

    const shuffledDeck = shuffleArray(deck);

    return shuffledDeck;
  }
}