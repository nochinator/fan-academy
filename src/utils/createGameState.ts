import { EFaction, ETiles } from "../enums/gameEnums";
import { createCouncilFactionData, createElvesFactionData } from "../gameData/factionData";
import { createTileData } from "../gameData/tileData";
import { IFaction, ITile } from "../interfaces/gameInterface";
import { calculateAllCenterPoints } from "./boardCalculations";
import { mapTemplates } from "./maps";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(userId: string, playerFaction: EFaction): IFaction {
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: createCouncilFactionData(userId),
    [EFaction.DARK_ELVES]: createElvesFactionData(userId)
  };

  return faction[playerFaction];
}

/**
 * Creates a new map randomly choosing from a series of templates
 */
export function createNewGameBoardState(): ITile[] {
  const randomIndexNumber = Math.floor(Math.random() * mapTemplates.length);
  const mapData = mapTemplates[randomIndexNumber];
  const newBoard: ITile[] = [];
  const centerPoints = calculateAllCenterPoints();

  let boardPosition = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const { x, y } = centerPoints[boardPosition];
      const specialTile = mapData.find((tile) => tile.col === col && tile.row === row);
      const tile = createTileData({
        row,
        col,
        x,
        y,
        boardPosition,
        tileType: specialTile ? specialTile.tileType : ETiles.BASIC,
        occupied: false,
        obstacle: specialTile && specialTile.tileType === ETiles.CRYSTAL ? true : false
      });
      newBoard.push(tile);
      boardPosition++;
    }}

  return newBoard;
}