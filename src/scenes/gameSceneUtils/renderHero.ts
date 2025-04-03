import { EFaction } from "../../enums/gameEnums";
import { IHero } from "../../interfaces/gameInterface";
import GameScene from "../game.scene";

export function renderHero(context: GameScene, hero: IHero): void {
  const heroCoordinates = context.centerPoints[hero.boardPosition];

  // Create the unit's image and images for its upgrades
  const character = context.add.image(0, -10, hero.unitType).setOrigin(0.5).setDepth(10).setName('body');

  const runeMetal = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setDepth(10).setName('runeMetal');
  if (!hero.runeMetal) runeMetal.setVisible(false);

  const shiningHelm = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setDepth(10).setName('shiningHelm');
  if (!hero.shiningHelm) shiningHelm.setVisible(false);

  let factionBuff;
  if (hero.faction === EFaction.COUNCIL) {
    factionBuff = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setDepth(10).setName('dragonScale');
  } else {
    factionBuff = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.3).setDepth(10).setName('soulStone');
  } // Using else here removes a bunch of checks on factionBuff being possibly undefined
  if (!hero.factionBuff) factionBuff.setVisible(false);

  // Add all images into a container
  const characterContainer = context.add.container(heroCoordinates.x, heroCoordinates.y, [character, runeMetal, factionBuff, shiningHelm]).setSize(50, 50).setInteractive().setName(hero.unitId);

  // Making the hero not visible if it's in the deck (board position 51)
  if (hero.boardPosition === 51) {
    characterContainer.setVisible(false);
  }

  // TODO: add functions for attacking, moving etc if the character is on the board. Will this be updated as the character is moved?
  // Probably better to add flags as properties in the class: draggable, interactive, etc...

  // REVIEW: create a dragable events function that we can add to all units. I think if setDraggable is unset we can leave the actual listeners since they won't be triggered (less code activiate / deactivate when is not the player's turn)
}