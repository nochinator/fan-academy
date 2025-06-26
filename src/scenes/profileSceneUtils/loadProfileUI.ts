import ProfileScene from "../profile.scene";
import { profilePicNames } from "./profilePicNames";

export async function loadProfileUI(context: ProfileScene): Promise<void> {
  context.load.image('gameBackground', '/assets/ui/used/create_game.png');

  context.load.image('saveButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

  profilePicNames.forEach(name => {
    const keyword = name.slice(0, name.length - 4);
    context.load.image(keyword, `/assets/images/profilePics/${name}`);
  });

  return new Promise((resolve) => {
    context.load.once('complete', () => {
      resolve();
    });
    context.load.start(); // Start loading after setting up the event listener
  });
}