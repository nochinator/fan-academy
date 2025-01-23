import Phaser from 'phaser';
import GameScene from './scenes/game.scene';
import MainMenuScene from './scenes/mainMenu.scene';
import BootScene from './scenes/loading.scene';

const config = {
  // width: 1433,
  // height: 1014,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#808080',
  type: Phaser.AUTO, // webgl is browser supports it, fallback to canvas
  scene: [ MainMenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT, // Automatically resize the canvas on window resize
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the canvas
    // orientation: Phaser.Scale.LANDSCAPE
  },
  dom: { createContainer: true },
  parent: 'app'

};

// Create a new game
export const game = new Phaser.Game(config);
