
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  init() {}

  preload() {
    this.load.font('proHeavy', '/assets/fonts/BlambotFXProHeavyLowerCapsBB.ttf', 'truetype');
    this.load.font('proLight', '/assets/fonts/BlambotFXProLightBB.tff', 'truetype');
  }

  create() {
    this.add.text(0, 0, 'Welcome to Hero Academy', {
      fontSize: 200,
      color: '#B00B69',
      fontFamily: 'proHeavy'
    });
    this.time.addEvent({
      delay: 3000,
      loop: false,
      callback: () => { this.scene.start('MainMenuScene');}
    });
  }
}
