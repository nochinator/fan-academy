export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  init() {}

  preload() {
    this.loadImages();
  }

  loadImages() {
    this.load.image('background_image', '../assets/images/bg_desk.png' );
  }

  create() {
    this.add.image(0, 0, 'background_image').setOrigin(0, 0); // Might be a better way of writing this. Can also use setPosition()
  }
}