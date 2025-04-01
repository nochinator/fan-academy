import { IUnit } from "../../interfaces/gameInterface";
import { calculateClosestSquare } from "../../utils/boardCalculations";
import GameScene from "../game.scene";

export function renderCharacter(context: GameScene, char: IUnit): void {
  const unitCoordinates = context.centerPoints[char.boardPosition];

  // Create the unit's image and images for its upgrades
  const character = context.add.image(0, -10, char.unitType).setOrigin(0.5).setDepth(10);

  const runeMetal = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setDepth(10);
  if (!char.runeMetal) runeMetal.setVisible(false);

  const dragonScale = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setDepth(10);
  if (!char.dragonScale) dragonScale.setVisible(false);

  const shiningHelm = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setDepth(10);
  if (!char.shiningHelm) shiningHelm.setVisible(false);

  // Add all images into a container
  const characterContainer = context.add.container(unitCoordinates.x, unitCoordinates.y, [character, runeMetal, dragonScale, shiningHelm]).setSize(50, 50).setInteractive();

  // Listeners for dragging the unit if it's on the player's hand
  if (char.boardPosition > 44 && char.boardPosition < 51) {
    console.log('Character boardposition is -> ', char.boardPosition);
    context.input.setDraggable(characterContainer);

    characterContainer.on('drag', (_: any, dragX: number, dragY: number) => {
      characterContainer.x = dragX;
      characterContainer.y = dragY;
    });

    characterContainer.on('dragend', (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const boardPosition = calculateClosestSquare(context.centerPoints, {
        x: dragX,
        y: dragY
      });

      character.x = boardPosition.x;
      character.y = boardPosition.y;
    });
  }

  // Making the unit not visible if it's in the deck (board position 51)
  if (char.boardPosition === 51) {
    characterContainer.setVisible(false);
  }

  // TODO: add functions for attacking, moving etc if the character is on the board. Will this be updated as the character is moved?
  // Probably better to add flags as properties in the class: draggable, interactive, etc...

  // REVIEW: create a dragable events function that we can add to all units. I think if setDraggable is unset we can leave the actual listeners since they won't be triggered (less code activiate / deactivate when is not the player's turn)
}