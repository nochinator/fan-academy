import { EFaction, EItems } from "../enums/gameEnums";
import { IFaction, IHero, IItem } from "../interfaces/gameInterface";
import { shuffleArray } from "../utils/deckUtils";
import { createCouncilArcherData, createCouncilClericData, createCouncilKnightData, createCouncilNinjaData, createCouncilWizardData } from "./councilHeroData";
import { createElvesImpalerData, createElvesVoidMonkData, createElvesNecromancerData, createElvesWraithData, createElvesPriestessData } from "./elvesHeroData";
import { createItemData } from "./itemData";

export function createCouncilFactionData(userId: string): IFaction {
  const unitsInDeck = createCouncilDeck(userId);
  const unitsInHand =  unitsInDeck.splice(0, 6);
  const factionName = EFaction.COUNCIL;
  const cristalOneHealth =  4500;
  const cristalTwoHealth =  4500;

  return {
    factionName,
    unitsInDeck,
    unitsInHand,
    cristalOneHealth,
    cristalTwoHealth
  };
}

function createCouncilDeck(userId: string): (IHero | IItem)[] {
  const deck = [];

  for (let index = 0; index < 3; index++) {
    const archer = createCouncilArcherData( { unitId: `${userId}_archer_${index}` });
    const knight = createCouncilKnightData( { unitId: `${userId}_knight_${index}` });
    const wizard = createCouncilWizardData( { unitId: `${userId}_wizard_${index}` });
    const cleric = createCouncilClericData( { unitId: `${userId}_cleric_${index}` });

    const shiningHelm = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData( {
      unitId: `${userId}_dragonScale_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.DRAGON_SCALE
    });

    deck.push(archer, knight, wizard, cleric, shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    // Heals 1000 hp. Can revive at 1/2 power
    const healingPotion = createItemData( {
      unitId: `${userId}_healingPotion_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.HEALING_POTION
    });
    const inferno = createItemData( {
      //  High-damage attack spell that does 350 magical damage in a 3x3 area.
      // Can remove knocked-out enemies from the field.
      unitId: `${userId}_inferno_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.INFERNO
    });
    const superCharge = createItemData( {
      // Triples the attack power of the next attack for the chosen unit
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SUPERCHARGE
    });

    deck.push(healingPotion, inferno, superCharge);
  }

  // Unique unit
  const ninja = createCouncilNinjaData( { unitId: `${userId}_ninja` });
  deck.push(ninja);

  const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}

export function createElvesFactionData(userId: string): IFaction {
  const unitsInDeck = createElvesDeck(userId);
  const unitsInHand =  unitsInDeck.splice(0, 6);
  const factionName = EFaction.DARK_ELVES;
  const cristalOneHealth =  4500;
  const cristalTwoHealth =  4500;

  return {
    factionName,
    unitsInDeck,
    unitsInHand,
    cristalOneHealth,
    cristalTwoHealth
  };
}

function createElvesDeck(userId: string): (IHero | IItem)[] {
  const deck = [];

  for (let index = 0; index < 3; index++) {
    const impaler = createElvesImpalerData( { unitId: `${userId}_impaler_${index}` });
    const voidMonk = createElvesVoidMonkData( { unitId: `${userId}_voidMonk_${index}` });
    const necromancer = createElvesNecromancerData( { unitId: `${userId}_necromancer_${index}` });
    const priestess = createElvesPriestessData( { unitId: `${userId}_priestess_${index}` });

    const shiningHelm = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData( {
      unitId: `${userId}_soulStone_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_STONE
    });

    deck.push(impaler, voidMonk, necromancer, priestess, shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    const manaVial = createItemData( {
      // Heals for 1000 hp and increases max HP by 50
      //  Does not revive
      unitId: `${userId}_manaVial_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.MANA_VIAL
    });

    const soulHarvest = createItemData( {
      // Does damage to enemies while raising your fallen heroes and adding to their maximum health.
      // Health gained by each unit is equal to the total life lost by enemy units divided by the number of friendly units plus 3 rounded to the nearest 5.
      // The equation for this is H = 1/(3+U) x D, where H is Health gained by each allied unit, D is Damage dealt, U = Amount of allied units on the field, and R = Any real number. H is rounded to the nearest 5 at the end.
      //   For example, if there were 3 allied units, and the harvest dealt 400 damage, then H = 1/(3+3) x 400, which is 1/6 x 400, which is 66.66...., which rounds to 65.
      //   As a second example, if there were 7 allied units, and the harvest dealt 780 damage, then H = 1/(3+7) x 780, which is 1/10 x 780, which is 78, which rounds to 80
      unitId: `${userId}_souldHarvest_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_HARVEST
    });

    const superCharge = createItemData( {
      // Triples the attack power of the next attack for the chosen unit
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SUPERCHARGE
    });

    deck.push(manaVial, soulHarvest, superCharge);
  }

  // Unique unit
  const wraith = createElvesWraithData( { unitId: `${userId}_wraith}` });
  deck.push(wraith);

  const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}
