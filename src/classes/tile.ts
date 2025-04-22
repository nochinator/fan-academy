import { ETiles } from "../enums/gameEnums";
import { IHero, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeTileClickable } from "../utils/setActiveUnit";

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
    this.boardPosition = data.boardPosition;

    // Add base tile shape
    this.baseRectangle = context.add.rectangle(0, 0, this.tileSize, this.tileSize);
    this.add(this.baseRectangle);
    this.isHighlighted = this.baseRectangle.isFilled;

    // If tileType is not BASIC, add the visual representation
    // TODO: clean the below snippet. Add tint based on player preferred color
    if (this.tileType !== ETiles.BASIC) {
      let tileIcon;
      if (this.tileType === ETiles.CRYSTAL) {
        const pedestal = context.add.image(0, 0, 'pedestal').setScale(0.8);
        this.add(pedestal);
        const damagedCrystal =  context.add.image(0, 0, 'damagedCrystal').setVisible(false);
        this.add(damagedCrystal);
        tileIcon = context.add.image(0, -30, this.tileType).setScale(0.8);
        const crystalColor = this.col > 4 ? 0x990000 : 0x3399ff;
        tileIcon.setTint(crystalColor);
        this.occupied = true;
      } else {
        tileIcon = context.add.image(0, 0, this.tileType);
      }
      if (this.col > 4) tileIcon.setFlipX(true);
      // icon.setDisplaySize(60, 60); // or whatever fits nicely
      this.add(tileIcon);
    }

    this.setSize(90, 90).setInteractive();
    makeTileClickable(this, context);

    context.add.existing(this);
    context.currentGameContainer?.add(this);
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
      hero: this.hero
    };
  }

  isOccupied() {
    return this.occupied;
  }

  setOccupied(occupied: boolean) {
    this.occupied = occupied;
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
    console.log(this.baseRectangle.fillAlpha);
  }

  clearHighlight() {
    this.baseRectangle.setFillStyle();
    this.isHighlighted = this.baseRectangle.isFilled;
  }
}
