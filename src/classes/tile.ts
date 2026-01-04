import { EGameStatus, EReticle, ETiles } from "../enums/gameEnums";
import { ITile } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { createNewItem, createNewUnit } from "../utils/gameUtils";
import { SpecialTileCard } from "./specialTileCard";
import { Unit } from "./unit";
import { Item } from "./item";

export class Tile extends Phaser.GameObjects.Container {
  baseRectangle: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
  boardPosition: [number, number];

  unit: Unit | undefined;
  item: Item | undefined;
  tileSize: number = 90;
  tileType: ETiles;

  unitCard: SpecialTileCard | undefined;
  icon: Phaser.GameObjects.Image | undefined;

  isActiveTile: boolean;
  clickAction: Function | undefined;
  clickContext: object | undefined;
  attackReticle: Phaser.GameObjects.Image;
  healReticle: Phaser.GameObjects.Image;
  allyReticle: Phaser.GameObjects.Image;
  blockedLOS: Phaser.GameObjects.Image;

  context: GameScene;

  constructor(context: GameScene,
    data: ITile) {
    super(context, data.x, data.y);

    this.x = data.x;
    this.y = data.y;
    this.tileType = data.tileType;
    this.unit = data.unit && createNewUnit(context, data.unit);
    this.item = data.item && createNewItem(context, data.item);
    this.boardPosition = data.boardPosition;
    this.clickAction = undefined;
    this.clickContext = undefined;
    this.isActiveTile = false;

    this.context = context;

    // Add base tile shape
    this.baseRectangle = context.add.rectangle(0, 0, this.tileSize, this.tileSize);
    this.attackReticle = context.add.image(0, -10, 'attackReticle').setOrigin(0.5).setScale(0.8).setName('attackReticle').setVisible(false);
    this.healReticle = context.add.image(0, -10, 'healReticle').setOrigin(0.5).setScale(0.8).setName('healReticle').setVisible(false);
    this.allyReticle = context.add.image(0, -10, 'allyReticle').setOrigin(0.5).setScale(0.6).setName('allyReticle').setVisible(false);
    this.blockedLOS = context.add.image(0, -10, 'blockedLOS').setOrigin(0.5).setName('blockedLOS').setVisible(false);

    // Add animations to the reticles
    const addCirclingTween = (reticle: Phaser.GameObjects.Image) => {
      context.tweens.add({
        targets: reticle,
        angle: 360,
        duration: 7000,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          // Reset the angle to 0 each time to prevent overflow
          reticle.angle = 0;
        }
      });
    };
    addCirclingTween(this.attackReticle);
    addCirclingTween(this.healReticle);
    addCirclingTween(this.allyReticle);

    context.tweens.add({
      targets: this.blockedLOS,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add([
      this.attackReticle,
      this.healReticle,
      this.allyReticle,
      this.baseRectangle,
      this.blockedLOS
    ]);

    if (this.tileType !== ETiles.BASIC) this.unitCard = new SpecialTileCard(context, this.tileType).setVisible(false);

    // If tileType is not basic or a crystal, add the visual representation
    const typesToIgnore = ETiles.BASIC
    if (!typesToIgnore.includes(this.tileType)) {
      this.icon = context.add.image(0, 0, this.tileType);
      if (this.boardPosition[1] > 4) this.icon.setFlipX(true);
      this.add(this.icon);
    }
    this.setSize(90, 90).setInteractive({ useHandCursor: true }).setDepth(3)

    this.on('pointerdown', () => { this.context.longPressStart = this.context.time.now})

    this.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if ((pointer.button === 2 || (this.context.longPressStart && this.context.time.now - this.context.longPressStart > 500)) && this.unit) {
        this.unit.setDepth(10001);
        this.unit.unitCard.setVisible(true);
        this.context.visibleUnitCard = this.unit;
      } else if (pointer.button === 0) {
        // don't allow extra action or actions not on your turn
        const turnCount = this.context.currentTurnAction
        const firstTurnMovesCheck = this.context.turnNumber === 0 && turnCount >= 4;
        const MovesCheck = turnCount >= 6;
        const isNotActivePlayer = this.context.activePlayer !== this.context.userId;
        
        if (firstTurnMovesCheck || MovesCheck || isNotActivePlayer || this.context.currentGame.status === EGameStatus.FINISHED) {
          return
        }
  
        // stop thinkingTune if playing
        this.context.thinkingTune.stop();
        if (this.isActiveTile) {
          this.context.gameController.board.clearHighlights();
        } else if (this.boardPosition[0] === -1) {
          this.context.gameController.board.clearHighlights();
          this.isActiveTile = true;
          if (this.unit) {
            this.unit.setScale(1.2);
            this.unit.showSpawn();
          } if (this.item) {
            console.log(this.item);
            this.item.setScale(1.2);
            this.item.showActions();
          }
        } else if (this.clickAction) {
          this.clickAction.call(this.clickContext, this); // calls with the proper instancing
          this.context.gameController.board.clearHighlights();
        } else if (this.unit) {
          this.context.gameController.board.clearHighlights();
          this.isActiveTile = true;
          this.unit.showActions();
        } else {
          this.context.gameController.board.clearHighlights();
        }
      }  
    });

    if (this.unitCard) this.add(this.unitCard);

    context.add.existing(this);
  }

  getTileData(): ITile {
    return {
      x: this.x,
      y: this.y,
      tileType: this.tileType,
      boardPosition: this.boardPosition,
      unit: this.unit?.exportData(),
      item: this.item?.exportData(),
    };
  }

  removeUnit(): void {
    this.unit = undefined;
  }

  isFriendly(userId: string) {
    return this.unit && this.unit.unitId.includes(userId);
  }

  isEnemy(userId: string) {
    return this.unit && !this.unit.unitId.includes(userId);
  }

  setHighlight(reticle: EReticle, context: object, action: Function | undefined) {
    this.clickAction = action;
    this.clickContext = context;
    switch (reticle) {
      case EReticle.MOVE:
        this.baseRectangle.setFillStyle(0x0080ff, 0.3);
        break;
      case EReticle.ATTACK:
        this.attackReticle.setVisible(true);
        break;
      case EReticle.HEAL:
        this.healReticle.setVisible(true);
        break;
      case EReticle.ALLY:
        this.allyReticle.setVisible(true);
        break;
      case EReticle.BLOCKED:
        this.blockedLOS.setVisible(true);
        break;
    }
  }

  clearHighlight() {
    this.unit?.setScale(1);
    this.item?.setScale(1);
    this.isActiveTile = false;
    this.clickAction = undefined;
    this.clickContext = undefined;
    this.baseRectangle.setFillStyle();
    this.attackReticle.setVisible(false);
    this.healReticle.setVisible(false);
    this.allyReticle.setVisible(false);
    this.blockedLOS.setVisible(false);
  }
}
