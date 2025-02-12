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
  userData: {
    _id: string
    username: string; // from populate in the BE
    picture: string; // from populate in the BE
  },
  faction: IFaction;
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
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayer[];
  gameState: ITurnAction[];
  winCondition?: string;
  winner?: string
  status: string // TODO: share enums?
  createdAt: Date
  activePlayer: string
}
