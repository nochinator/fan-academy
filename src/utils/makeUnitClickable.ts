import { Crystal } from "../classes/crystal";
import { Hero } from "../classes/hero";
import { Item } from "../classes/item";
import { Tile } from "../classes/tile";
import { EHeroes, ETiles } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { belongsToPlayer, isHero, isItem, isOnBoard } from "./gameUtils";
import { deselectUnit, selectUnit } from "./playerUtils";

export function makeUnitClickable(unit: Hero | Item, context: GameScene): void {
  unit.on('pointerdown', () => {
    console.log(`Unit in ${unit.boardPosition}`);
    console.log(unit);
    // Only the active player can click on tiles, and only if they still have actions available
    if (context.activePlayer !== context.userId || context.currentTurnAction! > 5) return;

    console.log('currentturnaction', context.currentTurnAction);

    const activeUnit = context.activeUnit;
    const isFriendly = belongsToPlayer(context, unit);
    const isEnemy = isHero(unit) && !isFriendly;
    const isSameUnit = activeUnit?.unitId === unit.unitId;
    console.log('UNIT', unit);

    const healReticle = isHero(unit) ? unit.getByName('healReticle') as Phaser.GameObjects.Image : undefined;
    const attackReticle = isHero(unit) ? unit.getByName('attackReticle') as Phaser.GameObjects.Image : undefined;

    // CASE 1: No active unit
    if (!activeUnit && isFriendly) {
      console.log('Case 1 logs');
      if (isHero(unit) && unit.isKO) return; // Can't select KO'd units

      selectUnit(context, unit);
      return;
    }

    // CASE 2: Clicking the active unit deselects it, unless it's a healer
    if (isSameUnit) {
      if (isHero(activeUnit) && activeUnit.canHeal && healReticle?.visible && isHero(unit)) {
        activeUnit.heal(unit);
        return;
      } else {
        deselectUnit(context);
      }
      return;
    }

    // CASE 3: There is already an active unit
    if (activeUnit && !isSameUnit) {
      // CASE 3.1: Clicking an enemy unit
      if (isEnemy) {
        if (isHero(activeUnit) && attackReticle?.visible) {
          activeUnit.attack(unit);
          return;
        }

        // Stomp enemy KO'd units
        if (isHero(activeUnit) && unit.isKO) {
          const unitTile = context.gameController!.board.getTileFromBoardPosition(unit.boardPosition);
          activeUnit.move(unitTile);
        }

        if (isItem(activeUnit) && activeUnit.dealsDamage) {
          activeUnit.use(unit.getTile());
          return;
        }
      }

      // CASE 3.2: Clicking a friendly unit on the board
      if (isHero(unit) && isFriendly && unit.boardPosition < 45) {
        // Necromancer and Wraith can target friendly units if they are knocked down. NOTE: this check should always go before the stomping check
        console.log('ActiveUnitType', activeUnit);
        if (isHero(activeUnit) && [EHeroes.NECROMANCER, EHeroes.WRAITH].includes(activeUnit.unitType) && unit.isKO && attackReticle?.visible) {
          activeUnit.attack(unit);
          return;
        }

        if (isHero(activeUnit)) {
          // Spawn stomp friendly units with a unit from hand
          const unitTile = unit.getTile();
          if (unit.isKO && unitTile && unitTile.tileType === ETiles.SPAWN && unitTile.isHighlighted && activeUnit.boardPosition >= 45) {
            activeUnit.spawn(unitTile);
            return;
          }

          // Stomp friendly KO'd units, unless you are a Necromancer
          if (unit.isKO && activeUnit.unitType !== EHeroes.NECROMANCER) {
            const unitTile = context.gameController!.board.getTileFromBoardPosition(unit.boardPosition);
            activeUnit.move(unitTile);
            return;
          }

          // Ninja can swap places with any friendly unit on the board
          if (activeUnit.unitType === EHeroes.NINJA) {
            activeUnit.teleport(unit);
            return;
          }

          if (activeUnit.canHeal && healReticle?.visible) {
            activeUnit.heal(unit);
            return;
          }
        }

        if (isItem(activeUnit)) {
          if (unit.isAlreadyEquipped(activeUnit)) return;

          if (activeUnit.dealsDamage) activeUnit.use(unit.getTile());
          if (!activeUnit.dealsDamage) activeUnit.use(unit);

          return;
        }
      }

      // If the new unit can't be attacked, healed or teleported, and it's a friendly unit, switch focus to new unit
      if (isFriendly) {
        if (isHero(unit) && unit.isKO) return;
        deselectUnit(context);
        return selectUnit(context, unit);
      }
    }
  });
}

export function makeTileClickable(tile: Tile, context: GameScene): void {
  tile.on('pointerdown', () => {
    console.log('Clicked tile', tile.boardPosition);
    // Only the active player can click on tiles, and only if they still have actions available
    if (context.activePlayer !== context.userId || context.currentTurnAction! > 5) return;

    const activeUnit = context.activeUnit;
    const gameController = context.gameController;
    if (!activeUnit || !gameController) return;

    // If unit is on the board and the tile clicked on is in range, move the unit
    if (activeUnit.boardPosition < 45 && tile.isHighlighted && isHero(activeUnit)) activeUnit.move(tile);

    // If hero is in hand and clicked tile is highlighted, spawn
    if (activeUnit.boardPosition > 44 && tile.isHighlighted) {
      if (isHero(activeUnit) && !tile.isOccupied()) activeUnit.spawn(tile);
      if (isItem(activeUnit) && activeUnit.dealsDamage) gameController.aoeSpell(tile);
    }

    // AOE damaging spells can target empty tiles
    if (isItem(activeUnit) && activeUnit.dealsDamage) activeUnit.use(tile);
  });
}

export function makeCrystalClickable(crystal: Crystal, context: GameScene): void {
  crystal.on('pointerdown', () => {
    console.log('Crystal ->', crystal);
    const attackReticle = crystal.attackReticle;
    const activeUnit = context.activeUnit;

    if (activeUnit) {
      if (isHero(activeUnit) && attackReticle.visible) {
        activeUnit.attack(crystal);
        return;
      }
      if (isItem(activeUnit) && activeUnit?.dealsDamage) {
        activeUnit.use(crystal.getTile());
        return;
      }
    }
  });
}