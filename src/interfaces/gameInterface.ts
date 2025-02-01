/**
 * Unit Interface
 */
export interface IUnit {
  unitClass: "hero" | "item";
  unitType: string; // enum?
  unitId: string;
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: "physical" | "magical";
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number; // If > 0, the unit can heal
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  dragonScale: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
}

/**
 * Unit Data Interface
 */
export interface IUnitData {unitData: IUnit}

/**
 * Faction Interface
 */
export interface IFaction {
  factionName: string;
  unitsOnBoard: IUnit[];
  unitsInHand: IUnit[];
  unitsInDeck: IUnit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * Player Interface
 */
export interface IPlayer {
  playerId: string;
  faction: IFaction;
  username: string; // from populate in the BE
  picture: string; // from populate in the BE
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  activeUnit: string; // Unit id
  targetUnit: string; // Unit id or deck
  action: "attack" | "heal" | "shuffle"; // Enum for action type
  actionNumber: number; // Order in the turn
}

/**
 * Turn Interface
 */
export interface ITurn {
  turnNumber: number;
  activePlayer: string; // userId
  actions: ITurnAction[];
}

/**
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayer[];
  gameState: ITurn[];
  // board: string;
  winCondition?: string;
  winner?: string
  status: string // TODO: share enums?
  createdAt: Date
}
