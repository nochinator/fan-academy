import { IItem } from "../../interfaces/gameInterface";
import GameScene from "../game.scene";

export function renderItem(context: GameScene, item: IItem): void {
  const itemCoordinates = context.centerPoints[item.boardPosition];

  const itemModel = context.add.image(itemCoordinates.x, itemCoordinates.y, item.itemType).setDepth(10);
}