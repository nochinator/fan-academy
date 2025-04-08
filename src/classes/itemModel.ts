import GameScene from "../scenes/game.scene";
import { Item } from "./item";

export class ItemModel extends Phaser.GameObjects.Image {
  item: Item;

  constructor(context: GameScene, item: Item) {
    const { x, y } = context.centerPoints[item.boardPosition];
    const texture = item.itemType;
    super(context, x, y, texture);

    this.item = item;

    const itemCoordinates = context.centerPoints[this.item.boardPosition];

    const itemModel = context.add.image(itemCoordinates.x, itemCoordinates.y - 10, this.item.itemType).setScale(0.8).setDepth(10).setInteractive().setName(this.item.unitId);

    // Add listener for clicking on the unit
    // makeClickable(itemModel, item, context); // FIXME: this works but doesn't have the logic to do the checks

    // Making the item not visible if it's in the deck (board position 51)
    if (this.item.boardPosition === 51) {
      itemModel.setVisible(false).disableInteractive();
    }
  }
}