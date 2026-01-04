import { EAttackType, EEffect, EUnitTypes } from "../enums/gameEnums";
import { IUnitData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { capitalize, getCardText, roundToFive } from "../utils/gameUtils";

export class UnitCard extends Phaser.GameObjects.Container {
  cardBackgroundImage: Phaser.GameObjects.Image;
  unitPictureImage: Phaser.GameObjects.Image;
  cardSeparatorImage: Phaser.GameObjects.Image;
  hpBackgroundImage: Phaser.GameObjects.Image;
  hpBarImage: Phaser.GameObjects.Image;
  attackTypeImage: Phaser.GameObjects.Image;
  magicalResistanceImage: Phaser.GameObjects.Image;
  physicalResistanceImage: Phaser.GameObjects.Image;
  movementRangeImage: Phaser.GameObjects.Image;
  attackRangeImage: Phaser.GameObjects.Image;
  movementSquareImages: Phaser.GameObjects.Image[];
  attackSquareImages: Phaser.GameObjects.Image[];
  hpIconImage: Phaser.GameObjects.Image;

  context: GameScene;
  attackType: EAttackType;
  unitType: EUnitTypes;

  currentHpText: Phaser.GameObjects.Text;
  powerText: Phaser.GameObjects.Text;
  magicalResistanceText: Phaser.GameObjects.Text;
  physicalResistanceText: Phaser.GameObjects.Text;
  cardFlavorText: Phaser.GameObjects.Text;
  cardTypeText: Phaser.GameObjects.Text;
  cardNameText: Phaser.GameObjects.Text;
  rangeText: Phaser.GameObjects.Text;

  constructor(context: GameScene, data: IUnitData & { currentPower: number }) {
    const cardY = data.boardPosition[0] === -1 ? -200 : 0;
    super(context, 0, cardY);
    this.context = context;
    this.attackType = data.attackType;
    this.unitType = data.type;

    // Background, unit image, name and type, and separator
    this.cardBackgroundImage = context.add.image(10, 10, 'cardBackground');
    this.unitPictureImage = context.add.image(-130, -140, `${data.type}CardPic`).setOrigin(0.5).setScale(0.4);
    this.cardSeparatorImage = context.add.image(50, -100, 'cardSeparator').setOrigin(0.5).setScale(1.3);

    const { cardText, cardType } = getCardText(data.type);
    this.cardNameText = this.context.add.text(55, -170, capitalize(data.type), {
      fontFamily: "proLight",
      fontSize: 50,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.cardTypeText = this.context.add.text(55, -130, capitalize(cardType), {
      fontFamily: "proLight",
      fontSize: 30,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Health
    this.hpBackgroundImage = context.add.image(-60, -60, 'hpBackground').setOrigin(0.5);
    this.hpBarImage = context.add.image(-118, -72, 'hpBar').setOrigin(0);
    this.setHealthBar(data.currentHealth, data.maxHealth);
    this.currentHpText = this.context.add.text(80, -60, `${data.currentHealth}/${data.maxHealth}`, {
      fontFamily: "proLight",
      fontSize: 35,
      color: data.maxHealth > data.baseHealth ? '#00FF00' : '#ffffff'
    }).setOrigin(0.5);
    this.hpIconImage = context.add.image(-150, -60, 'hpIcon').setOrigin(0.5);

    // Attack power
    const attackType: string = data.attackType === EAttackType.MAGICAL ? 'magicalDamage' : 'physicalDamage';
    this.attackTypeImage = context.add.image(-150, -15, attackType).setOrigin(0.5);

    this.powerText = this.context.add.text(-40, -15, `${data.currentPower} ${data.attackType}`, {
      fontFamily: "proLight",
      fontSize: 35,
      color: this.getTextColor(data.currentPower, data.currentPower)
    }).setOrigin(0.5);

    // Resistances
    this.magicalResistanceImage = context.add.image(40, 30, 'magicalResistance').setOrigin(0.5);
    this.magicalResistanceText = this.context.add.text(100, 30, `${data.magicalDamageResistance} %`, {
      fontFamily: "proLight",
      fontSize: 35,
      color: this.getTextColor(data.magicalDamageResistance, data.magicalDamageResistance)
    }).setOrigin(0.5);

    this.physicalResistanceImage = context.add.image(-150, 30, 'physicalResistance').setOrigin(0.5);
    this.physicalResistanceText = this.context.add.text(-85, 30, `${data.physicalDamageResistance} %`, {
      fontFamily: "proLight",
      fontSize: 35,
      color: this.getTextColor(data.physicalDamageResistance, data.physicalDamageResistance)
    }).setOrigin(0.5);

    // Range
    this.movementRangeImage = context.add.image(-10, 120, 'movementRange').setOrigin(0.5);

    this.attackRangeImage = context.add.image(-10, 80, 'attackRange').setOrigin(0.5);
    this.rangeText = this.context.add.text(-85, 90, 'Range:', {
      fontFamily: "proLight",
      fontSize: 30,
      color: "#ffffff"
    }).setOrigin(0.5);

    const createRangeIcons = (range: number, x: number, y: number, type: string): Phaser.GameObjects.Image[] => {
      const images: Phaser.GameObjects.Image[] = [];

      let xOffset = 0;

      for (let i = 1; i <= range; i++) {
        const image = context.add.image(x + xOffset, y, type).setOrigin(0.5);
        images.push(image);

        xOffset += 25;
      }

      return images;
    };

    this.movementSquareImages = createRangeIcons(data.movement, 20, 120, 'movementSquare');
    this.attackSquareImages = createRangeIcons(data.attackRange, 20, 80, 'attackSquare');

    // Flavour text
    this.cardFlavorText = this.context.add.text(0, 180, cardText, {
      fontFamily: "proLight",
      fontSize: 25,
      color: '#ffffff',
      wordWrap: {
        width: this.cardBackgroundImage.width - 50,
        useAdvancedWrap: true
      }
    }).setOrigin(0.5);

    this.add([
      this.cardBackgroundImage,
      this.unitPictureImage,
      this.cardSeparatorImage,
      this.hpBackgroundImage,
      this.hpBarImage,
      this.attackTypeImage,
      this.magicalResistanceImage,
      this.physicalResistanceImage,
      this.movementRangeImage,
      this.attackRangeImage,
      this.hpIconImage,
      this.currentHpText,
      this.cardFlavorText,
      this.cardTypeText,
      this.cardNameText,
      this.powerText,
      this.physicalResistanceText,
      this.magicalResistanceText,
      this.rangeText,
      ...this.movementSquareImages,
      ...this.attackSquareImages
    ]);
  }

  getTextColor(currentNumber: number, baseNumber: number): string {
    return currentNumber > baseNumber ? '#00FF00' : currentNumber < baseNumber ? '#ff0000' : '#ffffff';
  }

  updateCardData(data: IUnitData & { currentPower: number }): void {
    this.updateCardPower(data);
    this.updateCardPhysicalResistance(data);
    this.updateCardMagicalResistance(data);
    this.updateCardHealth(data);
  }

  updateCardPower(data: IUnitData & { currentPower: number }): void {
    const totalPow = data.currentPower; // Use currentPower from data
    this.powerText.setText(`${roundToFive(totalPow)} ${this.attackType}`);

    const basePower = data.type === EUnitTypes.WRAITH ? 250 : data.currentPower;

    const hasPriestessDebuff = data.effects?.some(effect => effect.name === EEffect.PRIESTESS_DEBUFF);
    if (hasPriestessDebuff) {
      this.powerText.setColor('#ff0000');
    } else {
      this.powerText.setColor(this.getTextColor(totalPow, basePower));
    }
  }

  updateCardPhysicalResistance(data: IUnitData): void {
    this.physicalResistanceText.setText(`${roundToFive(data.physicalDamageResistance)} %`);
    this.physicalResistanceText.setColor(this.getTextColor(data.physicalDamageResistance, data.physicalDamageResistance));
  }

  updateCardMagicalResistance(data: IUnitData): void {
    this.magicalResistanceText.setText(`${roundToFive(data.magicalDamageResistance)} %`);
    this.magicalResistanceText.setColor(this.getTextColor(data.magicalDamageResistance, data.magicalDamageResistance));
  }

  updateCardHealth(data: IUnitData ): void {
    this.currentHpText.setText(`${roundToFive(data.currentHealth)}/${data.maxHealth}`);
    this.currentHpText.setColor(this.getTextColor(data.maxHealth, data.baseHealth));
    this.setHealthBar(data.currentHealth, data.maxHealth);
  }

  setHealthBar(currentHealth: number, maxHealth: number) {
    const fullWidth = this.hpBackgroundImage.width - 10;
    const ratio = currentHealth / maxHealth;
    this.hpBarImage.displayWidth = fullWidth * ratio;
  }
}