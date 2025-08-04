import GameScene from "../scenes/game.scene";

const actionPieCoordinates = {
  x: 550,
  y: 730
};

export class ActionPie extends Phaser.GameObjects.Container {
  actionCircle: Phaser.GameObjects.Image;
  actionPie1: Phaser.GameObjects.Image;
  actionPie2: Phaser.GameObjects.Image;
  actionPie3: Phaser.GameObjects.Image;
  actionPie4: Phaser.GameObjects.Image;
  actionPie5: Phaser.GameObjects.Image;
  actionArrow: Phaser.GameObjects.Image;
  context: GameScene;

  constructor(context: GameScene) {
    super(context, actionPieCoordinates.x, actionPieCoordinates.y);

    this.context = context;

    this.actionCircle = context.add.image(0, 0, 'actionCircle').setOrigin(0.5).setName('actionCircle');
    this.actionPie1 = context.add.image(12, -19, 'actionPie').setOrigin(0.5).setRotation(-0.3).setName('actionPie1');
    this.actionPie2 = context.add.image(24, 6, 'actionPie').setOrigin(0.5).setRotation(0.9).setName('actionPie2');
    this.actionPie3 = context.add.image(4, 25, 'actionPie').setOrigin(0.5).setRotation(2.2).setName('actionPie3');
    this.actionPie4 = context.add.image(-18, 13, 'actionPie').setOrigin(0.5).setRotation(3.4).setName('actionPie4');
    this.actionPie5 = context.add.image(-15, -15, 'actionPie').setOrigin(0.5).setRotation(4.7).setName('actionPie5');
    this.actionArrow = context.add.image(-35, 0, 'actionArrow').setOrigin(0.5).setRotation(-0.1).setName('actionArrow').setVisible(false);

    if (context.turnNumber === 0 && context.activePlayer === context.userId) {
      this.actionPie1.setVisible(false);
      this.actionPie2.setVisible(false);
    }

    this.add([this.actionCircle, this.actionPie1, this.actionPie2, this.actionPie3, this.actionPie4, this.actionPie5, this.actionArrow]);

    this.setSize(90, 90).setInteractive({ useHandCursor: true });


    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.context.longPressStart = this.context.time.now;

      if (pointer.button === 2) {
        this.context.gameController!.resetTurn();
      } else if (pointer.button === 0) {
        this.context.gameController!.undoLastAction();
      }
    });
    this.on('pointerup', () => {
      // Check if a long press occurred
      if (this.context.longPressStart && this.context.time.now - this.context.longPressStart > 500) {
        this.context.gameController!.resetTurn();
      }
    });

    context.add.existing(this);
  }

  resetActionPie() {
    if (this.context.turnNumber !== 0) {
      this.actionPie1.setVisible(true);
      this.popAnimation(this.actionPie1, true);

      this.actionPie2.setVisible(true);
      this.popAnimation(this.actionPie2, true);
    }
    this.actionPie3.setVisible(true);
    this.popAnimation(this.actionPie3, true);

    this.actionPie4.setVisible(true);
    this.popAnimation(this.actionPie4, true);

    this.actionPie5.setVisible(true);
    this.popAnimation(this.actionPie5, true);

    this.actionArrow.setVisible(false);
  }

popAnimation(image: Phaser.GameObjects.Image, show = false) {
    if (!image) return;

    // Set the visibility immediately
    image.setVisible(show);

    const originalIndex = this.getIndex(image);
    this.bringToTop(image);

    this.context.tweens.add({
      targets: image,
      scale: 1.5,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        // No need to set visibility here anymore
        this.moveTo(image, originalIndex);
      }
    });
}

  hideActionSlice(actionNumber: number) {
    switch (actionNumber) {
      case 1:
        this.popAnimation(this.actionPie1);
        this.actionArrow.setVisible(true);
        break;
      case 2:
        this.popAnimation(this.actionPie2);
        break;
      case 3:
        this.popAnimation(this.actionPie3);
        break;
      case 4:
        this.popAnimation(this.actionPie4);
        break;
      case 5:
        this.popAnimation(this.actionPie5);
        break;
    }
  };

  showActionSlice(actionNumber: number) {
    switch (actionNumber) {
      case 1:
        this.popAnimation(this.actionPie1, true);
        this.actionArrow.setVisible(false);
        break;
      case 2:
        this.popAnimation(this.actionPie2, true);
        break;
      case 3:
        this.popAnimation(this.actionPie3, true);
        break;
      case 4:
        this.popAnimation(this.actionPie4, true);
        break;
      case 5:
        this.popAnimation(this.actionPie5, true);
        break;
    }
  }
}