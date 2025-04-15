import { ETiles } from "../enums/gameEnums";
import { ITile } from "../interfaces/gameInterface";

export function createTileData(data: ITile): ITile {
  const tileType = ETiles.BASIC;
  const occupied = false;
  const obstacle = false;
  const hero = undefined;

  return {
    row: data.row,
    col: data.col,
    x: data.x,
    y: data.y,
    boardPosition: data.boardPosition,
    tileType: data.tileType ?? tileType,
    occupied: data.occupied ?? occupied,
    obstacle: data.obstacle ?? obstacle,
    hero: data.hero ?? hero
  };
}