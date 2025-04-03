import { IHero, IItem } from "../interfaces/gameInterface";

export function makeClickable(element: Phaser.GameObjects.Container | Phaser.GameObjects.Image, unit: IHero | IItem): void {
  element.on('pointerdown', () => {
    if (unit.isActive) {
      element.setScale(1);
      unit.isActive = false;
    } else {
      element.setScale(1.2);
      unit.isActive = true;
    }
  });
}