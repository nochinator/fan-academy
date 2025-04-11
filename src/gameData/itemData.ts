import { EClass, EFaction } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export function createItemData(data: Partial<IItem>): IItem {
  return {
    class: EClass.ITEM,
    faction: data.faction!,
    unitId: data.unitId!,
    itemType: data.itemType!,
    boardPosition: data.boardPosition ?? 51
  };
}