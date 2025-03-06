import { CouncilFaction } from "../classes/council";
import { ElvesFaction } from "../classes/elves";
import { EFaction } from "../enums/gameEnums";
import { IFaction, IPlayer, IUserData } from "../interfaces/gameInterface";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(playerFaction: string): IFaction {
  console.log('CREATEFUNC_PLAYERFACTION', playerFaction);
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: new CouncilFaction(),
    [EFaction.DARK_ELVES]: new ElvesFaction()
  };

  return faction[playerFaction];
}