import ProfileScene from "../profile.scene";

export async function loadProfileUI(context: ProfileScene): Promise<void> {
  context.load.image('gameBackground', '/assets/ui/create_game.png');

  context.load.image('saveButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

  // Popup images
  context.load.image('popupBackground', '/assets/images/gameItems/NextGameButton-hd.png');
  context.load.image('popupButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');
}