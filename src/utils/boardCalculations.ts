type Coordinates = {
  x: number,
  y: number
};
/**
 *
 * @param boardSquares array of coordinates containing the center of each square on the board. // REVIEW: if not needed anywhere else, include within function
 * @param draggedItem the coordinates of the item being dragged into the board when the mouse button was released
 * @returns coordinates of the closest board square
 */
export function calculateClosestSquare(boardSquares: Coordinates[], draggedItem: Coordinates): Coordinates {
  // Calculate the squared Euclidean distance between two points (accounts for negative numbers)
  const getDistanceSquared = (p1: Coordinates, p2: Coordinates): number => {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
  };

  let closestSquare = boardSquares[0];
  let smallestDistance = getDistanceSquared(boardSquares[0], draggedItem);

  boardSquares.forEach(point =>{
    const distance = getDistanceSquared(point, draggedItem);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestSquare = point;
    }
  });

  return closestSquare;
}

export default function calculateCenterPoints(): Coordinates[] {
  const topLeft = {
    x: 545,
    y: 225
  };

  const centerPoints: Coordinates[] = [] as Coordinates[];

  for (let column = 0; column < 5; column++) {
    for (let row = 0; row < 9; row++) {
      const x = topLeft.x + row * 90;
      const y = topLeft.y + column * 90;

      centerPoints.push({
        x,
        y
      });
    }}

  console.log(centerPoints);
  return centerPoints;
}
