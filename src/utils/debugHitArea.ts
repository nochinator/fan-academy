import GameScene from "../scenes/game.scene";

export function debugHitArea(context: GameScene, container: Phaser.GameObjects.Container, color = 0xffff00) {
  const graphic = context.add.graphics();
  const area = container.input!.hitArea;

  graphic.lineStyle(2, color, 1);
  graphic.strokeRect(
    container.x - area.width / 2,
    container.y - area.height / 2,
    area.width,
    area.height
  );

  // const g = context.add.graphics({
  //   x: 0,
  //   y: 0
  // });
  // g.lineStyle(2, color, 1);

  // // Account for container origin (default is 0, but good practice)
  // const originX = container.originX ?? 0;
  // const originY = container.originY ?? 0;

  // const width = container.input?.hitArea?.width || container.width;
  // const height = container.input?.hitArea?.height || container.height;

  // const x = container.x - width * originX;
  // const y = container.y - height * originY;

  // g.strokeRect(x, y, width, height);
}
