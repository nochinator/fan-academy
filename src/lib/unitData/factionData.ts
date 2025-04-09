import { EFaction, EItems } from "../../enums/gameEnums";
import { IFaction, IHero, IItem } from "../../interfaces/gameInterface";
import { shuffleArray } from "../../utils/deckUtils";
import { createCouncilArcherData, createCouncilKnightData, createCouncilWizardData } from "./councilHeroData";
import { createElvesImpalerData, createElvesVoidMonkData, createElvesNecromancerData } from "./elvesHeroData";
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
    const shiningHelm = createItemData( {
      unitId: `${userId}_shinningHelm_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SHINING_HELM
    });
    const healingPotion = createItemData( {
      unitId: `${userId}_healingPotion_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.HEALING_POTION
    });
    const inferno = createItemData( {
      unitId: `${userId}_inferno_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.INFERNO
    });
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

      Superccontext: GameScene,harge (x2)
  Triples the attack power of the next attack for the chosen unit
  */

    deck.push(archer, knight, wizard, shiningHelm, healingPotion, inferno);
  }

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

  Superccontext,harge (x2)
  Triples the attack power of the next attack for the chosen unit
  */

  const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}
