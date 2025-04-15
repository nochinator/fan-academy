import GameScene from "../scenes/game.scene";

export class ActionPie {
  constructor(context: GameScene) {
    // Action circle
    // REVIEW: could have just used a spritesheet...
    const actionCircle = context.add.image(0, 0, 'actionCircle').setOrigin(0.5).setPosition(550, 730);
    context.currentGameContainer?.add(actionCircle);
    const actionPie1 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(562, 711).setRotation(-0.3);
    context.currentGameContainer?.add(actionPie1);
    const actionPie2 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(574, 736).setRotation(0.9);
    context.currentGameContainer?.add(actionPie2);
    const actionPie3 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(554, 755).setRotation(2.2);
    context.currentGameContainer?.add(actionPie3);
    const actionPie4 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(532, 743).setRotation(3.4);
    context.currentGameContainer?.add(actionPie4);
    const actionPie5 = context.add.image(0, 0, 'actionPie').setOrigin(0.5).setPosition(535, 715).setRotation(4.7);
    context.currentGameContainer?.add(actionPie5);
    const actionArrow = context.add.image(0, 0, 'actionArrow').setOrigin(0.5).setPosition(515, 730).setRotation(-0.1).setVisible(false); // TODO: dynamic. Triggers after a move (if !visible, visible) and on undo (only if it's the first move) and on turn sent
    context.currentGameContainer?.add(actionArrow);
  }
}