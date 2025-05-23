import { EHeroes, ERange, ETiles } from "../enums/gameEnums";
import { createCrystalData } from "../gameData/crystalData";
import { Coordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, createNewHero, getGridDistance, isHero } from "../utils/gameUtils";
import { Crystal } from "./crystal";
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

  highlightSpawns(isPlayerOne: boolean) {
    const spawns = this.tiles.filter(tile => tile.tileType === ETiles.SPAWN && !tile.isOccupied() && (isPlayerOne ? tile.col < 5 : tile.col > 5));
    this.highlightTiles(spawns);
  }

  highlightEnemyTargets(hero: Hero): void {
    const tilesInRange: Tile[] = this.getHeroTilesInRange(hero, ERange.ATTACK);
    if (!tilesInRange.length) return;

    tilesInRange.forEach(tile => {
      const target = tile.hero ? this.units.find(unit => unit.unitId === tile.hero!.unitId) : tile.crystal ? this.crystals.find(crystal => crystal.boardPosition === tile.crystal?.boardPosition) : undefined;
      const userId = this.context.userId;
      if (!target) {
        console.error('No target found', tile.hero);
        return;
      }

      // Highlight enemy units, enemy crystals and any KO'd unit if Necromancer
      if (tile.isEnemy(userId) || tile.crystal &&  !belongsToPlayer(this.context, tile.crystal) || hero.unitType === EHeroes.NECROMANCER && target instanceof Hero && target.isKO) {
        const reticle: Phaser.GameObjects.Image = target.getByName('attackReticle');
        reticle.setVisible(true);
      }
    });
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
        const attackReticle = target.getByName('attackReticle') as Phaser.GameObjects.Image;
        const healReticle = target.getByName('healReticle') as Phaser.GameObjects.Image;
        const allyReticle = target.getByName('allyReticle') as Phaser.GameObjects.Image;

        attackReticle?.setVisible(false);
        healReticle?.setVisible(false);
        allyReticle?.setVisible(false);
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
        if (rangeType === ERange.MOVE && !tile.isOccupied()) inRangeTiles.push(tile);

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
}
