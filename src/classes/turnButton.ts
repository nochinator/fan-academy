import { sendTurnMessage } from "../lib/colyseusGameRoom";
import GameScene from "../scenes/game.scene";

export class TurnButton {
  context: GameScene;
  constructor(context: GameScene) {
    this.context = context;
    const turnButton =  context.add.image(0, 0, 'turnButton').setOrigin(0.5).setPosition(1300, 725).setScale(1.1);
    if (context.activePlayer === context.userId) turnButton.setInteractive(); // REVIEW: might not trigger in some cases
    context.currentGameContainer?.add(turnButton);

    // Sending a turn
    turnButton.on('pointerdown', async () => {
      if (context.currentGame && context.currentGame.activePlayer === context.userId) {
        console.log('Clicked on send turn');

        this.endOfTurnActions();
        sendTurnMessage(context.currentRoom, context.currentGame.currentState, context.currentOpponent);
      } else {
        console.log('Clicked on send turn but... not your turn'); // TODO: remove after testing
      }
    });
  }

  endOfTurnActions() {
    // Refresh actionPie, draw units and update door banner
    this.context.gameController?.actionPie.resetActionPie();
    this.context.gameController?.drawUnits();
    this.context.gameController?.door.updateBannerText();
  }
}