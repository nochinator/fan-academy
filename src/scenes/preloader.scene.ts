export const CDN_PATH = 'https://cdn.jsdelivr.net/gh/nochinator/sa-assets@58bee66d21c333c39eb001e86482163f849725f1';

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
  }

  loadRestOfAssets() {
    // fonts
    this.load.font('proHeavy', '/fan-academy/fonts/BlambotFXProHeavyLowerCapsBB.woff', 'truetype');
    this.load.font('proLight', '/fan-academy/fonts/BlambotFXProLightBB.woff', 'truetype');

    // popups
    this.load.image('popupBackground', `${CDN_PATH}/images/gameItems/popup_button.webp`);
    this.load.image('popupButton', `${CDN_PATH}/images/gameItems/ColorSwatch_Color-hd.webp`);

    // background image
    this.load.image('gameBackground', `${CDN_PATH}/ui/create_game.webp`);
  }

  create(): void {
    // Move to main scene after loading
    this.scene.start('MainMenuScene');
  }
}
