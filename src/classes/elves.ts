import { Hero } from "./hero";
import { IFaction, IHero, IItem, IPartialHeroInit } from "../interfaces/gameInterface";
import { EAttackType, EFaction, EHeroes } from "../enums/gameEnums";
import { shuffleArray } from "../utils/deckUtils";

export class Impaler extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.DARK_ELVES,
        unitType: EHeroes.IMPALER,
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

// FIXME: correct data after testing
export class VoidMonk extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.DARK_ELVES,
        unitType: EHeroes.VOIDMONK,
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class Necromancer extends Hero {
  constructor(data: IPartialHeroInit) {
    const maxHealth  = 800;

    super(
      {
        faction: EFaction.DARK_ELVES,
        unitType: EHeroes.NECROMANCER,
        unitId: data.unitId,
        boardPosition: data.boardPosition ?? 51, // positions go from 0-51, 51 being the deck and 45-50 the hand
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
        factionBuff: data.factionBuff ?? false,
        runeMetal: data.runeMetal ?? false,
        shiningHelm: data.shiningHelm ?? false
      }
    );
  }
}

export class ElvesFaction implements IFaction {
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
    const newDeck = unitsInDeck ?? this.createElvesDeck(); // REVIEW:
    const startingHand = unitsInHand ?? newDeck.splice(0, 6) ;

    this.userId = userId;
    this.factionName = EFaction.DARK_ELVES;
    this.unitsInDeck = unitsInDeck ?? newDeck;
    this.unitsInHand = unitsInHand ?? startingHand;
    this.cristalOneHealth = cristalOneHealth ?? 4500;
    this.cristalTwoHealth = cristalTwoHealth ?? 4500;
  }

  createElvesDeck(): (IHero | IItem)[] {
    const deck = [];

    for (let index = 0; index < 3; index++) {
      const impaler = new Impaler({ unitId: `${this.userId}_impaler_${index}` });
      const voidMonk = new VoidMonk({ unitId: `${this.userId}_voidMonk_${index}` });
      const necromancer = new Necromancer({ unitId: `${this.userId}_necromancer_${index}` });

      deck.push(impaler, voidMonk, necromancer);
    }

    /**
    To add:

    COUNCIL:
    Soul Harvest (x2)
    Does damage to enemies while raising your fallen heroes and adding to their maximum health.
    Health gained by each unit is equal to the total life lost by enemy units divided by the number of friendly units plus 3 rounded to the nearest 5.
    The equation for this is H = 1/(3+U) x D, where H is Health gained by each allied unit, D is Damage dealt, U = Amount of allied units on the field, and R = Any real number. H is rounded to the nearest 5 at the end.
      For example, if there were 3 allied units, and the harvest dealt 400 damage, then H = 1/(3+3) x 400, which is 1/6 x 400, which is 66.66...., which rounds to 65.
      As a second example, if there were 7 allied units, and the harvest dealt 780 damage, then H = 1/(3+7) x 780, which is 1/10 x 780, which is 78, which rounds to 80

    Mana Vial (x2)
    Heals an ally for 1000 hitpoints and increases max health by 50 points.

    Soulstone (x3)
    Doubles the units life leech bonus (from 33% to 67%) and increases max health by 10%

    GENERIC:
    Runemetal (x3)
    Increases base power by 50% and max health by 10%

    Shining Helm (x3)
    Increases magical resistance by 20% and max health by 10%

    Supercharge (x2)
    Triples the attack power of the next attack for the chosen unit
    */

    const shuffledDeck = shuffleArray(deck);

    return shuffledDeck;
  }
}