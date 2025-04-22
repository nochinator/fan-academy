import { EClass, EFaction, EItems } from "../enums/gameEnums";
import { IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeUnitClickable } from "../utils/makeUnitClickable";
import { Hero } from "./hero";

export class Item extends Phaser.GameObjects.Image {
  class: EClass = EClass.ITEM;
  faction: EFaction;
  unitId: string;
  itemType: EItems;
  boardPosition: number;
  isActiveValue: boolean;
  belongsTo: number;
  canHeal: boolean;
  dealsDamage: boolean;

  context: GameScene;

  constructor(context: GameScene, data: IItem) {
    const { x, y } = context.centerPoints[data.boardPosition];
    const texture = data.itemType;
    super(context, x, y - 20, texture);
    this.context = context;

    // Interface properties assignment
    this.unitId = data.unitId;
    this.faction = data.faction;
    this.itemType = data.itemType;
    this.boardPosition = data.boardPosition;
    this.isActiveValue = false;
    this.belongsTo = data.belongsTo ?? 1;
    this.canHeal = data.canHeal ?? false;
    this.dealsDamage = data.dealsDamage ?? false;

    // Add listener for clicking on the unit
    makeUnitClickable(this, context);

    // Making the item not visible if it's in the deck (board position 51)
    if (this.boardPosition === 51) {
      this.setVisible(false).disableInteractive();
    }

    const displaySize = this.itemType === EItems.SUPERCHARGE || this.itemType === EItems.SHINING_HELM ? 55 : 100; // REVIEW: better way of doing this
    context.add.existing(this).setDisplaySize(displaySize, displaySize).setDepth(10).setInteractive().setName(this.unitId);
    context.currentGameContainer?.add(this);
  }

  get isActive() {
    return this.isActiveValue;
  }

  set isActive(value: boolean) {
    this.isActiveValue = value;
    if (value) {
      this.onActivate();
    } else {
      this.onDeactivate();
    }
  }

  exportData(): IItem {
    return {
      class: this.class,
      faction: this.faction,
      unitId: this.unitId,
      itemType: this.itemType,
      boardPosition: this.boardPosition,
      belongsTo: this.belongsTo,
      canHeal: this.canHeal,
      dealsDamage: this.dealsDamage
    };
  }

  updatePosition(boardPosition: number): void {
    const { x, y } = this.context.centerPoints[boardPosition];
    this.x = x;
    this.y = y;
    this.boardPosition = boardPosition;
  }

  onActivate() {
    console.log(`${this.unitId} is now active`);
    this.setScale(1);

    this.highlightMovementTiles();
    this.highlightEnemiesInRange();
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.setScale(0.8);

    this.clearHighlights();
  }

  highlightMovementTiles() {
    console.log("Highlighting movement tiles...");
    // Add logic to highlight movement range tiles
  }

  highlightEnemiesInRange() {
    console.log("Highlighting enemies in range...");
    // Add logic to highlight attackable enemies
  }

  clearHighlights() {
    console.log("Clearing all highlights...");
    // Add logic to remove movement/attack highlights
  }

  dealDamage(boardPosition: number): void {
    // All damage items are AOE, right?
  }

  heal(target: Hero): void {
    // Check if unit can heal and if target should be healed or revived
  }
}