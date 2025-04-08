import { EClass, EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeClickable } from "../utils/setActiveUnit";

export class Item extends Phaser.GameObjects.Image implements IItem {
  class: EClass = EClass.ITEM;
  unitId: string;
  itemType: EItems;
  boardPosition: number;
  isActiveValue: boolean;

  constructor(context: GameScene, data: {
    unitId: string,
    itemType: EItems,
    boardPosition: number
  }) {
    const { x, y } = context.centerPoints[data.boardPosition];
    const texture = data.itemType;
    super(context, x, y - 10, texture);

    // Item Interface assignment
    this.unitId = data.unitId;
    this.itemType = data.itemType;
    this.boardPosition = data.boardPosition;
    this.isActiveValue = false;

    // Add listener for clicking on the unit
    makeClickable(this, context); // FIXME: this works but doesn't have the logic to do the checks

    // Making the item not visible if it's in the deck (board position 51)
    if (this.boardPosition === 51) {
      this.setVisible(false).disableInteractive();
    }

    context.add.existing(this).setScale(0.8).setDepth(10).setInteractive().setName(this.unitId);
  }

  get isActive() {
    return this.isActiveValue;
  }

  set isActive(value: boolean) {
    this.isActiveValue = value;
    if (value) {
      this.onActivate();
    } else {
      this.onDeactivate();
    }
  }

  onActivate() {
    console.log(`${this.unitId} is now active`);
    this.highlightMovementTiles();
    this.highlightEnemiesInRange();
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.clearHighlights();
  }

  highlightMovementTiles() {
    console.log("Highlighting movement tiles...");
    // Add logic to highlight movement range tiles
  }

  highlightEnemiesInRange() {
    console.log("Highlighting enemies in range...");
    // Add logic to highlight attackable enemies
  }

  clearHighlights() {
    console.log("Clearing all highlights...");
    // Add logic to remove movement/attack highlights
  }
}