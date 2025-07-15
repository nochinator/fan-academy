import { EChallengePopup, EFaction } from "../enums/gameEnums";
import { sendChallengeAcceptedMessage } from "../colyseus/colyseusLobbyRoom";
import { newGameChallenge } from "../queries/gameQueries";
import LeaderboardScene from "../scenes/leaderboard.scene";
import UIScene from "../scenes/ui.scene";
import { truncateText } from "../utils/gameUtils";
import GameScene from "../scenes/game.scene";

const challengePopupCoordinates = {
  x: 800,
  y: 400
};

export class ChallengePopup extends Phaser.GameObjects.Container {
  blockingLayer: Phaser.GameObjects.Rectangle;
  backgroundImage: Phaser.GameObjects.Image;
  councilButtonImage: Phaser.GameObjects.Image;
  elvesButtonImage: Phaser.GameObjects.Image;
  cancelButtonImage: Phaser.GameObjects.Image;

  popupText: Phaser.GameObjects.Text;
  cancelButtonText: Phaser.GameObjects.Text;

  constructor(params: {
    context: LeaderboardScene | UIScene | GameScene,
    opponentId: string,
    challengeType: EChallengePopup,
    username?: string,
    gameId?: string
  }) {
    const { context, opponentId, challengeType, username, gameId } = params;
    super(context, challengePopupCoordinates.x, challengePopupCoordinates.y);

    // Used to block the user from clicking on some other part of the game
    this.blockingLayer = context.add.rectangle(0, 0, 2000, 2000, 0x000000, 0.001) // Almost invisible
      .setOrigin(0.5)
      .setInteractive();

    this.backgroundImage = context.add.image(0, 0, 'popupBackground').setDisplaySize(500, 300);
    this.councilButtonImage = context.add.image(-150, 60, EFaction.COUNCIL).setScale(0.4).setInteractive({ useHandCursor: true });
    this.elvesButtonImage = context.add.image(-10, 60, EFaction.DARK_ELVES).setScale(0.4).setInteractive({ useHandCursor: true });
    this.cancelButtonImage = context.add.image(130, 60, 'popupButton').setTint(0x990000).setDisplaySize(110, 60).setInteractive({ useHandCursor: true });

    const popupString = challengeType === EChallengePopup.SEND ?  `Pick a faction to challenge ${truncateText(username!, 20)}` : 'Pick a faction to accept the challenge';
    this.popupText = context.add.text(0, -50, popupString, {
      fontFamily: "proLight",
      fontSize: 40,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
      wordWrap: {
        width: 400,
        useAdvancedWrap: true
      }
    }).setOrigin(0.5);

    this.cancelButtonText = context.add.text(130, 60, "BACK", {
      fontFamily: "proLight",
      fontSize: 30,
      color: '#ffffff'
    }).setOrigin(0.5);

    const buttonCallback = async (faction: EFaction) => {
      this.setVisible(false);
      if (challengeType === EChallengePopup.SEND) await newGameChallenge(context.userId, faction, opponentId);

      if (challengeType === EChallengePopup.ACCEPT && context instanceof UIScene) sendChallengeAcceptedMessage(context.lobbyRoom!, gameId!, context.userId, faction);
    };

    this.councilButtonImage.on('pointerdown', async () => await buttonCallback(EFaction.COUNCIL));

    this.elvesButtonImage.on('pointerdown', async () => await buttonCallback(EFaction.DARK_ELVES));

    this.cancelButtonImage.on('pointerdown', () => {
      this.setVisible(false);
      this.destroy();
    });
    this.add([
      this.blockingLayer,
      this.backgroundImage,
      this.popupText,
      this.councilButtonImage,
      this.elvesButtonImage,
      this.cancelButtonImage,
      this.cancelButtonText
    ]);
    this.setDepth(1002);

    context.add.existing(this);
  }
}