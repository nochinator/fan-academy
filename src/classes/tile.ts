import { ETiles } from "../enums/gameEnums";
import { ICrystal, IHero, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeTileClickable } from "../utils/makeUnitClickable";

export class Tile extends Phaser.GameObjects.Container {
  baseRectangle: Phaser.GameObjects.Rectangle;
  row: number;
  col: number;
  x: number;
  y: number;
  boardPosition: number;

  occupied: boolean;
  obstacle: boolean;
  hero: IHero | undefined;
  crystal: ICrystal | undefined;
  tileSize: number = 90;
  tileType: ETiles;

  isHighlighted: boolean;

  constructor(context: GameScene,
    data: ITile) {
    super(context, data.x, data.y);

    this.row = data.row;
    this.col = data.col;
    this.x = data.x;
    this.y = data.y;
    this.tileType = data.tileType;
    this.occupied = data.occupied;
    this.obstacle = data.obstacle;
    this.hero = data.hero;
    this.crystal = data.crystal;
    this.boardPosition = data.boardPosition;

    // Add base tile shape
    this.baseRectangle = context.add.rectangle(0, 0, this.tileSize, this.tileSize);
    this.add(this.baseRectangle);
    this.isHighlighted = this.baseRectangle.isFilled;

    // If tileType is not BASIC, add the visual representation
    if (this.tileType !== ETiles.BASIC) {
      if (this.tileType === ETiles.CRYSTAL) {
        this.occupied = true;
      } else {
        const tileIcon = context.add.image(0, 0, this.tileType);
        if (this.col > 4) tileIcon.setFlipX(true);
        this.add(tileIcon);
      }
    }

    this.setSize(90, 90).setInteractive().setDepth(2);
    makeTileClickable(this, context);

    context.add.existing(this);
  }

  getTileData(): ITile {
    return {
      row: this.row,
      col: this.col,
      x: this.x,
      y: this.y,
      tileType: this.tileType,
      boardPosition: this.boardPosition,
      occupied: this.occupied,
      obstacle: this.obstacle,
      hero: this.hero,
      crystal: this.crystal
    };
  }

  isOccupied() {
    return this.occupied;
  }

  setOccupied(occupied: boolean) {
    this.occupied = occupied;
  }

  removeHero(): void {
    this.occupied = false;
    this.hero = undefined;
  }

  isFriendly(userId: string) {
    return this.hero && this.hero.unitId.includes(userId);
  }

  isEnemy(userId: string) {
    return this.hero && !this.hero.unitId.includes(userId);
  }

  setHighlight() {
    this.baseRectangle.setFillStyle(0x0080ff, 0.3);
    this.isHighlighted = this.baseRectangle.isFilled;
  }

  clearHighlight() {
    this.baseRectangle.setFillStyle();
    this.isHighlighted = this.baseRectangle.isFilled;
  }
}
