import { EHeroes, ERange, ETiles } from "../enums/gameEnums";
import { createCrystalData } from "../gameData/crystalData";
import { Coordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, createNewHero, getCoordinatesFromBoardPosition, getGridDistance, isEnemySpawn } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { ManaVial } from "./elves";
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
  units: Hero[] = [];
  crystals: Crystal[] = [];

  constructor(context: GameScene, data: ITile[]) {
    this.context = context;
    this.tiles = this.createTileGrid(data);
  }

  createTileGrid(tiles: ITile[]) {
    const grid: Tile[] = [];

    tiles.forEach(tile => {
      const newTile = new Tile(this.context, tile);
      if (newTile.hero) this.units.push(createNewHero(this.context, newTile.hero));
      if (newTile.crystal) {
        const crystalData = createCrystalData(newTile.crystal);
        this.crystals.push(new Crystal(this.context, crystalData ));
      }
      grid.push(newTile);
    });

    return grid;
  }

  getTileFromCoordinates(row: number, col: number): Tile {
    const result = this.tiles.find(tile => tile.row === row && tile.col === col);
    if (!result) throw new Error('Board getTile() No tile found');
    return result;
  }

  getTileFromBoardPosition(boardPosition: number): Tile {
    const result = this.tiles.find(tile => tile.boardPosition === boardPosition);
    if (!result) throw new Error('Board getTile() No tile found');
    return result;
  }

  getBoardState(): ITile[] {
    console.log('getBoardState()', this.tiles);
    return this.tiles.map(tile =>  tile.getTileData());
  }

  clearHighlights() {
    this.tiles.forEach(tile => tile.clearHighlight());
  }

  highlightSpawns(unitType: EHeroes) {
    const spawns: Tile[] = [];

    this.tiles.forEach(tile => {
      const enemySpawn = isEnemySpawn(this.context, tile);
      if (tile.tileType === ETiles.SPAWN && !enemySpawn) spawns.push(tile);
      if (tile.hero && tile.hero.isKO && unitType === EHeroes.WRAITH && !enemySpawn) spawns.push(tile);
    });

    this.highlightTiles(spawns);
  }

  highlightEnemyTargets(hero: Hero): void {
    const tilesInRange: Tile[] = this.getHeroTilesInRange(hero, ERange.ATTACK);
    if (!tilesInRange.length) return;

    const enemyLOSCheck: (Hero | Crystal)[] = [];

    tilesInRange.forEach(tile => {
      const target = tile.hero ? this.units.find(unit => unit.unitId === tile.hero!.unitId) : tile.crystal ? this.crystals.find(crystal => crystal.boardPosition === tile.crystal?.boardPosition) : undefined;
      const userId = this.context.userId;
      if (!target) {
        console.error('No target found', tile.hero);
        return;
      }

      /**
       * for each target, we gotta check the bp or coordinates in relation with the attacker. then if there is a friendly unit or crystal in between, LOS is blocked
       *
       *
       */

      /**
       * Show attack reticle if one of the below is true:
       *  -target is an enemy hero and it's not KO
       *  -target is an enemy crystal
       *  -target is KO and active unit is a Necro
       *  -target is KO and active unit is a Wraith that is not fully leveled (max 3 units consumed)
       */
      if (
        tile.isEnemy(userId) && target instanceof Hero && !target.isKO ||
        tile.crystal && !belongsToPlayer(this.context, tile.crystal) ||
        hero.unitType === EHeroes.NECROMANCER  && target instanceof Hero && target.isKO ||
        hero.unitType === EHeroes.WRAITH && hero.unitsConsumed < 3 && target instanceof Hero && target.isKO) {
        enemyLOSCheck.push(target);
      }
    });

    const enemiesToHighlight: (Hero | Crystal)[] = [];
    const enemiesBlocked: (Hero | Crystal)[] = [];

    enemyLOSCheck.forEach((enemy: Hero | Crystal) => {
      if (this.hasLineOfSight(hero, enemy)) {
        enemiesToHighlight.push(enemy);
      } else {
        enemiesBlocked.push(enemy);
      }
    });

    enemiesToHighlight.forEach(enemy => enemy.attackReticle.setVisible(true));
    enemiesBlocked.forEach(enemy => enemy.blockedLOS.setVisible(true));
  }

  highlightFriendlyTargets(hero: Hero) {
    if (!hero.canHeal) return;

    const tilesInRange: Tile[] = this.getHeroTilesInRange(hero, ERange.HEAL);
    if (!tilesInRange.length) return;

    tilesInRange.forEach(tile => {
      if (tile.crystal) return;
      const target = this.units.find(unit => unit.unitId === tile.hero?.unitId);
      if (!target) {
        console.error('No healing target found', tile);
        return;
      }
      const userId = this.context.userId;
      const maxHealth = target.maxHealth;
      const currentHealth = target.currentHealth;

      if (tile.isFriendly(userId) && currentHealth! < maxHealth!) target.healReticle.setVisible(true);
    });
  }

  highlightMovementArea(hero: Hero) {
    const tilesInRange = this.getHeroTilesInRange(hero, ERange.MOVE);

    this.highlightTiles(tilesInRange);
  }

  highlightTeleportOptions(hero: Hero) {
    if (hero.unitType === EHeroes.NINJA) {
      this.tiles.forEach(tile => {
        if (tile.isFriendly(this.context.userId)) {
          const target = this.units.find(unit => unit.unitId === tile.hero!.unitId);
          if (!target) {
            console.error('No teleport target found', tile);
            return;
          }
          target.allyReticle.setVisible(true);
        }
      });
    }

    if (hero.getTile().tileType === ETiles.TELEPORTER) {
      const teleportTiles: Tile[] = this.tiles.filter(tile => tile.tileType === ETiles.TELEPORTER);
      this.highlightTiles(teleportTiles);
    }
  }

  highlightEquipmentTargets(item: Item): void {
    const tilesToHighlight: Tile[] = [];

    this.units.forEach(hero => {
      if (hero.belongsTo !== item.belongsTo) return;
      if (hero.isAlreadyEquipped(item)) return;
      if (item.canHeal && hero.isFullHP()) return;
      if (item.canHeal && item instanceof ManaVial && hero.isKO) return;

      tilesToHighlight.push(hero.getTile());
    });

    this.highlightTiles(tilesToHighlight);
  }

  highlightAllBoard() {
    this.highlightTiles(this.tiles);
  }

  highlightTiles(tiles: Tile[]) {
    tiles.forEach(tile => {
      tile.setHighlight();
    });
  }

  removeReticles(): void {
    this.tiles.forEach(tile => {
      if (tile.hero || tile.crystal) {
        const target = tile.hero ? this.units.find(unit => unit.unitId === tile.hero!.unitId) : tile.crystal ? this.crystals.find(crystal => crystal.boardPosition === tile.crystal?.boardPosition) : undefined;

        if (!target) return;

        target.attackReticle.setVisible(false);
        target.blockedLOS.setVisible(false);

        if (target instanceof Hero) {
          target.healReticle.setVisible(false);
          target.allyReticle.setVisible(false);
        }
      }
    });
  }

  getHeroTilesInRange(hero: Hero, rangeType: ERange): Tile[] {
    const inRangeTiles: Tile[] = [];
    const heroTile = this.getTileFromBoardPosition(hero.boardPosition);
    let range: number;

    switch (rangeType) {
      case ERange.MOVE:
        range = hero.movement;
        break;

      case ERange.ATTACK:
        range = hero.attackRange;
        break;

      case ERange.HEAL:
        range = hero.healingRange;
        break;

      default:
        break;
    }

    if (!heroTile) {
      console.error('No tile found - getTilesInRange');
      return [];
    }

    this.tiles.forEach(tile => {
      const distance = getGridDistance(tile.row, tile.col, heroTile.row, heroTile.col);

      if (distance <= range) {
        if (rangeType === ERange.MOVE && !tile.isOccupied()) {
          if (!isEnemySpawn(this.context, tile)) inRangeTiles.push(tile);
        }
        if ((rangeType === ERange.ATTACK || rangeType === ERange.HEAL) && (tile.hero || tile.crystal)) inRangeTiles.push(tile);
      }
    });

    return inRangeTiles;
  }

  getAreaOfEffectTiles(tile: Tile): Tile[] {
    const totalRows = 4;
    const totalCols = 8;
    const areaTiles: Tile[] = [];

    // Loop through the 3x3 square centered on the target tile
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const currentRow = tile.row + rowOffset;
        const currentCol = tile.col + colOffset;

        // Check that the current tile is within the bounds of the map
        const isRowValid = currentRow >= 0 && currentRow <= totalRows;
        const isColValid = currentCol >= 0 && currentCol <= totalCols;

        if (isRowValid && isColValid) {
          const aoeTile = this.getTileFromCoordinates(currentRow, currentCol);
          areaTiles.push(aoeTile);
        } else {
          console.warn('Invalid tile coordinates skipped:', currentRow, currentCol);
        }
      }
    }

    return areaTiles;
  }

  // Used for Wizard and VoidMonk's attacks
  getAttackDirection(attackerBP: number, targetBP: number): number {
    const distance =  targetBP - attackerBP;

    let direction: number;

    switch (distance) {
      case -27:
      case -18:
      case -9:
        direction = 1;
        break;
      case -8:
        direction = 2;
        break;
      case 1:
      case 2:
      case 3:
        direction = 3;
        break;
      case 10:
        direction = 4;
        break;
      case 9:
      case 18:
      case 27:
        direction = 5;
        break;
      case 8:
        direction = 6;
        break;
      case -1:
      case -2:
      case -3:
        direction = 7;
        break;
      case -10:
        direction = 8;
        break;
      default:
        direction = 0;
        break;
    }

    if (direction === 0) console.error(`getAttackDirection() No direction found between: ${attackerBP} and ${targetBP}`);

    return direction;
  }

  hasLineOfSight(attacker: Hero, target: (Hero | Crystal)): boolean {
    if (this.isAdjacent(attacker, target)) return true;

    const attackerCoords = getCoordinatesFromBoardPosition(attacker.boardPosition);
    const targetCoords = getCoordinatesFromBoardPosition(target.boardPosition);

    if (attackerCoords.row === targetCoords.row || attackerCoords.col === targetCoords.col) {
      const atrtackDirection = this.getAttackDirection(attacker.boardPosition, target.boardPosition);

      const attackDirectionOffsetMap: Record<string, number[]> = {
        1: [-18, -9],
        3: [1, 2],
        5: [9, 18],
        7: [-1, -2]
      };

      const offsets = attackDirectionOffsetMap[atrtackDirection];

      for (const offset of offsets) {
        const positionToCheck = attacker.boardPosition + offset; // should never be out of bounds

        if (positionToCheck === target.boardPosition) return true; // don't block self
        const tile = this.getTileFromBoardPosition(positionToCheck);

        if (
          tile.crystal && !belongsToPlayer(this.context, tile.crystal) ||
          tile.hero && !belongsToPlayer(this.context, tile.hero)) {
          return false;
        }
      }
    }

    const coordKey = (row: number, col: number): string => `${row}, ${col}`;

    const tileOffsetMap: Record<string, [number, number][]> = {
      '1, 2': [[0, 1], [1, 1]],
      '1, -2': [[0, -1], [1, -1]], // corrected

      '-1, 2': [[1, 0], [1, 1]],
      '-1, -2': [[0, -1], [-1, -1]],

      '2, 1': [[1, 0], [1, 1]],
      '2, -1': [[1, 0], [1, -1]],

      '-2, 1': [[-1, 0], [-1, 1]],
      '-2, -1': [[-1, 0], [-1, -1]]
    };

    const getOffset = {
      row: targetCoords.row - attackerCoords.row,
      col: targetCoords.col - attackerCoords.col
    };

    const tileCoordKey = coordKey(getOffset.row, getOffset.col);
    const offsetsToCheck = tileOffsetMap[tileCoordKey];

    let result: boolean | undefined;

    console.log('offsetsToCheck', offsetsToCheck);
    if (offsetsToCheck && offsetsToCheck.length) {
      for (const offset of offsetsToCheck) {
        const tileRow = attackerCoords.row + offset[0];
        const tileCol = attackerCoords.col + offset[1];

        const isWrongRow = tileRow < 0 || tileRow > 4;
        const isWrongCol = tileCol < 0 || tileCol > 8;
        if (isWrongRow || isWrongCol) continue;

        const tile = this.getTileFromCoordinates(tileRow, tileCol);

        if (tile.boardPosition === target.boardPosition) return true; // don't block self

        if (
          tile.crystal && !belongsToPlayer(this.context, tile.crystal) ||
        tile.hero && !belongsToPlayer(this.context, tile.hero) && !tile.hero.isKO) {
          result = false;
          break;
        }
      };
    }

    return result !== false;
  }

  isAdjacent(hero: Hero, unitToCompare: Hero | Crystal): boolean {
    const heroCoordinates = getCoordinatesFromBoardPosition(hero.boardPosition);
    const unitCoordinates = getCoordinatesFromBoardPosition(unitToCompare.boardPosition);

    const row = Math.abs(heroCoordinates.row - unitCoordinates.row);
    const col = Math.abs(heroCoordinates.col - unitCoordinates.col);

    return col <= 1 && row <= 1 && !(row === 0 && col === 0);
  }
}
