import { ETiles } from "../enums/gameEnums";
import { ICoordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { getGridDistance, belongsToPlayer } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Unit } from "./unit";
import { Tile } from "./tile";

export class Board {
  topLeft: ICoordinates =  {
    x: 545,
    y: 225
  };

  tileSize: number = 90;
  context: GameScene;
  tiles: Tile[][];
  handTiles: Tile[];
  units: Unit[] = [];
  crystals: Unit[] = [];

  constructor(context: GameScene, data: ITile[][]) {
    this.context = context;
    this.tiles = this.createTileGrid(data);
    this.handTiles = this.createHandTile()
  }

  createTileGrid(tilesData: ITile[][]) {
    const grid: Tile[][] = [];
    for (let row = 0; row < 5; row++) {
      grid.push([]);
      for (let col = 0; col < 9; col++) {
        const tile = tilesData[row][col];
        const newTile = new Tile(this.context, tile);
        if (newTile.unit instanceof Crystal) {
          this.crystals.push(newTile.unit);
        } else if (newTile.unit) {
          this.units.push(newTile.unit);
        }
        grid[row].push(newTile);
      }
    }

    return grid;
  }

  createHandTile(): Tile[] {
    const handRow: Tile[] = [];
    for (let col = 0; col < 6; col++) {
      const { x, y } = this.context.centerPoints[JSON.stringify([-1, col])];

      const handTileData: ITile = {
        x: x,
        y: y,
        tileType: ETiles.BASIC,
        boardPosition: [-1, col],
        unit: undefined,
        item: undefined,
      };
      const newHandTile = new Tile(this.context, handTileData);

      handRow.push(newHandTile);
    }
    return handRow
  }

  getTileFromBoardPosition(boardPosition: [number, number]): Tile {
    const row = boardPosition[0];
    const col = boardPosition[1];

    if (row === -1) {
      return this.handTiles[col]
    }

    const rowTiles = this.tiles[row];
    if (!rowTiles || col < 0 || col >= rowTiles.length) {
      throw new Error(`Board getTileFromBoardPosition() Invalid board position: [${row}, ${col}]`);
    }
    return rowTiles[col];
  }

  getUnitFromTile(tile: Tile): Unit | undefined {
    const unit = this.units.find(unit => unit.boardPosition[0] === tile.boardPosition[0] && unit.boardPosition[1] === tile.boardPosition[1]);
    return unit;
  }

  getBoardState(): ITile[][] {
    return this.tiles.map(row => row.map(tile => tile.getTileData()));
  }

  clearHighlights() {
    this.tiles.forEach(row => row.forEach(tile => tile.clearHighlight()));
    this.handTiles.forEach(tile => tile.clearHighlight());
  }

  getUnitsInRange(activeUnit: Unit, range: number, targetEnemies = true, includeKoUnits = false): [Tile[], Tile[]] {
    const LOSBlocked: Tile[] = [];
    const targets: Tile[] = []

    const tilesInRange = this.getTilesInRange(activeUnit.boardPosition, range);

    tilesInRange.forEach(tile => {
      const target = tile.unit;
      if (!target) return;

      // only get enemies, or only get allys, or get both
      const isTargetable = targetEnemies ? target.belongsTo !== activeUnit.belongsTo : target.belongsTo === activeUnit.belongsTo;

      if (
        isTargetable
        && (!target.isKO || includeKoUnits)
        && target !== activeUnit  // can't target self
      ) {
        if (this.hasLineOfSight(activeUnit, target)) targets.push(tile);
        else LOSBlocked.push(tile);
      }
    });
    
    return [targets, LOSBlocked]
  }

  getTilesInRange(startPosition: [number, number], range: number): Tile[] {

    const inRangeTiles = new Set<Tile>();

    this.tiles.forEach(row => row.forEach(tile => {
      const distance = getGridDistance(
        tile.boardPosition[0],
        tile.boardPosition[1],
        startPosition[0],
        startPosition[1]
      );

      if (distance <= range) {
        inRangeTiles.add(tile)
      }
    }));

    
    const tilesInRange: Tile[] = [...inRangeTiles];
    if (!tilesInRange.length) return [];
    return tilesInRange
  }

