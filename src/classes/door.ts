import { getPlayersState } from "../lib/getPlayersFromState";
import GameScene from "../scenes/game.scene";

export class Door extends Phaser.GameObjects.Container {
  doorClosed: Phaser.GameObjects.Image;
  doorOpen: Phaser.GameObjects.Image;
  doorBanner: Phaser.GameObjects.Image;
  bannerText: Phaser.GameObjects.Text;

  constructor(context: GameScene) {
    super(context, 450, 715);

    // TODO: this should be a container, and swicht between open and closed. On container 'hoover' -> show icons of remaining units and items in the deck
    this.doorClosed = context.add.image(50, -15, 'doorClosed').setScale(0.9);

    this.doorOpen = context.add.image(55, -15, 'doorOpen').setVisible(false); // TODO: trigger 'refill' event at the end of the player's turn

    this.doorBanner = context.add.image(0, 45, 'doorBanner');

    const { player } = getPlayersState(context);
    const deckSize: number = player.factionData.unitsInDeck.length;
    this.bannerText = context.add.text(0, 45 + 2, deckSize!.toString(), {
      fontFamily: "proLight",
      fontSize: 30,
      color: '#000000'
    }).setOrigin(0.5);

    this.add([this.doorClosed, this.doorOpen, this.doorBanner, this.bannerText]);

    this.setSize(70, 100).setInteractive();

    context.add.existing(this);
    context.currentGameContainer?.add(this);
  }
}