import { Coordinates } from "./boardCalculations";

export const boardArea = {
  topLeftX: 500,
  topLeftY: 185,
  bottomLeftX: 500,
  bottomLeftY: 630,
  topRightX: 1310,
  topRightY: 185,
  bottomRightX: 1310,
  bottomRightY: 630
};

export const handArea = {
  topLeftX: 660,
  topLeftY: 695,
  bottomLeftX: 660,
  bottomLeftY: 760,
  topRightX: 1140,
  topRightY: 695,
  bottomRightX: 1140,
  bottomRightY: 760
};

export function isGameArea(
  clickedPoint: Coordinates,
  area: {
    topLeftX: number,
    topLeftY: number,
    bottomLeftX: number,
    bottomLeftY: number,
    topRightX: number,
    topRightY: number,
    bottomRightX: number,
    bottomRightY: number
  }
) {
  const { topLeftX, topLeftY, bottomLeftX, bottomLeftY, topRightX, topRightY, bottomRightX, bottomRightY } = area;

  // Helper function to calculate the cross product
  function crossProduct(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
  }

  // Check if the point is on the same side of all edges
  const c1 = crossProduct(topLeftX, topLeftY, topRightX, topRightY, clickedPoint.x, clickedPoint.y);
  const c2 = crossProduct(topRightX, topRightY, bottomRightX, bottomRightY, clickedPoint.x, clickedPoint.y);
  const c3 = crossProduct(bottomRightX, bottomRightY, bottomLeftX, bottomLeftY, clickedPoint.x, clickedPoint.y);
  const c4 = crossProduct(bottomLeftX, bottomLeftY, topLeftX, topLeftY, clickedPoint.x, clickedPoint.y);

  return c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0 || c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0;
}
