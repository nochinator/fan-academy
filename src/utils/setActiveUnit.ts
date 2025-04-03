import { Hero } from "../classes/hero";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";

export function setActiveUnit(element: Phaser.GameObjects.Container | Phaser.GameObjects.Image, context: GameScene): void {
  element.on('pointerdown', () => {
    if (element.isActive) {
      element.isActive = false;
    } else {
      element.isActive = true;
    }
  });
}