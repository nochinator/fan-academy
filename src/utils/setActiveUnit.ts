import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import GameScene from "../scenes/game.scene";
import { isHero, isInHand } from "./deckUtils";

export function makeClickable(element: Phaser.GameObjects.Container | Phaser.GameObjects.Image, unit: Hero | Item, context: GameScene): void {
  element.on('pointerdown', () => {
    if (context.activePlayer != context.userId) return; // Only the active player can activate units (obviously)

    if(context.activeUnit && context.activeUnit.unitId === unit.unitId) {
      // Case 1: clicking on the active unit -> de-select unit
      element.setScale(isHero(unit) ? 1 : 0.8);
      unit.isActive = false;
      context.activeUnit = undefined;
    } else if(!context.activeUnit && !unit.isActive) {
      // Case 2: clicking on a unit when there are no active units -> select unit
      element.setScale(isHero(unit) ? 1.2 : 1);
      unit.isActive = true;
      context.activeUnit = unit;
    } else if(context.activeUnit && context.activeUnit.unitId != unit.unitId) {
      // Case 3: clicking on a unit when there is already an active unit -> ignore unless, clicked unit is in hand
      if (isInHand(unit.boardPosition)) {
        // De-select previous unit
        context.activeUnit!.isActive = false;
        element.setScale(isHero(unit) ? 1 : 0.8);

        console.log('Previous unit ->', JSON.stringify(context.activeUnit));

        element.setScale(isHero(unit) ? 1.2 : 1);
        unit.isActive = true;
        context.activeUnit = unit;
        console.log('Current unit ->', JSON.stringify(context.activeUnit));

        // TODO: find a way to update the previously selected unit // FIXME:
        console.log('Dont forget to manually update the other unit');
      } else
        console.log('There is already a unit selected');
    }
  });
}