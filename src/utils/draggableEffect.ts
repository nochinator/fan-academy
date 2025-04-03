import GameScene from "../scenes/game.scene";
import { calculateClosestSquare } from "./boardCalculations";

// FIXME: remove if not userd (if we are using click events instead of dragging)
export function makeDraggable(element: Phaser.GameObjects.Container | Phaser.GameObjects.Image, context: GameScene) {
  context.input.setDraggable(element);

  element.on('drag', (_: any, dragX: number, dragY: number) => {
    element.x = dragX;
    element.y = dragY;
  });

  element.on('pointerup', (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
    console.log('POINTERUP!!');
    const boardPosition = calculateClosestSquare(context.centerPoints, {
      x: element.x,
      y: element.y
    }); // TODO: add original position for snap back

    element.x = boardPosition.x;
    element.y = boardPosition.y;
  });
}