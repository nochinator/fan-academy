import { ICoordinates } from "../interfaces/gameInterface";

export function calculateBoardCenterPoints(): { [key: string]: ICoordinates } {
  const topLeft = {
    x: 545,
    y: 225
  };
  const result: { [key: string]: ICoordinates } = {};

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const x = topLeft.x + col * 90;
      const y = topLeft.y + row * 90;

      const boardPosition: [number, number] = [row, col];
      const key = JSON.stringify(boardPosition); // Use JSON.stringify for a unique string key

      result[key] = {
        x,
        y,
        boardPosition,
      };
    }
  }
  return result;
}

export function calculateAllCenterPoints(): { [key: string]: ICoordinates } {
  // Adding coordinates for the board tiles
  const centerPoints = calculateBoardCenterPoints();

  // Adding coordinates for the items in the player's hand
  const handX = 700;
  const handY = 745;

  for (let row = 0; row < 6; row++) {
    const handPosition: [number, number] = [-1, row];
    const key = JSON.stringify(handPosition);

    centerPoints[key] = {
      x: handX + row * 80,
      y: handY,
      boardPosition: handPosition,
    };
  }

  // Adding coordinates for the deck (door)
  const deckPosition: [number, number] = [-1, 6];
  const deckKey = JSON.stringify(deckPosition);

  centerPoints[deckKey] = {
    x: 435,
    y: 720,
    boardPosition: deckPosition,
  };

  return centerPoints;
}