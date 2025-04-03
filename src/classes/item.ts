import { EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export class Item implements IItem {
  class: "item";
  itemId: string;
  itemType: EItems;
  boardPosition: number;
  isActive: boolean;

  constructor(itemType: EItems, itemId: string, boardPosition: number) {
    this.class = "item";
    this.itemType = itemType;
    this.itemId = itemId;
    this.boardPosition = boardPosition;
    this.isActive = false;
  }
}