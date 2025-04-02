import { CouncilFaction } from "../classes/council";
import { ElvesFaction } from "../classes/elves";
import { EFaction } from "../enums/gameEnums";
import { IFaction } from "../interfaces/gameInterface";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(playerFaction: string, userId: string): IFaction {
  console.log('CREATEFUNC_PLAYERFACTION', playerFaction);
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: new CouncilFaction(userId),
    [EFaction.DARK_ELVES]: new ElvesFaction(userId)
  };

  return faction[playerFaction];
}