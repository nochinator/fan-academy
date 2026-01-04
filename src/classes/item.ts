import GameScene from "../scenes/game.scene";
import { IItemData as IItemData } from "../interfaces/gameInterface";
import { EActionType, EClass, EEffect, EGameSounds, EItems, EReticle } from "../enums/gameEnums";
import { Unit } from "./unit";
import * as effects from "./effects"
import { Tile } from "./tile";
import { Crystal } from "./crystal";
import { playSound } from "../utils/gameUtils";

export abstract class Item extends Phaser.GameObjects.Container {
  unitId: string;
  name: string;
  boardPosition: [number, number];
  itemType: EItems;
  belongsTo: number;
  class: EClass;
  canHeal: boolean;
  dealsDamage: boolean;
  isActive: boolean;
  selectSound: EGameSounds

  context: GameScene;
  itemImage: Phaser.GameObjects.Image;

  constructor(context: GameScene, data: IItemData) {
    const { x, y } = context.centerPoints[JSON.stringify(data.boardPosition)];
    super(context, x, y);
    this.context = context;

    this.unitId = data.unitId;
    this.name = data.name;
    this.boardPosition = data.boardPosition;
    this.itemType = data.itemType;
    this.belongsTo = data.belongsTo;
    this.class = data.class;
    this.canHeal = data.canHeal ?? false;
    this.dealsDamage = data.dealsDamage;
    this.isActive = false;
    this.selectSound = EGameSounds.ITEM_SELECT;

    this.setDepth(this.boardPosition[0] + 10);

    this.itemImage = context.add.image(0, 0, this.itemType).setOrigin(0.5).setName('itemImage');
    this.add(this.itemImage);

    // Making the item not visible if it's in the deck (board position 51)
    if (this.boardPosition[0] === -1 && this.boardPosition[1] === 6) this.setVisible(false).disableInteractive();

    this.itemImage.displayWidth = 110;
    this.itemImage.displayHeight = 110;

    if (this instanceof SuperCharge) {
      this.itemImage.displayWidth = 55;
      this.itemImage.displayHeight = 55;
    }

    if (this instanceof ShiningHelm) {
      this.itemImage.displayWidth = 45;
      this.itemImage.displayHeight = 65;
    }

    context.add.existing(this);
  }

  abstract use(target: Unit | Tile): void;
  showActions(): void {
    playSound(this.context, this.selectSound);
  
    this.context.gameController.board.tiles.forEach(row => {row.forEach(tile => {        
      if (tile.unit && tile.unit.belongsTo === this.belongsTo && !(tile.unit instanceof Crystal)) {
        console.log(tile.unit?.hasEffect(EEffect.SUPERCHARGED_BUFF))
      }
      if (tile.unit && tile.unit.belongsTo === this.belongsTo && !(tile.unit instanceof Crystal) && !tile.unit.isAlreadyEquipped(this.itemType)) {
        tile.setHighlight(EReticle.MOVE, this, this.use)
      }
    });});
  }

  updatePosition(tile: Tile): void {
    const { x, y } = this.context.centerPoints[JSON.stringify(tile.boardPosition)];
    this.x = x;
    this.y = y;
    this.boardPosition = tile.boardPosition;
    this.setDepth(tile.boardPosition[0] + 10);
  }

  removeFromGame(): void {
    this.destroy(true);
  }

  shuffleInDeck(): void {
    this.boardPosition = [-1, 6];

    const unitData = this.exportData();

    this.context.gameController.hand.removeFromHand(unitData);
    this.context.gameController.deck.addToDeck(unitData);

    this.removeFromGame();
  }

  exportData(): IItemData {
    return {
      unitId: this.unitId,
      name: this.name,
      boardPosition: this.boardPosition,
      itemType: this.itemType,
      belongsTo: this.belongsTo,
      class: this.class,
      canHeal: this.canHeal,
      dealsDamage: this.dealsDamage
    };
  }
}

export class RuneMetal extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.RUNE_METAL;
    this.selectSound = EGameSounds.RUNE_METAL_SELECT;
  }

  use(target: Tile) {
    const unit = target.unit;
    if (unit) {
      playSound(this.context, EGameSounds.RUNE_METAL_USE);
      unit.applyEffect(new effects.RuneMetalEquipment(this.context, unit));
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
      this.removeFromGame();
    }
  }
}

export class ShiningHelm extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.SHINING_HELM;
  }

  use(target: Tile) {
    const unit = target.unit;
    if (unit) {
      playSound(this.context, EGameSounds.ITEM_USE)
      unit.applyEffect(new effects.HelmEquipment(this.context, unit));
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
      this.removeFromGame();
    }
  }
}

export class SuperCharge extends Item {
  constructor(context: GameScene, data: IItemData) {
    super(context, data);
    this.itemType = EItems.SUPERCHARGE;
    this.selectSound = EGameSounds.SCROLL_SELECT
  }

  use(target: Tile) {
    const unit = target.unit;
    if (unit) {
      playSound(this.context, EGameSounds.SCROLL_USE)
      unit.applyEffect(new effects.SuperChargeBuff(this.context, unit));
      this.context.gameController.afterAction(EActionType.USE, this.boardPosition, unit.boardPosition);
      this.removeFromGame();
    }
  }
}
