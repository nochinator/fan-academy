import { EAction, EAttackType, EFaction, EGameStatus } from "../enums/gameEnums";

/**
 * Unit Interface
 */
export interface IUnit {
  unitClass: "hero" | "item";
  unitType: string; // TODO: enum?
  unitId: string; // eg: p101 -> player 1 archer for ex
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: EAttackType;
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number; // If > 0, the unit can heal
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  dragonScale: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  // belongsTo: string; // user id
}

/**
 * Faction Interface
 */
export interface IFaction {
  factionName: string;
  unitsInHand: IUnit[];
  unitsInDeck: IUnit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * User data Interface
 */
export interface IPlayerData {
  userData: {
    _id: string
    username: string; // from populate in the BE
    picture: string; // from populate in the BE
  };
  faction: EFaction;
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  activeUnit?: string; // Unit id
  targetUnit: string; // Unit id or deck
  action: EAction,
  actionNumber: number; // Order in the turn
}

/**
 * UserState Interface
 */
export interface IPlayerState {
  playerId: string,
  factionData: IFaction;
}

/**
 * GameState Interface
 */
export interface IGameState {
  // After a turn is played, a new turn (without action but with the current board state) is created as CurrentTurn
  player1: IPlayerState;
  player2?: IPlayerState;
  boardState: IUnit[];
  action?: ITurnAction;
}

/**
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayerData[];
  gameState: IGameState[]; // turn 0 is the dealing of the hands
  currentState: IGameState;
  winCondition?: string;
  winner?: string;
  status: EGameStatus;
  createdAt: Date;
  activePlayer: string;
  // TODO: add a mapType field that is enum. The enum will be used to render a specific tile combination for that map
}
