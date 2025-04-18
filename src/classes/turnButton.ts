import { sendTurnMessage } from "../lib/colyseusGameRoom";
import GameScene from "../scenes/game.scene";

export class TurnButton {
  constructor(context: GameScene) {
    const turnButton =  context.add.image(0, 0, 'turnButton').setOrigin(0.5).setPosition(1300, 725).setScale(1.1);
    if (context.activePlayer === context.userId) turnButton.setInteractive(); // REVIEW: might not trigger in some cases
    context.currentGameContainer?.add(turnButton);

    turnButton.on('pointerdown', async () => {
      console.log('Check context.currentGame && context.currentGame.activePlayer', context.currentGame, context?.currentGame?.activePlayer);
      if (context.currentGame && context.currentGame.activePlayer === context.userId) {
        console.log('Clicked on send turn');

        // TODO: refresh actionPie - drawn units - update door banner - receive an update to move the game to Opponent's turn
        sendTurnMessage(context.currentRoom, context.currentGame.currentState, context.currentOpponent);
      } else {
        console.log('Clicked on send turn but... not your turn'); // TODO: remove after testing
      }
    });
  }
}