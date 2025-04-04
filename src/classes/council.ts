import { Hero } from "./hero";
import { IFaction, IHero, IItem, IPartialHeroInit } from "../interfaces/gameInterface";
import { EAttackType, EFaction, EHeroes, EItems } from "../enums/gameEnums";
import { shuffleArray } from "../utils/deckUtils";
import { Item } from "./item";

export class Archer extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.COUNCIL,
        unitType: EHeroes.ARCHER,
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

// FIXME: correct data after testing
export class Knight extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.COUNCIL,
        unitType: EHeroes.KNIGHT,
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class Wizard extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.COUNCIL,
        unitType: EHeroes.WIZARD,
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class Ninja extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.COUNCIL,
        unitType: EHeroes.WIZARD,
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class ShiningHelm extends Item {
  constructor(itemId: string, boardPosition: number = 51) {
    super(itemId, EItems.SHINING_HELM, boardPosition);
  }
}

export class HealingPotion extends Item {
  constructor(itemId: string, boardPosition: number = 51) {
    super(itemId, EItems.HEALING_POTION, boardPosition);
  }
}

export class Inferno extends Item {
  constructor(itemId: string, boardPosition: number = 51) {
    super(itemId, EItems.INFERNO, boardPosition);
  }
}

export class CouncilFaction implements IFaction {
  userId: string;
  factionName: string;
  unitsInHand: (IHero | IItem)[];
  unitsInDeck: (IHero | IItem)[];
  cristalOneHealth: number;
  cristalTwoHealth: number;

  constructor(
    userId: string,
    unitsInDeck?: (IHero | IItem)[],
    unitsInHand?: (IHero | IItem)[],
    cristalOneHealth?: number,
    cristalTwoHealth?: number
  ) {
    const newDeck = unitsInDeck ?? this.createCouncilDeck(); // REVIEW:
    const startingHand = unitsInHand ?? newDeck.splice(0, 6);

    this.userId = userId;
    this.factionName = EFaction.COUNCIL;
    this.unitsInDeck = unitsInDeck ?? newDeck;
    this.unitsInHand = unitsInHand ?? startingHand;
    this.cristalOneHealth = cristalOneHealth ?? 4500;
    this.cristalTwoHealth = cristalTwoHealth ?? 4500;
  }

  createCouncilDeck(): (IHero | IItem)[] {
    const deck = [];

    for (let index = 0; index < 3; index++) {
      const archer = new Archer({ unitId: `${this.userId}_archer_${index}` });
      const knight = new Knight({ unitId: `${this.userId}_knight_${index}` });
      const wizard = new Wizard({ unitId: `${this.userId}_wizard_${index}` });
      const shiningHelm = new ShiningHelm(`${this.userId}_shinningHelm_${index}`);
      const healingPotion = new HealingPotion(`${this.userId}_healingPotion_${index}`);
      const inferno = new Inferno(`${this.userId}_inferno_${index}`);
      /**
    To add:

    COUNCIL:
    Inferno (x2)
    High-damage attack spell that does 350 magical damage in a 3x3 area.
    Can remove knocked-out enemies from the field.
    Use against clustered groups of weakened enemies, or to eliminate knocked-out targets at range.

    Revive potion (x2)
    Heals an ally for 1000 hitpoints.
    Can also be used to revive a fallen ally with all equipment intact.

    factionBuff (x3)
    Increases physical resistance by 20% and max health by 10%

    GENERIC:
    Runemetal (x3)
    Increases base power by 50% and max health by 10%

    Shining Helm (x3)
    Increases magical resistance by 20% and max health by 10%

        Supercharge (x2)
    Triples the attack power of the next attack for the chosen unit
    */

      deck.push(archer, knight, wizard, shiningHelm, healingPotion, inferno);
    }

    const shuffledDeck = shuffleArray(deck);

    return shuffledDeck;
  }
}