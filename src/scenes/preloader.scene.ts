import { EFaction } from "../enums/gameEnums";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameAssets } from "./mainMenuUtils/gameAssets";
import { profilePicNames } from "./profileSceneUtils/profilePicNames";

// CDN path
export const CDN_PATH = 'https://cdn.jsdelivr.net/gh/Dan-DH/fa-assets@3a9b192';

// PreloaderScene.ts
export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    // load loading image
    this.load.image('loadingScreen', `${CDN_PATH}/ui/loading.webp`);
    this.load.once('filecomplete-image-loadingScreen', () => {
      this.add.image(0, 0, 'loadingScreen').setOrigin(0).setScale(2.8);
      this.loadRestOfAssets();
    });

    this.load.start();
  }

  loadRestOfAssets() {
    // login form
    this.load.html('loginForm', 'html/loginForm.html');
    this.load.html('signUpForm', 'html/signUpForm.html');

    // menu images
    this.load.image('uiBackground', `${CDN_PATH}/ui/game_screen.webp`);
    this.load.image('mainMenuImage', `${CDN_PATH}/ui/main_menu_image.webp`);
    this.load.image('mainMenuBottom', `${CDN_PATH}/ui/main_menu_bottom.webp`);
    this.load.image('playButton', `${CDN_PATH}/ui/play_button.webp`);
    this.load.image('mainMenuButton', `${CDN_PATH}/ui/main_menu_button.webp`);

    // profile pictures
    profilePicNames.forEach(name => {
      this.load.image(name, `${CDN_PATH}/images/profilePics/${name}.webp`);
    });

    // fonts
    this.load.font('proHeavy', '/fonts/BlambotFXProHeavyLowerCapsBB.woff', 'truetype');
    this.load.font('proLight', '/fonts/BlambotFXProLightBB.woff', 'truetype');

    // popups
    this.load.image('popupBackground', `${CDN_PATH}/images/gameItems/popup_button.webp`);
    this.load.image('popupButton', `${CDN_PATH}/images/gameItems/ColorSwatch_Color-hd.webp`);

    // background images
    this.load.image('gameBackground', `${CDN_PATH}/ui/create_game.webp`);

    // faction emblems
    this.load.image(EFaction.COUNCIL, `${CDN_PATH}/ui/council_emblem.webp`);
    this.load.image(EFaction.DARK_ELVES, `${CDN_PATH}/ui/elves_emblem.webp`);

    // game assets
    loadGameAssets(this);

    // game board ui
    loadGameBoardUI(this);

    // game ui
    this.load.image('gameListButton', `${CDN_PATH}/ui/game_list_premade.webp`);
    this.load.image('newGameButton', `${CDN_PATH}/ui/new_game_btn.webp`);
    this.load.image('unknownFaction', `${CDN_PATH}/ui/unknown_faction.webp`);
    this.load.image('unknownOpponent', `${CDN_PATH}/images/profilePics/unknownAvatar-hd.webp`);
    this.load.image('closeButton', `${CDN_PATH}/ui/close_button.webp`);
  }

  create(): void {
    // Move to main scene after loading
    this.scene.start('MainMenuScene');
  }
}
