import { Coordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { Hero } from "./hero";
import { Tile } from "./tile";

export class Board {
  topLeft: Coordinates =  {
    x: 545,
    y: 225
  };

  tileSize: number = 90;
  scene: GameScene;
  tiles: Tile[];

  constructor(scene: GameScene, data: ITile[]) {
    this.scene = scene;
    this.tiles = this.createTileGrid(data);
  }

  createTileGrid(tiles: ITile[]) {
    const grid: Tile[] = [];

    tiles.forEach(tile => {
      const newTile = new Tile(this.scene, tile);
      if (newTile.hero) new Hero(this.scene, newTile.hero);

      grid.push(newTile);
    });

    return grid;
  }

  getTile(row: number, col: number) {
    return this.tiles.find(tile => tile.row === row && tile.col === col);
  }

  clearHighlights(gridCoordinates: Coordinates[]) {
    gridCoordinates.forEach(coord => {
      const result = this.tiles.find(tile => tile.row === coord.row && tile.col === coord.col);
      if (result)  result.clearHighlight();
    });
  }

  getReachableTiles(startRow: number, startCol: number, movement: number) {
    // const visited = new Set();
    // const reachable = [];
    // const queue = [{
    //   row: startRow,
    //   col: startCol,
    //   remaining: movement
    // }];
    // visited.add(`${startRow},${startCol}`);

    // while (queue.length > 0) {
    //   const { row, col, remaining } = queue.shift();
    //   const tile = this.getTile(row, col);
    //   if (tile) reachable.push(tile);

    //   for (const { dr, dc, cost } of directions) {
    //     const newRow = row + dr;
    //     const newCol = col + dc;
    //     const key = `${newRow},${newCol}`;

    //     const neighbor = this.getTile(newRow, newCol);
    //     if (!neighbor || visited.has(key)) continue;
    //     if (neighbor.obstacle || neighbor.isOccupied() && neighbor.isFriendly(owner)) continue;
    //     if (remaining < cost) continue;

    //     visited.add(key);
    //     queue.push({
    //       row: newRow,
    //       col: newCol,
    //       remaining: remaining - cost
    //     });
    //   }
    // }

    // return reachable;
  }

  highlightTiles(tiles: Tile[]) {
    tiles.forEach(tile => tile.setHighlight());
  }
}
