import { IHero, IItem } from "../interfaces/gameInterface";
import { isHero } from "./deckUtils";

export function makeClickable(element: Phaser.GameObjects.Container | Phaser.GameObjects.Image, unit: IHero | IItem): void {
  element.on('pointerdown', () => {
    if (unit.isActiveValue) {
      element.setScale(isHero(unit) ? 1 : 0.8);
      unit.isActiveValue = false;
    } else {
      element.setScale(isHero(unit) ? 1.2 : 1);
      unit.isActiveValue = true;
    }
  });
}