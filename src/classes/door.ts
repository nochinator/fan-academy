import GameScene from "../scenes/game.scene";

export class Door {
  constructor(context: GameScene) {
    // TODO: this should be a container, and swicht between open and closed. On container 'hoover' -> show icons of remaining units and items in the deck
    const doorClosed = context.add.image(0, 0, 'doorClosed').setOrigin(0.5).setPosition(490, 700).setScale(0.9).setInteractive();
    context.currentGameContainer?.add(doorClosed);

    const doorOpen = context.add.image(0, 0, 'doorOpen').setOrigin(0.5).setPosition(490, 700).setVisible(false); // TODO: trigger 'refill' event at the end of the player's turn
    context.currentGameContainer?.add(doorOpen);
    const doorBanner = context.add.image(0, 0, 'doorBanner').setOrigin(0.5).setPosition(440, 760); // TODO: add text
    context.currentGameContainer?.add(doorBanner);
  }
}