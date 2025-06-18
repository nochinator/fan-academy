export default function createMainMenuButton(params: {
  thisParam: any,
  x: number,
  y: number,
  imageKey: string,
  text: string,
  font: string,
  callback?: any
}) {
  const { thisParam, x, y, imageKey, text, font, callback } = params;
  // Create the image
  const buttonImage = thisParam.add.image(0, 0, imageKey).setOrigin(0.5).setInteractive();

  // Create the text
  const buttonText = thisParam.add.text(0.5, 0.5, text, { font }).setOrigin(0.5, 0.6);

  // Create a container to group the image and text
  const container = thisParam.add.container(x, y, [buttonImage, buttonText]);

  // Add interactivity to the image (acts as the button)
  buttonImage.on('pointerdown', () => {
    callback(); // Call the provided callback on click
  });

  return container;
}