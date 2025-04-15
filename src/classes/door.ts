import GameScene from "../scenes/game.scene";

const doorCoordinates = {
  x: 490,
  y: 700
};

const bannerCoordinates = {
  x: -45,
  y: 60
};

export class Door extends Phaser.GameObjects.Container {
  doorClosed: Phaser.GameObjects.Image;
  doorOpen: Phaser.GameObjects.Image;
  doorBanner: Phaser.GameObjects.Image;
  bannerText: Phaser.GameObjects.Text;
  constructor(context: GameScene) {
    super(context, doorCoordinates.x, doorCoordinates.y);
    // TODO: this should be a container, and swicht between open and closed. On container 'hoover' -> show icons of remaining units and items in the deck
    this.doorClosed = context.add.image(0, 0, 'doorClosed').setOrigin(0.5).setScale(0.9).setInteractive();
    context.currentGameContainer?.add(this.doorClosed);

    this.doorOpen = context.add.image(0, 0, 'doorOpen').setOrigin(0.5).setVisible(false); // TODO: trigger 'refill' event at the end of the player's turn
    context.currentGameContainer?.add(this.doorOpen);

    this.doorBanner = context.add.image(bannerCoordinates.x, bannerCoordinates.y, 'doorBanner').setOrigin(0.5);
    context.currentGameContainer?.add(this.doorBanner);

    const player = context.currentGame?.players[0].userData._id === context.userId ? 'player1' : 'player2'; // FIXME:
    const deckSize: number | undefined = context.currentGame?.gameState[0][player]!.factionData.unitsInDeck.length; // FIXME: add currentTurn to a 'playing' game in the BE
    this.bannerText = context.add.text(bannerCoordinates.x, bannerCoordinates.y + 2, deckSize!.toString(), {
      fontFamily: "proLight",
      fontSize: 30,
      color: '#000000'
    }).setOrigin(0.5);
    context.currentGameContainer?.add(this.bannerText);
    this.add([this.doorClosed, this.doorOpen, this.doorBanner, this.bannerText]);

    context.add.existing(this);
    context.currentGameContainer?.add(this);
  }
}