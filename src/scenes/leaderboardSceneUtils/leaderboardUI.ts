import { ChallengePopup } from "../../classes/challengePopup";
import { EChallengePopup, EFaction } from "../../enums/gameEnums";
import { IUserStats } from "../../interfaces/userInterface";
import { truncateText } from "../../utils/gameUtils";
import LeaderboardScene from "../leaderboard.scene";

export function loadLeaderboardUI(context: LeaderboardScene): void {
  context.load.image('gameBackground', '/assets/ui/used/create_game.png');
  context.load.image('challengeIcon', '/assets/images/gameItems/card/TooltipIcon_PhysDmg-hd.png');

  context.load.image('popupBackground', '/assets/images/gameItems/NextGameButton-hd.png');
  context.load.image('popupButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

  context.load.image(EFaction.COUNCIL, '/assets/ui/used/council_emblem.png');
  context.load.image(EFaction.DARK_ELVES, '/assets/ui/used/elves_emblem.png');
}

export function createLeaderboard(context: LeaderboardScene, data: {
  _id: string,
  username: string,
  picture: string,
  stats: IUserStats
}[]): void {
  const startingCoords = {
    x: 350,
    y: 50
  };

  const style = {
    fontFamily: "proLight",
    color: '#ffffff',
    wordWrap: {
      width: 190,
      useAdvancedWrap: true
    }
  };
  const bigStyle = {
    ...style,
    fontSize: 45
  };
  const smallStyle  = {
    ...style,
    fontSize: 35
  };

  const header = context.add.container(startingCoords.x, startingCoords.y);

  const usernameText = context.add.text(100, 0, 'Username', bigStyle);
  const totalGames = context.add.text(320, 0, `Games`, bigStyle);
  const totalWins = context.add.text(520, 0, `Wins`, bigStyle);
  const councilWins = context.add.text(720, 0, `Council`, bigStyle);
  const elvesWins = context.add.text(920, 0, `Elves`, bigStyle);

  header.add([usernameText, totalGames, totalWins, councilWins, elvesWins]);

  startingCoords.y += 20;

  data.forEach(player => {
    startingCoords.y += 50;
    const row = context.add.container(startingCoords.x, startingCoords.y);

    const usernameText = context.add.text(100, 0, truncateText(player.username, 13), smallStyle);
    const totalGames = context.add.text(350, 0, `${player.stats.totalGames}`, smallStyle);
    const totalWins = context.add.text(550, 0, `${player.stats.totalWins}`, smallStyle);
    const councilWins = context.add.text(750, 0, `${player.stats.councilWins}`, smallStyle);
    const elvesWins = context.add.text(950, 0, `${player.stats.elvesWins}`, smallStyle);

    const challengeIcon = context.add.image(1030, 15, 'challengeIcon').setInteractive();

    challengeIcon.on('pointerdown', () => {
      console.log('Clicked on challenge icon');
      new ChallengePopup({
        context,
        username: player.username,
        challengeType: EChallengePopup.SEND,
        opponentId: player._id 
      });
    });

    if (player._id === context.userId) challengeIcon.setVisible(false).disableInteractive();

    row.add([usernameText, totalGames, totalWins, councilWins, elvesWins, challengeIcon]);
  });
};