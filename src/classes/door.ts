import GameScene from "../scenes/game.scene";
import { getCurrentPlayer } from "../utils/playerUtils";

export class Door extends Phaser.GameObjects.Container {
  doorClosed: Phaser.GameObjects.Image;
  doorOpen: Phaser.GameObjects.Image;
  doorBanner: Phaser.GameObjects.Image;
  bannerText: Phaser.GameObjects.Text;
  context: GameScene;

  constructor(context: GameScene) {
    super(context, 450, 715);
    this.context = context;

    // TODO: this should be a container, and swich between open and closed. On container 'hoover' -> show icons of remaining units and items in the deck
    this.doorClosed = context.add.image(50, -15, 'doorClosed').setScale(0.9);

    this.doorOpen = context.add.image(55, -15, 'doorOpen').setVisible(false); // TODO: trigger 'refill' event at the end of the player's turn

    this.doorBanner = context.add.image(0, 45, 'doorBanner');
    const deckSize: number = getCurrentPlayer(context).factionData.unitsInDeck.length ?? 99;
    this.bannerText = this.context.add.text(0, 45 + 2, deckSize!.toString(), {
      fontFamily: "proLight",
      fontSize: 30,
      color: '#000000'
    }).setOrigin(0.5);

    this.add([this.doorClosed, this.doorOpen, this.doorBanner, this.bannerText]);

    this.setSize(70, 100).setInteractive();

    context.add.existing(this);
  }

  updateBannerText(): void {
    const deckSize: number = this.context.gameController?.deck.getDeckSize() ?? 0; // REVIEW:

    this.bannerText.setText(deckSize.toString());
  }
}