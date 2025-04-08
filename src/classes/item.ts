import { EClass, EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export class Item implements IItem {
  class: EClass = EClass.ITEM;
  unitId: string;
  itemType: EItems;
  boardPosition: number;
  isActiveValue: boolean;

  constructor(itemId: string, itemType: EItems, boardPosition: number) {
    this.unitId = itemId;
    this.itemType = itemType;
    this.boardPosition = boardPosition;
    this.isActiveValue = false;
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