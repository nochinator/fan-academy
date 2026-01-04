import { IUnitData, IItemData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { createNewUnit, createNewItem } from "../utils/gameUtils";
import { getCurrentPlayer } from "../utils/playerUtils";
import { Unit } from "./unit";
import { Item } from "./item";
import { Tile } from "./tile";
import { Board } from "./board";
import { EClass } from "../enums/gameEnums";

export class Hand {
  context: GameScene;
  handData: (IUnitData | IItemData)[];
  hand: (Unit | Item)[];
  handTiles: Tile[]; // New property to store references to hand tiles

  constructor(context: GameScene, board: Board) {
    this.context = context;
    // Initialize handTiles from the Board
    this.handTiles = board.tiles[-1] ?? [];

    this.handData = getCurrentPlayer(context).factionData.unitsInHand ?? [];
    // When rendering units/items, associate them with their hand tile if they have a hand position
    this.hand = this.handData?.map(itemOrUnitData => {
      const handTile = board.getTileFromBoardPosition(itemOrUnitData.boardPosition);
      let createdEntity;

      if (itemOrUnitData.class === EClass.UNIT) {
        createdEntity = createNewUnit(context, itemOrUnitData as IUnitData);
        handTile.unit = createdEntity;
      } else {
        createdEntity = createNewItem(context, itemOrUnitData as IItemData);
        handTile.item = createdEntity;
      }

      createdEntity.updatePosition(handTile);
      handTile.setVisible(true);
      return createdEntity;
    }) ?? [];
  }
  getHandSize(): number {
    return this.hand.length;
  }

  getHand(): (Unit | Item)[] {
    return this.hand;
  }

  addToHand(units: (IUnitData | IItemData)[]): void {
    const defaultPositions = [0, 1, 2, 3, 4, 5];

    let previousIndex = -1;
    defaultPositions.forEach(element => {
      const matchIndex = this.hand.findIndex(unit => {
        return unit.boardPosition[0] === -1 && 
        unit.boardPosition[1] === element;
      });

      if (matchIndex !== -1) {
        previousIndex = matchIndex;
      } else {
        const entityData = units.shift();
        if (entityData) {
          entityData.boardPosition = [-1, element];
          let newEntity: Item | Unit;
          if (entityData.class === EClass.UNIT) {
            newEntity = createNewUnit(this.context, entityData as IUnitData);
          } else {
            newEntity = createNewItem(this.context, entityData as IItemData);
          }
          
          this.hand.splice(++previousIndex, 0, newEntity);
        }
      }
    });
  }

  removeFromHand(unitToRemove: IUnitData | IItemData): void {
    const index = this.hand.findIndex(unit => unit.unitId === unitToRemove.unitId);
    if (index !== -1) this.hand.splice(index, 1);// can't use filter because creating a new array breaks the reference with factionData
  }

  exportHandData(): (IUnitData | IItemData)[] {
    if (this.hand.length === 0) return [];
    return this.hand.map(unit =>  unit.exportData());
  }
}
