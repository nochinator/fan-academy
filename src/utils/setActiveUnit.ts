import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import GameScene from "../scenes/game.scene";
import { isInHand } from "./deckUtils";

export function makeClickable(unit: Hero | Item, context: GameScene): void {
  unit.on('pointerdown', () => {
    if (context.activePlayer != context.userId) return; // Only the active player can activate units (obviously)

    if(context.activeUnit && context.activeUnit.unitId === unit.unitId) {
      // Case 1: clicking on the active unit -> de-select unit
      unit.isActive = false;
      context.activeUnit = undefined;
    } else if(!context.activeUnit && !unit.isActive) {
      // Case 2: clicking on a unit when there are no active units -> select unit
      unit.isActive = true;
      context.activeUnit = unit;
    } else if(context.activeUnit && context.activeUnit.unitId != unit.unitId) {
      // Case 3: clicking on a unit when there is already an active unit -> ignore unless, clicked unit is in hand
      if (isInHand(unit.boardPosition)) {
        // De-select previous unit
        context.activeUnit!.isActive = false;
        console.log('Previous unit ->', JSON.stringify(context.activeUnit));

        unit.isActive = true;
        context.activeUnit = unit;
        console.log('Current unit ->', JSON.stringify(context.activeUnit));
      } else
        console.log('There is already a unit selected');
    }
  });
}