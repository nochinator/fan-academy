import { EFaction } from "../enums/gameEnums";
import { IFaction } from "../interfaces/gameInterface";
import { createCouncilFactionData, createElvesFactionData } from "../lib/unitData/factionData";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(userId: string, playerFaction: EFaction): IFaction {
  console.log('CREATEFUNC_PLAYERFACTION', playerFaction);
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: createCouncilFactionData(userId),
    [EFaction.DARK_ELVES]: createElvesFactionData(userId)
  };

  return faction[playerFaction];
}