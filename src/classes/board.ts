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

  getTileFromBoardPosition(boardPosition: number) {
    return this.tiles.find(tile => tile.boardPosition === boardPosition);
  }

  getBoardState(): ITile[] {
    return this.tiles.map(tile =>  tile.getTileData());
  }

  clearHighlights() {
    this.tiles.forEach(tile => tile.clearHighlight());
  }

  highlightSpawns(isPlayerOne: boolean) {
    const spawns = this.tiles.filter(tile => tile.tileType === ETiles.SPAWN && !tile.isOccupied() && (isPlayerOne ? tile.col < 5 : tile.col > 5));
    this.highlightTiles(spawns);
  }

  highlightEnemyTargets(hero: Hero): void {
    // We can use the same function as for the movement but inputting the range
  }

  highlightFriendlyTargets(unit: Hero | Item) {}

  highlightMovementArea(hero: Hero) {
    const inRangeTiles: Tile[] = [];
    const heroTile = this.getTileFromBoardPosition(hero.boardPosition);

    if (!heroTile) {
      console.log('No tile found - highlightMovementArea');
      return;
    }

    this.tiles.forEach(tile => {
      const distance = Math.abs(tile.row - heroTile.row) + Math.abs(tile.col - heroTile.col);

      if (distance <= hero.movement && !tile.isOccupied()) {
        inRangeTiles.push(tile);
      }
    });

    this.highlightTiles(inRangeTiles);
  }

  highlightTiles(tiles: Tile[]) {
    tiles.forEach(tile => {
      tile.setHighlight();
    });
  }
}
