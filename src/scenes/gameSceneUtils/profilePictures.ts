import { IGame } from "../../interfaces/gameInterface";
import GameScene from "../game.scene";

export async function loadProfilePictures(context: GameScene, gameList: IGame[]): Promise<void> {
  const allPlayerObjects: {
    username: string,
    picture: string
  }[] = [];

  gameList.forEach((game) => {
    const oponent  = game.players.find(player => player.playerId != context.userId);

    if (oponent) allPlayerObjects.push({
      username: oponent.username,
      picture: oponent.picture
    });
  });

  // remove duplicates
  const uniqueOponents: {
    username: string,
    picture: string
  }[] = Array.from(
    allPlayerObjects.reduce((map, oponent) => map.set(oponent.username, oponent), new Map<string, {
      username: string,
      picture: string
    }>()).values()
  );

  uniqueOponents.forEach( oponent => {
    context.load.image(oponent.username, oponent.picture);
  });

  context.load.start();

  context.load.on('complete', () => {
    console.log('Profile pictures loaded');
  });
}