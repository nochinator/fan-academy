import createMainMenuButton from "./mainMenuUtils/buttons";
import { authCheck, loginQuery, signUpQuery } from "../queries/userQueries";
import { isValidPassword } from "../utils/playerUtils";

export default class MainMenuScene extends Phaser.Scene {
  userId: string | undefined;
  gameList: string | undefined;

  currentSubScene: string | undefined;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  init() {
  }

  preload() {
    // login form
    this.load.html('loginForm', 'html/loginForm.html');
    this.load.html('signUpForm', 'html/signUpForm.html');

    // images
    const imagesPath = '/assets/ui/';
    this.load.image('mainMenuBg', imagesPath + 'game_screen.png');
    this.load.image('mainMenuImage', imagesPath + 'main_menu_image.png');
    this.load.image('mainMenuImageLoggedIn', imagesPath + 'main_menu_logged.png');
    this.load.image('mainMenuBottom', imagesPath + 'main_menu_bottom.jpg');
    this.load.image('playButton', imagesPath + 'play_button.png');
    this.load.image('mainMenuButton', imagesPath + 'main_menu_button.png');

    // fonts
    this.load.font('proHeavy', '/assets/fonts/BlambotFXProHeavyLowerCapsBB.ttf', 'truetype');
    this.load.font('proLight', '/assets/fonts/BlambotFXProLightBB.ttf', 'truetype');
  }

