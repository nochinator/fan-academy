import { EActionType } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";

export class TurnButton {
  context: GameScene;
  constructor(context: GameScene) {
    this.context = context;
    const turnButton =  context.add.image(0, 0, 'turnButton').setOrigin(0.5).setPosition(1300, 725).setScale(1.1);
    if (context.activePlayer === context.userId) turnButton.setInteractive(); // REVIEW: might not trigger in some cases

    // Sending a turn
    turnButton.on('pointerdown', async () => {
      if (context.currentGame && context.activePlayer === context.userId) {
        console.log('Clicked on send turn');

        // If a player sends a turn without taking any actions, add a PASS action to the game state
        // TODO: pop-up message if there are still actions to be taken in the turn
        if (context.currentTurnAction === 1) context.gameController?.addActionToState(EActionType.PASS);

        this.context.gameController!.endOfTurnActions();
      } else {
        console.log('Clicked on send turn but... not your turn'); // TODO: remove after testing
      }
    });
  }
}