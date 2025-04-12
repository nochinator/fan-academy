import { ETiles } from "../enums/gameEnums";

const map1 = [
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
];

const map2 = [
  {
    row: 1,
    col: 2,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 1,
    col: 6,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 3,
    col: 7,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 3,
    col: 1,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 0,
    col: 0,
    tileType: ETiles.SPAWN
  },
  {
    row: 0,
    col: 8,
    tileType: ETiles.SPAWN
  },
  {
    row: 4,
    col: 0,
    tileType: ETiles.SPAWN
  },
  {
    row: 4,
    col: 8,
    tileType: ETiles.SPAWN
  },
  {
    row: 2,
    col: 2,
    tileType: ETiles.POWER
  },
  {
    row: 2,
    col: 6,
    tileType: ETiles.POWER
  },
  {
    row: 0,
    col: 4,
    tileType: ETiles.MAGICAL_RESISTANCE
  },
  {
    row: 4,
    col: 4,
    tileType: ETiles.CRYSTAL_DAMAGE
  }
];

const map3 = [
  {
    row: 0,
    col: 3,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 2,
    col: 0,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 2,
    col: 8,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 4,
    col: 5,
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
    row: 2,
    col: 4,
    tileType: ETiles.POWER
  },
  {
    row: 0,
    col: 6,
    tileType: ETiles.TELEPORTER
  },
  {
    row: 4,
    col: 2,
    tileType: ETiles.TELEPORTER
  },
  {
    row: 3,
    col: 2,
    tileType: ETiles.CRYSTAL_DAMAGE
  },
  {
    row: 1,
    col: 6,
    tileType: ETiles.CRYSTAL_DAMAGE
  }
];

const map4 = [
  {
    row: 1,
    col: 2,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 3,
    col: 2,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 1,
    col: 6,
    tileType: ETiles.CRYSTAL
  },
  {
    row: 3,
    col: 6,
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
    row: 2,
    col: 1,
    tileType: ETiles.POWER
  },
  {
    row: 2,
    col: 7,
    tileType: ETiles.POWER
  },
  {
    row: 0,
    col: 5,
    tileType: ETiles.MAGICAL_RESISTANCE
  },
  {
    row: 4,
    col: 3,
    tileType: ETiles.MAGICAL_RESISTANCE
  },
  {
    row: 0,
    col: 3,
    tileType: ETiles.CRYSTAL_DAMAGE
  },
  {
    row: 4,
    col: 5,
    tileType: ETiles.CRYSTAL_DAMAGE
  }
];

export const mapTemplates: {
  row: number,
  col: number,
  tileType: ETiles
}[][] = [map1, map2, map3, map4];
