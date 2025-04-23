import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { Tile } from "../classes/tile";
import { EItems } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, isHero, isInHand, isItem } from "./gameUtils";
import { deselectUnit, selectUnit } from "./playerUtils";

export function makeUnitClickable(unit: Hero | Item, context: GameScene): void {
  unit.on('pointerdown', () => {
    // Only the active player can activate units (obviously)
    if (context.activePlayer !== context.userId) return;

    const activeUnit = context.activeUnit;
    const isFriendly = belongsToPlayer(context, unit);
    const isEnemy = isHero(unit) && !isFriendly;
    const isSameUnit = activeUnit?.unitId === unit.unitId;

    // CASE 1: No active unit
    if (!activeUnit && isFriendly) {
      selectUnit(context, unit);
      return;
    }

    // CASE 2: Clicking the active unit deselects it
    if (isSameUnit) {
      deselectUnit(context);
      return;
    }

    // CASE 3: There is already an active unit
    if (activeUnit && !isSameUnit) {
      // CASE 3.1: Clicking an enemy unit
      if (isEnemy) {
        const attackReticle = unit.getByName('attackReticle') as Phaser.GameObjects.Image;

        if (isHero(activeUnit) && attackReticle?.visible) {
          activeUnit.attack(unit);
          deselectUnit(context);
          return;
        }

        if (isItem(activeUnit) && activeUnit.dealsDamage) {
          activeUnit.dealDamage(unit.boardPosition);
          deselectUnit(context); // TODO: unit not only is deselected, it is also removed from hand
          return;
        }
      }

      // CASE 3.2: Clicking a friendly unit
      if (isHero(unit) && isFriendly) {
        if (isItem(activeUnit)) {
          console.log('Missing logic for buffing / healing / reviving units with items');
          deselectUnit(context); // TODO: unit not only is deselected, it is also removed from hand
          return;
        }

        const healReticle = unit.getByName('healReticle') as Phaser.GameObjects.Image;
        if (activeUnit.canHeal && healReticle?.visible) {
          activeUnit.heal(unit);
          deselectUnit(context);
          return;
        }
      }

      // If unit can't be healed or teleported, switch focus to new unit
      deselectUnit(context);
      return selectUnit(context, unit);
    }
  });
}

export function makeTileClickable(tile: Tile, context: GameScene): void {
  tile.on('pointerdown', () => {
    if (context.activePlayer !== context.userId) return; // Only the active player can click on tiles

    const activeUnit = context.activeUnit;
    const gameController = context.gameController;
    if (!activeUnit || !gameController) return;

    // If unit is on the board and the tile clicked on is in range, move the unit
    if (activeUnit.boardPosition < 45 && tile.isHighlighted) gameController.moveHero(tile);

    // If hero is in hand and clicked tile is highlighted, spawn
    if (activeUnit.boardPosition > 44 && tile.isHighlighted) {
      if (isHero(activeUnit)) gameController.spawnHero(tile);
      if (isItem(activeUnit) && activeUnit.dealsDamage) gameController.aoeSpell(tile);
    }
  });
}