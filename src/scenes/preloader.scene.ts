import { EFaction } from "../enums/gameEnums";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameAssets } from "./mainMenuUtils/gameAssets";
import { profilePicNames } from "./profileSceneUtils/profilePicNames";

// PreloaderScene.ts
export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    // load loading image
    this.load.image('loadingScreen', '/assets/ui/loading.png');
    this.load.once('filecomplete-image-loadingScreen', () => {
      this.add.image(0, 0, 'loadingScreen').setOrigin(0).setScale(1.4);
      this.loadRestOfAssets();
    });

    this.load.start();
  }

  loadRestOfAssets() {
    // login form
    this.load.html('loginForm', 'html/loginForm.html');
    this.load.html('signUpForm', 'html/signUpForm.html');

    // menu images
    this.load.image('uiBackground', '/assets/ui/game_screen.png');
    this.load.image('mainMenuImage', '/assets/ui/main_menu_image.png');
    this.load.image('mainMenuBottom', '/assets/ui/main_menu_bottom.jpg');
    this.load.image('playButton', '/assets/ui/play_button.png');
    this.load.image('mainMenuButton', '/assets/ui/main_menu_button.png');

    // profile pictures
    profilePicNames.forEach(name => {
      this.load.image(name, `/assets/images/profilePics/${name}.jpg`);
    });

    // fonts
    this.load.font('proHeavy', '/assets/fonts/BlambotFXProHeavyLowerCapsBB.ttf', 'truetype');
    this.load.font('proLight', '/assets/fonts/BlambotFXProLightBB.ttf', 'truetype');

    // popups
    this.load.image('popupBackground', '/assets/images/gameItems/popup_button.png');
    this.load.image('popupButton', '/assets/images/gameItems/ColorSwatch_Color-hd.png');

    // background images
    this.load.image('gameBackground', '/assets/ui/create_game.png');

    // faction emblems
    this.load.image(EFaction.COUNCIL, '/assets/ui/council_emblem.png');
    this.load.image(EFaction.DARK_ELVES, '/assets/ui/elves_emblem.png');

    // game assets
    loadGameAssets(this);

    // game board ui
    loadGameBoardUI(this);

    // game ui
    this.load.image('gameListButton', '/assets/ui/game_list_premade.png');
    this.load.image('newGameButton', '/assets/ui/new_game_btn.png');
    this.load.image('unknownFaction', '/assets/ui/unknown_faction.png');
    this.load.image('unknownOpponent', '/assets/images/profilePics/unknownAvatar-hd.jpg');
    this.load.image('closeButton', '/assets/ui/close_button.png');
  }

  create(): void {
    // Move to main scene after loading
    this.scene.start('MainMenuScene');
  }
}
