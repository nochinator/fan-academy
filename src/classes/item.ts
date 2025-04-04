import { EClass, EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export class Item implements IItem {
  class: EClass = EClass.ITEM;
  itemId: string;
  itemType: EItems;
  boardPosition: number;
  isActiveValue: boolean;

  constructor(itemId: string, itemType: EItems, boardPosition: number) {
    this.itemId = itemId;
    this.itemType = itemType;
    this.boardPosition = boardPosition;
    this.isActiveValue = false;
  }
}