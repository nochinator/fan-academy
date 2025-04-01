import { Unit } from "./unit";
import { IFaction, IUnit } from "../interfaces/gameInterface";
import { EAttackType, EFaction } from "../enums/gameEnums";
import { shuffleArray } from "../utils/shuffleArray";

export class Archer extends Unit {
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
        unitType: 'archer',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.PHYSICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 150,
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
export class Knight extends Unit {
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
        unitType: 'knight',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.PHYSICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 150,
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

export class Wizard extends Unit {
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
        unitType: 'wizard',
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
        maxHealth,
        currentHealth: data.currentHealth ?? maxHealth,
        isKO: data.isKO ?? false,
        movement: 2,
        range: 3,
        attackType: EAttackType.MAGICAL,
        rangeAttackDamage: 300,
        meleeAttackDamage: 150,
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

export class CouncilFaction implements IFaction {
  factionName: string;
  unitsInHand: IUnit[];
  unitsInDeck: IUnit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;

  constructor(
    unitsInDeck?: IUnit[],
    unitsInHand?: IUnit[],
    cristalOneHealth?: number,
    cristalTwoHealth?: number

  ) {
    const newDeck = unitsInDeck ?? this.createCouncilDeck(); // REVIEW:
    const startingHand = unitsInHand ?? newDeck.splice(0, 6);

    this.factionName = EFaction.COUNCIL;
    this.unitsInDeck = unitsInDeck ?? newDeck;
    this.unitsInHand = unitsInHand ?? startingHand;
    this.cristalOneHealth = cristalOneHealth ?? 4500;
    this.cristalTwoHealth = cristalTwoHealth ?? 4500;
  }

  createCouncilDeck(): IUnit[] {
    const deck = [];

    for (let index = 0; index < 3; index++) {
      const archer = new Archer({ unitId: 'archer_' + index });
      const knight = new Knight({ unitId: 'knight_' + index });
      const wizard = new Wizard({ unitId: 'wizard_' + index });

      // TODO: add rest of items / units (don't forget buffs)

      deck.push(archer, knight, wizard);
    }

    const shuffledDeck = shuffleArray(deck);

    return shuffledDeck;
  }
}