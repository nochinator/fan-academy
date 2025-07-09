import { EActionType } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";

export class TurnButton {
  context: GameScene;
  constructor(context: GameScene) {
    this.context = context;
    const turnButton =  context.add.image(0, 0, 'turnButton').setOrigin(0.5).setPosition(1300, 725).setScale(1.1).setInteractive();
    if (context.activePlayer !== context.userId) turnButton.setVisible(false);

    // Sending a turn
    turnButton.on('pointerdown', async () => {
      if (context.currentGame && context.activePlayer === context.userId) {
        console.log('Clicked on send turn');

        if (context.gameController!.hasActionsLeft()) {
          context.gameController!.turnPopup.setVisible(true);
          return;
        }

        await this.handleSendingTurn();
      } else {
        console.log('Clicked on send turn but... not your turn');
      }
    });
  }

  async handleSendingTurn(): Promise<void> {
    const gameController = this.context.gameController!;
    if (this.context.currentTurnAction === 1) gameController.addActionToState(EActionType.PASS);

    // Remove KO'd units before end of turn actions to handle a possible game over
    await gameController.removeKOUnits();

    if (this.context.gameOver) {
      await gameController.handleGameOver();
    } else {
      gameController.endOfTurnActions();
    }
  }
}