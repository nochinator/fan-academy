import GameScene from "../game.scene";

export function loadGameAssets(context: GameScene) {
  // Loading units
  const councilArray = ['archer', 'cleric', 'fighter', 'ninja', 'wizard'];
  const darkElvesArray = ['heretic', 'impaler', 'necro', 'phantom', 'voidmonk', 'wraith'];

  // TODO: a check should be made to see if both factions are needed
  councilArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/council/${asset}.png`);
  });
  darkElvesArray.forEach( asset => { context.load.image(asset, `/assets/images/factions/darkElves/${asset}.png`);
  });

  // Equipment icons
  context.load.image('runeMetal', './assets/images/factions/common/rune_metal.png');
  context.load.image('dragonScale', './assets/images/factions/common/dragon_scale.png');
  context.load.image('shiningHelm', './assets/images/factions/common/shining_helm.png');

  // test // REVIEW:
  // const character = this.add.image(0, -10, 'impaler').setOrigin(0.5).setDepth(10);
  // const runeMetal = this.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setDepth(10);
  // const dragonScale = this.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setDepth(10);
  // const shiningHelm = this.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setDepth(10);

  // const impaler = this.add.container(centerPoints[0].x, centerPoints[0].y, [character, runeMetal, dragonScale, shiningHelm]).setSize(50, 50).setInteractive();

  // this.input.setDraggable(impaler);

  // impaler.on('drag', (_: any, dragX: number, dragY: number) => {
  //   impaler.x = dragX;
  //   impaler.y = dragY;
  // });

  // impaler.on('dragend', (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
  //   impaler.x = 500;
  //   impaler.y = 180;
  // });
  // this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
  //   // Log the mouse coordinates
  //   console.log(`Mouse coordinates: x=${pointer.x}, y=${pointer.y}`);
  // });

  // impaler.x = centerPoints[0].x;
  // impaler.y = centerPoints[0].y;
}