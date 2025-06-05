import { ICrystal } from "../interfaces/gameInterface";

export function createCrystalData(data: Partial<ICrystal>): ICrystal {
  const maxHealth = 4500;
  const currentHealth = 4500;
  const isDestroyed = false;
  const isLastCrystal = false;
  const boardPosition = 0;
  const row = 0;
  const col = 0;

  const dataPosition = data.boardPosition;
  if (!dataPosition) console.error('createCrystalData() Missing boardPosition');

  const belongsToCol = data.col ?? col;
  return {
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? currentHealth,
    isDestroyed: data.isDestroyed ?? isDestroyed,
    isLastCrystal: data.isLastCrystal ?? isLastCrystal,
    boardPosition: data.boardPosition ?? boardPosition,
    row: data.row ?? row,
    col: data.col ?? col,
    belongsTo: belongsToCol > 4 ? 2 : 1
  };
}