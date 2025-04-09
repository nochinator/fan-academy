export type Coordinates = {
  x: number,
  y: number
};
/**
 *
 * @param boardSquares array of coordinates containing the center of each square on the board. // REVIEW: if not needed anywhere else, include within function
 * @param clickedPoint coordinates of the point on the board or hand where the user clicked
 * @returns coordinates of the closest board square
 */
export function calculateClosestSquare(boardSquares: Coordinates[], clickedPoint: Coordinates): Coordinates {
  // Calculate the squared Euclidean distance between two points (accounts for negative numbers)
  const getDistanceSquared = (p1: Coordinates, p2: Coordinates): number => {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 / 100000;
  };

  let closestSquare;
  let smallestDistance = 1000;

  boardSquares.forEach((point, index) =>{
    if (index === 51) return; // do not count the deck
    const distance = getDistanceSquared(point, clickedPoint);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestSquare = point;
    }
  });

  return closestSquare ?? clickedPoint; // FIXME: original position, not dragged item
}

export function calculateCenterPoints(): Coordinates[] {
  const topLeft = {
    x: 545,
    y: 225
  };

  const centerPoints: Coordinates[] = [] as Coordinates[];

  // Adding coordinates for the board tiles
  for (let column = 0; column < 5; column++) {
    for (let row = 0; row < 9; row++) {
      const x = topLeft.x + row * 90;
      const y = topLeft.y + column * 90;

      centerPoints.push({
        x,
        y
      });
    }
  };

  // Adding coordinates for the items in the player's hand
  const leftMostItem = {
    x: 700,
    y: 745
  };

  for (let item = 0; item < 6; item++) {
    centerPoints.push({
      x: leftMostItem.x,
      y: leftMostItem.y
    });

    leftMostItem.x += 80;
  }

  // Adding coordinates for the deck (door)
  centerPoints.push({
    x: 435,
    y: 720
  });

  console.log(centerPoints);
  return centerPoints;
}
