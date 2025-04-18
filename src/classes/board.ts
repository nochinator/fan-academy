import { ETiles } from "../enums/gameEnums";
import { Coordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export class Board {
  topLeft: Coordinates =  {
    x: 545,
    y: 225
  };

  tileSize: number = 90;
  context: GameScene;
  tiles: Tile[];

  constructor(context: GameScene, data: ITile[]) {
    this.context = context;
    this.tiles = this.createTileGrid(data);
  }

  createTileGrid(tiles: ITile[]) {
    const grid: Tile[] = [];

    tiles.forEach(tile => {
      const newTile = new Tile(this.context, tile);
      if (newTile.hero) new Hero(this.context, newTile.hero);

      grid.push(newTile);
    });

    return grid;
  }

  getTile(row: number, col: number) {
    return this.tiles.find(tile => tile.row === row && tile.col === col);
  }

  getBoardState(): ITile[] {
    const boardState = this.tiles.map(tile =>  tile.getTileData());
    return boardState;
  }

  clearHighlights() {
    // gridCoordinates.forEach(coord => {
    //   const result = this.tiles.find(tile => tile.row === coord.row && tile.col === coord.col);
    //   if (result)  result.clearHighlight();
    // });
    this.tiles.forEach(tile => tile.clearHighlight());
  }

  highlightSpawns(isPlayerOne: boolean) {
    const spawns = this.tiles.filter(tile => tile.tileType === ETiles.SPAWN && (isPlayerOne ? tile.col < 5 : tile.col > 5));
    this.highlightTiles(spawns);
  }

  highlightEnemyTargets(hero: Hero) {}

  highlightFriendlyTargets(unit: Hero | Item) {}

  highlightMovementArea(hero: Hero) {
    // Find starting tile
    const startTile = this.tiles.find(tile => {
      if (tile.hero?.unitId === hero.unitId) return {
        row: tile.row,
        col: tile.col
      };});
  }

  highlightTiles(tiles: Tile[]) {
    tiles.forEach(tile => {
      tile.setHighlight();
    });
  }
}