  async create() {
    // Auth check
    this.userId = await authCheck();

    // Background image
    const bg = this.add.image(0, 0, 'mainMenuBg').setOrigin (0);
    // const menuIgm = isUserAuthenticated  this.add.image(0, 0, 'mainMenuImageLoggedIn').setOrigin (0) : this.add.image(0, 0, 'mainMenuImage').setOrigin (0);
    const menuImg = this.add.image(0, 0, 'mainMenuImage').setOrigin (0);
    menuImg.x = bg.width - menuImg.width - 14;
    menuImg.y += 14;

    // main menu bottom strip
    const menuBottomImage = this.add.image(0, 0, 'mainMenuBottom').setOrigin(0);
    const menuBottomText = this.add.text(0.5, 0.5, 'Welcome to the Hero Academy!', {
      font: '50px proLight',
      color: '#873600'
    }).setOrigin(-0.4, -1.3);
    // menuBottomContainer
    this.add.container(bg.width - menuBottomImage.width - 14, bg.height - menuBottomImage.height - 14, [menuBottomImage, menuBottomText]);

    // main menu buttons
    const menuButtonHeight = this.textures.get('mainMenuButton').getSourceImage().height;
    const menuButtonX =  200;

    // profileButton
    createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: 275,
      imageKey: 'mainMenuButton',
      text: 'Profile',
      font: '70px proHeavy',
      callback: () => {
        if (this.currentSubScene) this.scene.stop(this.currentSubScene);
        this.scene.launch('ProfileScene', { userId: this.userId });
        this.currentSubScene = 'ProfileScene';
      }
    });

    // leaderboardsButton
    createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: menuButtonHeight + 299,
      imageKey: 'mainMenuButton',
      text: 'Leaderboard',
      font: '70px proHeavy',
      callback: () => {
        if (this.currentSubScene) this.scene.stop(this.currentSubScene);
        this.scene.launch('LeaderboardScene', { userId: this.userId });
        this.currentSubScene = 'LeaderboardScene';
      }
    });

    // aboutButton
    createMainMenuButton({
      thisParam: this,
      x: menuButtonX,
      y: menuButtonHeight * 2 + 323,
      imageKey: 'mainMenuButton',
      text: 'About',
      font: '70px proHeavy'
    }); // TODO: add callbacks

    // playButton
    createMainMenuButton({
      thisParam: this,
      x: 200,
      y: 140,
      imageKey: 'playButton',
      text: 'Play!',
      font: '130px proHeavy',
      callback: () => {
        if (this.currentSubScene) this.scene.stop(this.currentSubScene);
        this.scene.start('UIScene', { userId: this.userId });
        this.currentSubScene = 'UIScene';
      }
    });

    // Login and sign up forms. Only show if user is not authenticated
    this.createSignUpAndLoginForms(this.userId);
  }

  /*
  HELPER FUNCTIONS
  */
  createSignUpAndLoginForms(userId: string | undefined): {
    loginForm: Phaser.GameObjects.DOMElement,
    signUpForm: Phaser.GameObjects.DOMElement
  } {
    const loginForm = this.add.dom(800, 400).createFromCache('loginForm');
    const signUpForm = this.add.dom(800, 400).createFromCache('signUpForm');
    signUpForm.setVisible(false);

    // Used to block the user from clicking on some other part of the game
    const blockingLayer = this.add.rectangle(0, 0, 2900, 2000, 0x000000, 0.001).setOrigin(0.5).setInteractive();

    // Login form elements
    const loginUsernameInput = loginForm.getChildByID('username') as HTMLInputElement;
    const loginPasswordInput = loginForm.getChildByID('password') as HTMLInputElement;
    const loginButton = loginForm.getChildByID('loginButton') as HTMLInputElement;
    const linkToSignUp = loginForm.getChildByID('linkToSignUp') as HTMLInputElement;
    const loginError = loginForm.getChildByID('loginError') as HTMLDivElement;

    // Sign up form elements
    const signUpEmailInput = signUpForm.getChildByID('email') as HTMLInputElement;
    const signUpUsernameInput = signUpForm.getChildByID('username') as HTMLInputElement;
    const signUpPasswordInput = signUpForm.getChildByID('password') as HTMLInputElement;
    const signUpPasswordConfirm = signUpForm.getChildByID('passwordConfirm') as HTMLInputElement;
    const signUpButton = signUpForm.getChildByID('signUpButton') as HTMLInputElement;
    const linkToLogin = signUpForm.getChildByID('linkToLogin') as HTMLInputElement;
    const signUpError = signUpForm.getChildByID('signUpError') as HTMLDivElement;

    const showFormError = (element: HTMLDivElement, message: string) => {
      element.innerText = message;
      element.style.display = 'block';
    };

    const hideFormError = (element: HTMLDivElement) => {
      element.innerText = '';
      element.style.display = 'none';
    };

    // Login button click
    loginButton.addEventListener('click', async () => {
      if (loginUsernameInput.value && loginPasswordInput.value) {
        const result = await loginQuery(loginUsernameInput.value, loginPasswordInput.value);
        if (result.success) {
          loginForm.setVisible(false);
          blockingLayer.setVisible(false);
          this.userId = result.user._id;
          console.log('UserId after login:', this.userId);
        }else {
          showFormError(loginError, result.error); // Show server error to user
        }
      }
    });

    // Sign up button click
    signUpButton.addEventListener('click', async () => {
      hideFormError(signUpError);

      if (signUpPasswordInput.value !== signUpPasswordConfirm.value) {
        showFormError(signUpError, 'Passwords do not match');
        return;
      };
      if (!isValidPassword(signUpPasswordInput.value)) {
        showFormError(signUpError, 'Password must be at least 8 characters long and contain a letter and a number');
        return;
      };

      if(signUpUsernameInput.value.length > 20) {
        showFormError(signUpError, 'Username must be 20 characters or shorter');
        return;
      }

      if (signUpEmailInput.value && signUpUsernameInput.value && signUpPasswordInput.value) {
        const result = await signUpQuery(signUpEmailInput.value, signUpUsernameInput.value, signUpPasswordInput.value);
        if (result.success) {
          signUpForm.setVisible(false);
          blockingLayer.setVisible(false);
          this.userId = result.user._id;
          console.log('UserId after sign up:', this.userId);
        } else {
          showFormError(signUpError, result.error); // Show server error to user
        }
      }
    });

    // Listeners for login in pressing Enter
    const addEnterKeyListener = (field: HTMLInputElement, button: HTMLInputElement ) => {
      field.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          button.click();
        }
      });
    };
    [loginUsernameInput, loginPasswordInput].forEach(field => addEnterKeyListener(field, loginButton));
    [signUpEmailInput, signUpUsernameInput, signUpPasswordInput, signUpPasswordConfirm].forEach(field => addEnterKeyListener(field, signUpButton));

    // Switch forms
    linkToSignUp.addEventListener('click', () => {
      loginForm.setVisible(false);
      signUpForm.setVisible(true);
    });

    linkToLogin.addEventListener('click', () => {
      signUpForm.setVisible(false);
      loginForm.setVisible(true);
    });

    // If already logged in
    if (userId) {
      loginForm.setVisible(false);
      signUpForm.setVisible(false);
      blockingLayer.setVisible(false);
    }

    return {
      loginForm,
      signUpForm
    };
  }
}
