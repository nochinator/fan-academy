import Phaser from 'phaser';
import UIScene from './scenes/ui.scene';
import MainMenuScene from './scenes/mainMenu.scene';
import GameScene from './scenes/game.scene';
import LeaderboardScene from './scenes/leaderboard.scene';
import ProfileScene from './scenes/profile.scene';
import PreloaderScene from './scenes/preloader.scene';

const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#808080',
  type: Phaser.AUTO, // webgl is browser supports it, fallback to canvas
  scene: [PreloaderScene, MainMenuScene, UIScene, GameScene, LeaderboardScene, ProfileScene],
  scale: {
    mode: Phaser.Scale.FIT, // Automatically resize the canvas on window resize
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the canvas
    orientation: Phaser.Scale.LANDSCAPE
  },
  dom: { createContainer: true },
  parent: 'app'

};

// Create a new game
export const game = new Phaser.Game(config);
