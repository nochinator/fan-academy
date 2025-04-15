import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { Tile } from "../classes/tile";
import { EClass, EItems } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { isInHand, isItem } from "./deckUtils";

export function makeUnitClickable(unit: Hero | Item, context: GameScene): void {
  unit.on('pointerdown', () => {
    // TODO: do a check for not activating enemy units
    // TODO: adds check here for targetting
    if (context.activePlayer != context.userId) return; // Only the active player can activate units (obviously)

    if(context.activeUnit && context.activeUnit.unitId === unit.unitId) {
      // Case 1: clicking on the active unit -> de-select unit
      unit.isActive = false;
      context.activeUnit = undefined;

      // Clear highlighted tiles, if any
      context.gameController?.board.clearHighlights();
    } else if(!context.activeUnit && !unit.isActive) {
      // Case 2: clicking on a unit when there are no active units -> select unit
      unit.isActive = true;
      context.activeUnit = unit;

      // Highlight tiles
      if (unit.class === EClass.HERO) context.gameController?.onHeroClicked(unit as Hero); // FIXME:
      if (unit.class === EClass.ITEM) context.gameController?.onItemClicked(unit as Item); // FIXME:
    } else if(context.activeUnit && context.activeUnit.unitId != unit.unitId) {
      // Case 3: clicking on a unit when there is already an active unit -> ignore unless, clicked unit is in hand
      if (isInHand(unit.boardPosition)) {
        // De-select previous unit
        context.activeUnit!.isActive = false;
        console.log('Previous unit ->', JSON.stringify(context.activeUnit));
        // Clear highlighted tiles, if any
        context.gameController?.board.clearHighlights();

        unit.isActive = true;
        context.activeUnit = unit;
        console.log('Current unit ->', JSON.stringify(context.activeUnit));
        // Highlight tiles
        if (unit.class === EClass.HERO) context.gameController?.onHeroClicked(unit as Hero); // FIXME:
        if (unit.class === EClass.ITEM) context.gameController?.onItemClicked(unit as Item); // FIXME:
      } else
        console.log('There is already a unit selected');
    }
  });
}

export function makeTileClickable(tile: Tile, context: GameScene): void {
  tile.on('pointerdown', () => {
    console.log('Clicking a tile works');
    const activeUnit = context.activeUnit;
    const gameController = context.gameController;
    if (!activeUnit || !gameController) return;
    if (context.activePlayer != context.userId) return; // Only the active player can click on tiles

    // If unit is on the board and the tile clicked on is in range, move the unit
    if (activeUnit.boardPosition < 45 && tile.isHighlighted) gameController.moveHero(tile);

    // If hero is in hand and clicked tile is highlighted, spawn
    if (activeUnit.boardPosition > 44 && tile.isHighlighted) gameController.spawnHero(tile);

    // If item is in hand, check if the activeUnit is a inferno or sould harvest (otherwise, it should have not clicked on a tile...) // REVIEW:
    if (isItem(activeUnit) && (activeUnit.itemType === EItems.SOUL_HARVEST || activeUnit.itemType === EItems.INFERNO)) gameController.aoeSpell(tile);
  });
}