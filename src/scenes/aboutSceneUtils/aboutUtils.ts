import { fanAcademyText, heroAcademyText, disclaimerText, playText, profileText, leaderboardText, gameText, mechanicsText, countilText, councilItemsText, elvesText, elvesItemsText } from "./aboutText";

export function addTextContainer(context: Phaser.Scene): Phaser.GameObjects.Container {
  const aboutContainer = new Phaser.GameObjects.Container(context, 420, 25);

  const fontOptions = {
    fontFamily: "proLight",
    fontSize: 35,
    color: '#ffffff',
    wordWrap: {
      width: 1000,
      useAdvancedWrap: true
    }
  };

  // Start the About text
  aboutContainer.add(context.add.text(0, 0, 'Index', {
    ...fontOptions,
    fontSize: 50
  }));

  aboutContainer.add(context.add.text(0, 220, 'What is Fan Academy?', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 280, fanAcademyText, fontOptions));

  aboutContainer.add(context.add.text(0, 540, 'What is Hero Academy?', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 600, heroAcademyText, fontOptions));

  aboutContainer.add(context.add.text(0, 790, 'Disclaimer for third-party assets', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 850, disclaimerText, fontOptions));

  aboutContainer.add(context.add.text(0, 1030, 'Menu guide', {
    ...fontOptions,
    fontSize: 50
  }));

  aboutContainer.add(context.add.text(0, 1250, 'Play!', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 1310, playText, fontOptions));

  aboutContainer.add(context.add.text(0, 2490, 'Profile', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 2550, profileText, fontOptions));

  aboutContainer.add(context.add.text(0, 3070, 'Leaderboard', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 3130, leaderboardText, fontOptions));

  aboutContainer.add(context.add.text(0, 3390, 'Game guide', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 3450, gameText, fontOptions));

  aboutContainer.add(context.add.text(0, 3700, 'General mechanics', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.text(0, 3760, mechanicsText, fontOptions));

  aboutContainer.add(context.add.text(0, 6750, 'Factions', {
    ...fontOptions,
    fontSize: 50
  }));
  aboutContainer.add(context.add.image(450, 6980, 'councilAbout'));
  aboutContainer.add(context.add.text(0, 7130, countilText, {
    ...fontOptions,
    wordWrap: {
      width: 700,
      useAdvancedWrap: true
    }
  }));
  aboutContainer.add(context.add.text(0, 8320, councilItemsText, fontOptions));

  aboutContainer.add(context.add.image(450, 9040, 'elvesAbout'));
  aboutContainer.add(context.add.text(0, 9200, elvesText, {
    ...fontOptions,
    wordWrap: {
      width: 750,
      useAdvancedWrap: true
    }
  }));
  aboutContainer.add(context.add.text(0, 10910, elvesItemsText, fontOptions));

  context.add.existing(aboutContainer);

  return aboutContainer;
}

export function getContainerHeight(context: Phaser.Scene, container: Phaser.GameObjects.Container): number {
  let maxY = 0;
  container.iterate((child: any) => {
    const bottom = child.y + (child.height ?? 0);
    if (bottom > maxY) maxY = bottom;
  });
  return maxY;
}

export function addHyperlinks(context: Phaser.Scene, container: Phaser.GameObjects.Container, topY: number, bottomY: number, contentHeight: number) {
  // Set up index links
  const indexElem = [
    {
      title: 'Menu guide',
      y: 1030
    },
    {
      title: 'Game guide',
      y: 3390
    },
    {
      title: 'Factions',
      y: 6750
    }
  ];

  indexElem.forEach((elem, index) => {
    const link = addLink(context, elem, index, 60, container, topY, bottomY, contentHeight);

    container.add(link);
  });

  const mainMenuElem = [
    {
      title: 'Play!',
      y: 1250
    },
    {
      title: 'Profile',
      y: 2540
    },
    {
      title: 'Leaderboard',
      y: 3120
    }
  ];

  mainMenuElem.forEach((elem, index) => {
    const link = addLink(context, elem, index, 1090, container, topY, bottomY, contentHeight);

    container.add(link);
  });
}

export function addLink(context: Phaser.Scene, elem: {
  title: string,
  y: number
}, index: number, startPoint: number, aboutContainer: Phaser.GameObjects.Container, topY: number, bottomY: number, contentHeight: number): Phaser.GameObjects.Text {
  const link = context.add.text(0, startPoint + index * 50, elem.title, {
    fontFamily: "proLight",
    color: '#ffffff',
    fontSize: 35,
    backgroundColor: '#00f',
    padding: { x: 10 }
  });

  link.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
    aboutContainer.y = topY - elem.y;
    const minY = topY + (bottomY - contentHeight);
    aboutContainer.y = Phaser.Math.Clamp(aboutContainer.y, minY, topY);
  });

  return link;
}

export function addFactionPictures(context: Phaser.Scene, container: Phaser.GameObjects.Container): void {
  const pictureX = 840;
  container.add(context.add.image(pictureX, 7200, 'knightAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 7430, 'archerAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 7630, 'wizardAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 7915, 'clericAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 8140, 'ninjaAbout').setScale(1.5));

  container.add(context.add.image(pictureX, 9260, 'voidmonkAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 9530, 'impalerAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 9750, 'necromancerAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 10000, 'priestessAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 10300, 'wraithAbout').setScale(1.5));
  container.add(context.add.image(pictureX, 10650, 'phantomAbout').setScale(1.5));
}
