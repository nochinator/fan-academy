import { EClass } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";

export function createItemData(data: Partial<IItem>): IItem {
  return {
    class: EClass.ITEM,
    faction: data.faction!,
    unitId: data.unitId!,
    itemType: data.itemType!,
    boardPosition: data.boardPosition ?? 51,
    belongsTo: data.belongsTo ?? 1,
    canHeal: data.canHeal ?? false,
    dealsDamage: data.dealsDamage ?? false
  };
}