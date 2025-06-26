import ProfileScene from "../scenes/profile.scene";
import { profilePicNames } from "../scenes/profileSceneUtils/profilePicNames";
import { imageKeywordFromFilename } from "../scenes/sceneUtils";

export class ProfilePicPopup extends Phaser.GameObjects.Container {
  constructor(context: ProfileScene, profilePicture: Phaser.GameObjects.Image) {
    super(context, 800, 400);

    const modal = new Phaser.GameObjects.Container(context, 0, 0); // Centered relative to the popup

    // Scroll container (inside modal, top-left)

    // Used to block the user from clicking on some other part of the game
    const blockingLayer = context.add.rectangle(0, 0, 3000, 2000, 0x000000, 0.001).setOrigin(0.5).setInteractive();

    const modalWidth = 600;
    const modalHeight = 500;
    const avatarSize = 256 * 0.4;
    const padding = 10;
    const avatarsPerRow = 4;

    // Disable input outside modal
    // context.input.enabled = false;

    // Dark overlay
    // const overlay = context.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);

    // Background
    const backgroundRectangle = context.add.rectangle(0, 0, modalWidth, modalHeight, 0x222222, 1)
      .setStrokeStyle(2, 0xffffff);
    modal.add(backgroundRectangle);

    // Scrollable area
    const scrollContainer = new Phaser.GameObjects.Container(context, -modalWidth / 2 + padding, -modalHeight / 2 + padding);
    modal.add(scrollContainer);

    const thumbnails: Phaser.GameObjects.Image[] = [];

    profilePicNames.forEach((key, index) => {
      const row = Math.floor(index / avatarsPerRow);
      const col = index % avatarsPerRow;

      const x = col * (avatarSize + padding);
      const y = row * (avatarSize + padding);

      const picName = imageKeywordFromFilename(key);
      const img = context.add.image(x + 120, y - 160, picName)
        .setInteractive()
        .setDisplaySize(avatarSize, avatarSize)
        .setData('key', key);

      img.on('pointerdown', () => {
        context.userData!.picture = `/assets/images/profilePics/${key}`;
        console.log(picName, 'picname');
        profilePicture!.setTexture(picName).setDisplaySize(256 * 0.5, 256 * 0.5);
        this.setVisible(false);
        context.profile?.toggleFormVisibility(true);
        console.log('USERDATA', context.userData!);
      });

      thumbnails.push(img);
      scrollContainer.add(img);
    });

    // Scroll mask
    const maskX = this.x + scrollContainer.x;
    const maskY = this.y + scrollContainer.y;

    const maskShape = context.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(maskX, maskY + 25, modalWidth - 2 * padding, modalHeight - 60);

    const mask = new Phaser.Display.Masks.GeometryMask(context, maskShape);
    scrollContainer.setMask(mask);

    // Set initial scroll bounds
    const totalRows = Math.ceil(profilePicNames.length / avatarsPerRow);
    const contentHeight = totalRows * (avatarSize + padding);
    const minY = -contentHeight + modalHeight - 2 * padding - 100;
    scrollContainer.y = 0; // Make sure it's at top

    // Enable wheel-based scrolling
    context.input.on('wheel', (_pointer: Phaser.Input.Pointer, _currentlyOver: any, _deltaX: number, deltaY: number, _deltaZ: number ) => {
      // Only scroll if the modal is visible
      if (!this.visible) return;

      scrollContainer.y -= deltaY * 1; // Adjust speed multiplier if needed
      scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y, minY, 0);
    });

    this.add([
      blockingLayer,
      modal
    ]);

    this.setDepth(1002);
    this.setVisible(false);

    context.add.existing(this);
  }
}