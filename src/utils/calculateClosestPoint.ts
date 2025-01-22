type coordinates = {
  x: number,
  y: number
};
/**
 *
 * @param boardSquares array of coordinates containing the center of each square on the board. // REVIEW: if not needed anywhere else, include within function
 * @param draggedItem the coordinates of the item being dragged into the board when the mouse button was released
 * @returns coordinates of the closest board square
 */
export default function calculateClosestSquare(boardSquares: coordinates[], draggedItem: coordinates): coordinates {
  // Calculate the squared Euclidean distance between two points (accounts for negative numbers)
  const getDistanceSquared = (p1: coordinates, p2: coordinates): number => {
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
