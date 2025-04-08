// import { IItem } from "../../interfaces/gameInterface";
// import { makeClickable } from "../../utils/setActiveUnit";
// import GameScene from "../game.scene";

// export function renderItem(context: GameScene, item: IItem): void {
//   const itemCoordinates = context.centerPoints[item.boardPosition];

//   const itemModel = context.add.image(itemCoordinates.x, itemCoordinates.y - 10, item.itemType).setScale(0.8).setDepth(10).setInteractive().setName(item.unitId);

//   // Add listener for clicking on the unit
//   makeClickable(itemModel, item, context);

//   // Making the item not visible if it's in the deck (board position 51)
//   if (item.boardPosition === 51) {
//     itemModel.setVisible(false).disableInteractive();
//   }
// }