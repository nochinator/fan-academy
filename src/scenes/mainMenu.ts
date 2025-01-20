import createMainMenuButton from "../lib/buttons";
import { loginQuery, signUpQuery } from "../queries/userQueries";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  init() {}

  preload() {
    // login form
    this.load.html('loginForm', '../src/html/loginForm.html'); // Paths are relative form the public folder
    this.load.html('signUpForm', '../src/html/signUpForm.html');
    // TODO: play and profile need to be disabled until login. Leaderboard and about should be available. Coming back home should show the login form again
    // TODO: add middleware check

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
    // Login form
    const loginForm = this.createSignUpAndLoginForms();

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
      font: '130px proHeavy',
      callback: () => { this.scene.start('GameScene');}
    });

    // TODO: Remove after testing
    // this.time.addEvent({
    //   delay: 0,
    //   loop: false,
    //   callback: () => { this.scene.start('GameScene');}
    // });
  }

  /*
  HELPER FUNCTIONS
  */
  createSignUpAndLoginForms() {
    // Login form
    const loginForm = this.add.dom(800, 400).createFromCache('loginForm');
    // Get references to the form elements
    const loginUsernameInput: Element | null = loginForm.getChildByID('username');
    const loginPasswordInput: Element | null = loginForm.getChildByID('password');
    const loginButton: Element | null = loginForm.getChildByID('loginButton');
    const linkToSignUp: Element | null = loginForm.getChildByID('linkToSignUp');
    loginForm.setVisible(true);
    // Login query
    loginButton?.addEventListener('click', async () => {
      // @ts-expect-error: lol // FIXME: add type
      if (loginUsernameInput?.value && loginPasswordInput?.value) await loginQuery(loginUsernameInput.value, loginPasswordInput.value);
    });
    // Login form, link to sign up form
    linkToSignUp?.addEventListener('click', async () => {
      signUpForm.setVisible(true);
      loginForm.setVisible(false);
    });

    // Sign up form
    const signUpForm = this.add.dom(800, 400).createFromCache('signUpForm');
    // Get references to the form elements
    const signUpEmailInput: Element | null = signUpForm.getChildByID('email');
    const signUpUsernameInput: Element | null = signUpForm.getChildByID('username');
    const signUpPasswordInput: Element | null = signUpForm.getChildByID('password');
    const signUpButton: Element | null = signUpForm.getChildByID('loginButton');
    const linkToLogin: Element | null = signUpForm.getChildByID('linkToLogin');
    signUpForm.setVisible(false);

    // Sign up query
    signUpButton?.addEventListener('click', async () => {
      // @ts-expect-error: lol // FIXME: add type
      if (signUpUsernameInput?.value && signUpPasswordInput?.value) await signUpQuery(signUpEmailInput.value, signUpUsernameInput.value, signUpPasswordInput.value);
    });
    // Sign up form, link to login form
    linkToLogin?.addEventListener('click', async () => {
      signUpForm.setVisible(false);
      loginForm.setVisible(true);
    });
  }
}
