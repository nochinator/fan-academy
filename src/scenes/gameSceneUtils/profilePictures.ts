import UIScene from "../ui.scene";

export async function loadProfilePictures(context: UIScene): Promise<void> {
  if (!context.gameList) return;

  const allPlayerObjects: {
    username: string,
    picture: string
  }[] = [];

  context.gameList.forEach((game) => {
    const oponent  = game.players.find(player => player.userData._id !== context.userId);

    if (oponent) allPlayerObjects.push({
      username: oponent.userData.username,
      picture: oponent.userData.picture
    });
  });

  // Remove duplicates
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

  return new Promise((resolve) => {
    context.load.once('complete', () => {
      resolve();
    });
    context.load.start(); // Start loading after setting up the event listener
  });
}