  getAreaOfEffectTiles(tile: Tile): Tile[] {
    // TODO: replace usage with getTilesInRange with range of 1.5
    const totalRows = 4;
    const totalCols = 8;
    const areaTiles: Tile[] = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const currentRow = tile.boardPosition[0] + rowOffset;
        const currentCol = tile.boardPosition[1] + colOffset;

        const isRowValid = currentRow >= 0 && currentRow <= totalRows;
        const isColValid = currentCol >= 0 && currentCol <= totalCols;

        if (isRowValid && isColValid) {
          const aoeTile = this.getTileFromBoardPosition([currentRow, currentCol]);
          areaTiles.push(aoeTile);
        }
      }
    }

    return areaTiles;
  }

  getAttackDirection(attackerBP: [number, number], targetBP: [number, number]): number {
    const attackerRow = attackerBP[0];
    const attackerCol = attackerBP[1];
    const targetRow = targetBP[0];
    const targetCol = targetBP[1];

    const rowDiff = targetRow - attackerRow;
    const colDiff = targetCol - attackerCol;

    let direction: number;

    if (rowDiff < 0 && colDiff === 0) direction = 1;
    else if (rowDiff < 0 && colDiff > 0) direction = 2;
    else if (rowDiff === 0 && colDiff > 0) direction = 3;
    else if (rowDiff > 0 && colDiff > 0) direction = 4;
    else if (rowDiff > 0 && colDiff === 0) direction = 5;
    else if (rowDiff > 0 && colDiff < 0) direction = 6;
    else if (rowDiff === 0 && colDiff < 0) direction = 7;
    else if (rowDiff < 0 && colDiff < 0) direction = 8;
    else direction = 0;

    if (direction === 0) console.error(`getAttackDirection() No direction found between: ${attackerBP} and ${targetBP}`);

    return direction;
  }

  hasLineOfSight(attacker: Unit, target: Unit): boolean {
    if (this.isAdjacent(attacker, target)) return true;

    if (attacker.boardPosition[0] === target.boardPosition[0] || attacker.boardPosition[1] === target.boardPosition[1]) {
      const attackDirection = this.getAttackDirection(attacker.boardPosition, target.boardPosition);

      const attackDirectionOffsetMap: Record<string, [number, number][]> = {
        '1': [[-1, 0], [-2, 0]],
        '3': [[0, 1], [0, 2]],
        '5': [[1, 0], [2, 0]],
        '7': [[0, -1], [0, -2]]
      };

      const offsets = attackDirectionOffsetMap[attackDirection];

      if (!offsets) return true;

      for (const offset of offsets) {
        const positionToCheck: [number, number] = [attacker.boardPosition[0] + offset[0], attacker.boardPosition[1] + offset[1]];

        if (positionToCheck[0] === target.boardPosition[0] && positionToCheck[1] === target.boardPosition[1]) continue;

        // FIX: Now passing the array directly
        const tile = this.getTileFromBoardPosition(positionToCheck);

        if (
          tile.unit && !belongsToPlayer(this.context, tile.unit) && !tile.unit.isKO
        ) return false;
      }
    }

    const tileOffsetMap: Record<string, [number, number][]> = {
      '1, 2': [[0, 1], [1, 1]],
      '1, -2': [[0, -1], [1, -1]],

      '-1, 2': [[0, 1], [-1, 1]],
      '-1, -2': [[0, -1], [-1, -1]],

      '2, 1': [[1, 0], [1, 1]],
      '2, -1': [[1, 0], [1, -1]],

      '-2, 1': [[-1, 0], [-1, 1]],
      '-2, -1': [[-1, 0], [-1, -1]]
    };

    const getOffset = {
      row: target.boardPosition[0] - attacker.boardPosition[0],
      col: target.boardPosition[1] - attacker.boardPosition[1],
    };

    const tileCoordKey = `${getOffset.row}, ${getOffset.col}`;
    const offsetsToCheck = tileOffsetMap[tileCoordKey];

    let result: boolean | undefined;

    if (offsetsToCheck && offsetsToCheck.length) {
      for (const offset of offsetsToCheck) {
        const tileRow = attacker.boardPosition[0] + offset[0];
        const tileCol = attacker.boardPosition[1] + offset[1];

        const isWrongRow = tileRow < 0 || tileRow > 4;
        const isWrongCol = tileCol < 0 || tileCol > 8;
        if (isWrongRow || isWrongCol) continue;

        // FIX: Now passing the array directly
        const tile = this.getTileFromBoardPosition([tileRow, tileCol]);

        if (tile.boardPosition[0] === target.boardPosition[0] && tile.boardPosition[1] === target.boardPosition[1]) continue;

        if (
          tile.unit && !belongsToPlayer(this.context, tile.unit) && !tile.unit.isKO
        ) {
          result = false;
          break;
        }
      };
    }

    return result !== false;
  }

  isAdjacent(unit: Unit, unitToCompare: Unit): boolean {
    const row = Math.abs(unit.boardPosition[0] - unitToCompare.boardPosition[0]);
    const col = Math.abs(unit.boardPosition[1] - unitToCompare.boardPosition[1]);

    return col <= 1 && row <= 1 && !(row === 0 && col === 0);
  }

  isOrthogonalAdjacent(unit: Unit, unitToCompare: Unit): boolean {
    const row = Math.abs(unit.boardPosition[0] - unitToCompare.boardPosition[0]);
    const col = Math.abs(unit.boardPosition[1] - unitToCompare.boardPosition[1]);

    return (row === 1 && col === 0) || (row === 0 && col === 1);
  }
}