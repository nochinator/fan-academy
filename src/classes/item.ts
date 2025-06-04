import { EClass, EFaction, EItems } from "../enums/gameEnums";
import { createItemData } from "../gameData/itemData";
import { IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { makeUnitClickable } from "../utils/makeUnitClickable";
import { Hero } from "./hero";

export abstract class Item extends Phaser.GameObjects.Image {
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
    if (this.boardPosition === 51) this.setVisible(false).disableInteractive();

    const displaySize = this.itemType === EItems.SUPERCHARGE || this.itemType === EItems.SHINING_HELM ? 55 : 100; // REVIEW: better way of doing this
    context.add.existing(this).setDisplaySize(displaySize, displaySize).setDepth(this.boardPosition + 10).setInteractive().setName(this.unitId);
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
  }

  onDeactivate() {
    console.log(`${this.unitId} is now inactive`);
    this.setScale(0.8);
  }

  removeFromGame(): void {
    // Remove animations
    this.scene.tweens.killTweensOf(this);

    this.context.gameController?.hand.removeFromHand(this);

    this.destroy(true);
  }

  abstract use(target: any): void;
}

export class ShiningHelm extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    target.equipShiningHelm(this.boardPosition);
    this.removeFromGame();
  }
}

export class RuneMetal extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    target.equipRunemetal(this.boardPosition);
    this.removeFromGame();
  }
}

export class SuperCharge extends Item {
  constructor(context: GameScene, data: Partial<IItem>) {
    super(context, createItemData(data));
  }

  use(target: Hero): void {
    target.equipSuperCharge(this.boardPosition);
    this.removeFromGame();
  }
}