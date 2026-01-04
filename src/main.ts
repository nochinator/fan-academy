import Phaser from 'phaser';
import UIScene from './scenes/ui.scene';
import MainMenuScene from './scenes/mainMenu.scene';
import GameScene from './scenes/game.scene';
import LeaderboardScene from './scenes/leaderboard.scene';
import ProfileScene from './scenes/profile.scene';
import PreloaderScene from './scenes/preloader.scene';
import AboutScene from './scenes/about.scene';

const config: Phaser.Types.Core.GameConfig = {
  backgroundColor: '#808080',
  type: Phaser.AUTO,
  scene: [PreloaderScene, MainMenuScene, UIScene, GameScene, LeaderboardScene, ProfileScene, AboutScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1434,
    height: 990
  },
  dom: { createContainer: true },
  parent: 'app',
};

// Create a new game
export const game = new Phaser.Game(config);
