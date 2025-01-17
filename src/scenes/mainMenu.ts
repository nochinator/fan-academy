import createMainMenuButton from "../lib/buttons";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  init() {}

  preload() {
    // images
    const imagesPath = '/assets/ui/used/';
    this.load.image('mainMenuBg', imagesPath + 'game_screen.png');
    this.load.image('mainMenuImage', imagesPath + 'main_menu_image.png');
    this.load.image('mainMenuBottom', imagesPath + 'main_menu_bottom.jpg');
    this.load.image('playButton', imagesPath + 'play_button.png');
    this.load.image('mainMenuButton', imagesPath + 'main_menu_button.png');

    // fonts
    this.load.font('proHeavy', '/assets/fonts/BlambotFXProHeavyLowerCapsBB.ttf', 'truetype');
    this.load.font('proLight', '/assets/fonts/BlambotFXProLightBB.ttf', 'truetype');
  }

  create() {
    // background image
    const bg = this.add.image(0, 0, 'mainMenuBg').setOrigin (0);

    // main menu image
    const menuIgm = this.add.image(0, 0, 'mainMenuImage').setOrigin (0);
    menuIgm.x = bg.width - menuIgm.width - 14;
    menuIgm.y += 14;

    // main menu bottom strip
    const menuBottomImage = this.add.image(0, 0, 'mainMenuBottom').setOrigin(0);
    const menuBottomText = this.add.text(0.5, 0.5, 'Welcome to the Hero Academy!', {
      font: '50px proLight',
      color: '#873600' 
    }).setOrigin(-0.4, -1.3);
    const menuBottomContainer = this.add.container(bg.width - menuBottomImage.width - 14, bg.height - menuBottomImage.height - 14, [menuBottomImage, menuBottomText]);

    // main menu buttons
    const menuButtonHeight = this.textures.get('mainMenuButton').getSourceImage().height;
    const menuButtonX =  200;

    const profileButton = createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: 275,
      imageKey: 'mainMenuButton',
      text: 'Profile',
      font: '70px proHeavy'
    });
    const leaderboardsButton = createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: menuButtonHeight + 299,
      imageKey: 'mainMenuButton',
      text: 'Leaderboard',
      font: '70px proHeavy'
    });
    const aboutButton = createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: menuButtonHeight * 2 + 323,
      imageKey: 'mainMenuButton',
      text: 'About',
      font: '70px proHeavy'
    }); // TODO: add callbacks

    const playButton = createMainMenuButton({
      thisParam: this,
      x: 200,
      y: 140,
      imageKey: 'playButton',
      text: 'Play!',
      font: '130px proHeavy'
    });
  }
}
