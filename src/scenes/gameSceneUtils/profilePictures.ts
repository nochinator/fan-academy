import UIScene from "../ui.scene";

export async function loadProfilePictures(context: UIScene): Promise<void> {
  if (!context.gameList) return;

  console.log('GameList', context.gameList);

  const allPlayerObjects: {
    username: string,
    picture: string
  }[] = [];

  context.gameList.forEach((game) => {
    const oponent  = game.players.find(player => player.userData._id !== context.userId);

    console.log('oponent', oponent);
    console.log('oponent', oponent?.userData.username);

    if (oponent) allPlayerObjects.push({
      username: oponent.userData.username,
      picture: oponent.userData.picture
    });
  });

  console.log('allPlayerObjects', allPlayerObjects);

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

  console.log('allPlayerObjects2', allPlayerObjects);

  console.log('uniqueOponents', uniqueOponents);

  uniqueOponents.forEach( oponent => {
    console.log(oponent);
    context.load.image(oponent.username, oponent.picture);
  });

  return new Promise((resolve) => {
    context.load.once('complete', () => {
      console.log('Profile pictures loaded');
      resolve();
    });
    context.load.start(); // Start loading after setting up the event listener
  });
}