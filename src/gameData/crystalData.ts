import { ICrystal } from "../interfaces/gameInterface";

export function createCrystalData(data: Partial<ICrystal>): ICrystal {
  const maxHealth = 4500;
  const currentHealth = 4500;
  const isDestroyed = false;
  const isLastCrystal = false;
  const boardPosition = 0;
  const debuffLevel = 0;

  // FIXME: refactor so I don't have to set this to zero and not be used
  const row = 0;
  const col = 0;
  const belongsTo = 0;

  const dataPosition = data.boardPosition;
  if (!dataPosition) console.error('createCrystalData() Missing boardPosition');

  return {
    maxHealth: data.maxHealth ?? maxHealth,
    currentHealth: data.currentHealth ?? currentHealth,
    isDestroyed: data.isDestroyed ?? isDestroyed,
    isLastCrystal: data.isLastCrystal ?? isLastCrystal,
    boardPosition: data.boardPosition ?? boardPosition,
    row,
    col,
    belongsTo,
    debuffLevel: data.debuffLevel ?? debuffLevel
  };
}