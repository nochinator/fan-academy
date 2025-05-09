import { ERange, ETiles } from "../enums/gameEnums";
import { Coordinates, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { createNewHero, getGridDistance } from "../utils/gameUtils";
import { Hero } from "./hero";
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
      if (newTile.hero) createNewHero(this.context, newTile.hero);
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

  highlightHeroEnemyTargets(hero: Hero): void {
    const tilesInRange: Tile[] = this.getHeroTilesInRange(hero, ERange.ATTACK);
    if (!tilesInRange.length) return;

    tilesInRange.forEach(tile => {
      const target = this.context.children.getByName(tile.hero!.unitId) as Phaser.GameObjects.Container;
      const userId = this.context.userId;
      if (!target) {
        console.error('No target found', tile.hero);
        return;
      }

      if (tile.isEnemy(userId)) {
        const reticle: Phaser.GameObjects.Image = target.getByName('attackReticle');
        reticle.setVisible(true);
      }
    });
  }

  highlighHerotFriendlyTargets(hero: Hero) {
    if (!hero.canHeal) return;

    const tilesInRange: Tile[] = this.getHeroTilesInRange(hero, ERange.HEAL);
    if (!tilesInRange.length) return;

    tilesInRange.forEach(tile => {
      const target = this.context.children.getByName(tile.hero!.unitId) as Phaser.GameObjects.Container;
      const userId = this.context.userId;
      const maxHealth = tile.hero?.maxHealth;
      const currentHealth = tile.hero?.currentHealth;
      if (!target) {
        console.error('No healing target found', tile.hero);
        return;
      }

      if (tile.isFriendly(userId) && maxHealth !== currentHealth) {
        const reticle: Phaser.GameObjects.Image  = target.getByName('healReticle');
        reticle.setVisible(true);
      }
    });
  }

  highlightMovementArea(hero: Hero) {
    const tilesInRange = this.getHeroTilesInRange(hero, ERange.MOVE);

    this.highlightTiles(tilesInRange);
  }

  highlightTiles(tiles: Tile[]) {
    tiles.forEach(tile => {
      tile.setHighlight();
    });
  }

  removeReticles(): void {
    this.tiles.forEach(tile => {
      if (tile.hero) {
        const target = this.context.children.getByName(tile.hero.unitId) as Phaser.GameObjects.Container;
        if (!target) return;
        const attackReticle = target.getByName('attackReticle') as Phaser.GameObjects.Image;
        const healReticle = target.getByName('healReticle') as Phaser.GameObjects.Image;

        attackReticle?.setVisible(false);
        healReticle?.setVisible(false);
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
      // const distance = Math.abs(tile.row - heroTile.row) + Math.abs(tile.col - heroTile.col);
      const distance = getGridDistance(tile.row, tile.col, heroTile.row, heroTile.col);

      if (distance <= range) {
        if (rangeType === ERange.MOVE && !tile.isOccupied()) inRangeTiles.push(tile);

        if ((rangeType === ERange.ATTACK || rangeType === ERange.HEAL) && tile.hero) inRangeTiles.push(tile);
      }
    });

    return inRangeTiles;
  }
}
