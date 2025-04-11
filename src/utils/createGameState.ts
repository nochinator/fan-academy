import { EFaction, ETiles } from "../enums/gameEnums";
import { IFaction, ITile } from "../interfaces/gameInterface";
import { createCouncilFactionData, createElvesFactionData } from "../gameData/factionData";
import { mapTemplates } from "./maps";
import GameScene from "../scenes/game.scene";
import { createTileData } from "../gameData/tileData";

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

/**
 * Creates a new map randomly choosing from a series of templates
 */
export function createNewGameBoardState(context: GameScene): ITile[] {
  const randomIndexNumber = Math.floor(Math.random() * mapTemplates.length);
  const mapData = mapTemplates[randomIndexNumber];
  const newBoard: ITile[] = [];

  let pointIndex = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const { x, y } = context.centerPoints[pointIndex++];
      const specialTile = mapData.find((tile) => tile.col === col && tile.row === row);
      const tile = createTileData({
        row,
        col,
        x,
        y,
        tileType: specialTile ? specialTile.tileType : ETiles.BASIC,
        occupied: false,
        obstacle: specialTile && specialTile.tileType === ETiles.CRYSTAL ? true : false
      });
      newBoard.push(tile);
    }}

  return newBoard;
}