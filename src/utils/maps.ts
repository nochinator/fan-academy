import { ETiles } from "../enums/gameEnums";

export const mapTemplates: {
  row: number,
  col: number,
  tileType: ETiles
}[][] = [[
  {
    row: 0,
    col: 2,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 0,
    col: 6,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 4,
    col: 6,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 4,
    col: 2,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 1,
    col: 0,
    tileType: ETiles.SPAWN
  },
  {
    row: 3,
    col: 8,
    tileType: ETiles.SPAWN
  },
  {
    row: 3,
    col: 0,
    tileType: ETiles.SPAWN
  },
  {
    row: 1,
    col: 8,
    tileType: ETiles.SPAWN
  },
  {
    row: 1,
    col: 2,
    tileType: ETiles.POWER
  },
  {
    row: 3,
    col: 6,
    tileType: ETiles.POWER
  },
  {
    row: 2,
    col: 1,
    tileType: ETiles.PHYSICAL_RESISTANCE
  },
  {
    row: 2,
    col: 7,
    tileType: ETiles.PHYSICAL_RESISTANCE
  },
  {
    row: 2,
    col: 4,
    tileType: ETiles.CRYSTAL_DAMAGE
  }
]];