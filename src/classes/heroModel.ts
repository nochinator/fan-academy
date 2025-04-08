import { EFaction } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { makeClickable } from "../utils/setActiveUnit";
import { Hero } from "./hero";

export class HeroModel extends Phaser.GameObjects.Container {
  hero: Hero;

  private character: Phaser.GameObjects.Image;
  private runeMetal: Phaser.GameObjects.Image;
  private shiningHelm: Phaser.GameObjects.Image;
  private factionBuff: Phaser.GameObjects.Image;

  constructor(context: GameScene, hero: Hero) {
    const { x, y } = context.centerPoints[hero.boardPosition];
    super(context, x, y);
    this.hero = hero;

    // Create the unit's image and images for its upgrades
    this.character = context.add.image(0, -10, this.hero.unitType).setOrigin(0.5).setDepth(10).setName('body');

    this.runeMetal = context.add.image(33, 25, 'runeMetal').setOrigin(0.5).setScale(0.3).setDepth(10).setName('runeMetal');
    if (!this.hero.runeMetal) this.runeMetal.setVisible(false);

    this.shiningHelm = context.add.image(-28, 25, 'shiningHelm').setOrigin(0.5).setScale(0.3).setDepth(10).setName('shiningHelm');
    if (!this.hero.shiningHelm) this.shiningHelm.setVisible(false);

    if (this.hero.faction === EFaction.COUNCIL) {
      this.factionBuff = context.add.image(5, 25, 'dragonScale').setOrigin(0.5).setScale(0.3).setDepth(10).setName('dragonScale');
    } else {
      this.factionBuff = context.add.image(5, 25, 'soulStone').setOrigin(0.5).setScale(0.3).setDepth(10).setName('soulStone');
    } // Using else here removes a bunch of checks on factionBuff being possibly undefined
    if (!this.hero.factionBuff) this.factionBuff.setVisible(false);

    this.add([this.character, this.runeMetal, this.factionBuff, this.shiningHelm]).setSize(50, 50).setInteractive().setName(this.hero.unitId);

    if (this.hero.boardPosition === 51) this.setVisible(false);

    // makeClickable(this, this.hero, context); // FIXME: this works but doesn't have the logic to do the checks

    context.add.existing(this);
  }
}
