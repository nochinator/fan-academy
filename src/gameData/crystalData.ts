import { ICrystal } from "../interfaces/gameInterface";
import { getCoordinatesFromBoardPosition } from "../utils/gameUtils";

export function createCrystalData(data: Partial<ICrystal>): ICrystal {
  const maxHealth = 4500;
  const currentHealth = 4500;
  const isDestroyed = false;
  const isLastCrystal = false;
  const boardPosition = 0;

  const dataPosition = data.boardPosition;
  if (!dataPosition) console.error('createCrystalData() Missing boardPosition');

  const coordinates = getCoordinatesFromBoardPosition(dataPosition ?? boardPosition);

  return {
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? currentHealth,
    isDestroyed: data.isDestroyed ?? isDestroyed,
    isLastCrystal: data.isLastCrystal ?? isLastCrystal,
    boardPosition: data.boardPosition ?? boardPosition,
    belongsTo: coordinates.col > 4 ? 2 : 1
  };
}