import { ETiles } from "../enums/gameEnums";
import { IHero, ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

export class Tile extends Phaser.GameObjects.Container {
  baseRectangle: Phaser.GameObjects.Rectangle;
  row: number;
  col: number;
  x: number;
  y: number;
  tileType: ETiles;
  occupied: boolean = false;
  obstacle: boolean = false;
  hero: IHero | undefined = undefined;
  tileSize: number = 90;

  constructor(context: GameScene,
    data: ITile) {
    super(context, data.x, data.y);

    this.row = data.row;
    this.col = data.col;
    this.x = data.x;
    this.y = data.y;
    this.tileType = data.tileType;
    this.hero = data.hero;

    // Add base tile shape
    this.baseRectangle = context.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x0080ff, 0);
    this.add(this.baseRectangle);

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
      } else {
        tileIcon = context.add.image(0, 0, this.tileType);
      }
      if (this.col > 4) tileIcon.setFlipX(true);
      // icon.setDisplaySize(60, 60); // or whatever fits nicely
      this.add(tileIcon);
    }

    context.add.existing(this);
    context.currentGameContainer?.add(this);
  }

  isOccupied() {
    return this.occupied !== null;
  }

  isFriendly(userId: string) {
    return this.hero && this.hero.unitId.includes(userId);
  }

  isEnemy(userId: string) {
    return this.hero && !this.hero.unitId.includes(userId);
  }

  setHighlight() {
    this.baseRectangle.setFillStyle(0x0080ff, 0.3);
  }

  clearHighlight() {
    this.baseRectangle.setFillStyle(0x0080ff, 0);
  }
}
