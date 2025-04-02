import { EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export class Item implements IItem {
  class: "item";
  itemType: EItems;
  boardPosition: number;

  constructor(itemType: EItems, boardPosition: number) {
    this.class = "item";
    this.itemType = itemType;
    this.boardPosition = boardPosition;
  }
}