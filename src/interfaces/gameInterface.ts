import { EActionClass, EActionType, EAttackType, EClass, EFaction, EGameStatus, EUnitTypes, ETiles, EWinConditions, EItems, EEffect } from "../enums/gameEnums";

/**
 * Game Over Interface
 */
export interface IGameOver {
  winCondition: EWinConditions,
  winner: string
}

/**
 * Coordinates Interface
 */
export type ICoordinates = {
  x: number,
  y: number,
  boardPosition?: [number, number]
};

/**
 * Unit Interface
 */
export interface IUnitData {
  unitId: string; // userId_unitName_unitNumber
  type: EUnitTypes;
  faction: EFaction;
  class: EClass;
  baseHealth: number;
  maxHealth: number;
  currentHealth: number;
  basePower: number;
  currentPower: number;
  movement: number;
  attackRange: number;
  specialRange: number;
  effects: IEffect[];
  boardPosition: [number, number];
  belongsTo: number;
  canSpecial: boolean;
  attackType: EAttackType;
  isKO: boolean;
  lastBreath: boolean;
  basePhysicalDamageResistance: number;
  baseMagicalDamageResistance: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
}

/**
 * Item Interface
 */
export interface IItemData {
  name: string;
  unitId: string;
  boardPosition: [number, number];
  itemType: EItems;
  belongsTo: number;
  class: EClass;
  canHeal: boolean;
  dealsDamage: boolean;
}

/**
 * Faction Interface
 */
export interface IFaction {
  userId?: string;
  factionName: string;
  unitsInHand: (IUnitData | IItemData)[];
  unitsInDeck: (IUnitData | IItemData)[];
}

export interface IEffect {
  name: EEffect;
  potency: number;
  duration: number;
}

/**
 * User and player data Interface
 */
export interface IUserData {
  _id: string;
  username: string; // from populate in the BE
  picture: string; // from populate in the BE
};

export interface IPlayerData {
  userData: IUserData;
  faction: EFaction;
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  actorPosition?: [number, number];
  targetPosition?: [number, number]; // an item can be a target for shuffle
  action: EActionType;
  actionClass: EActionClass,
}

/**
 * UserState Interface
 */
export interface IPlayerState {
  playerId: string;
  factionData: IFaction;
}

/**
 * Tile Interface
 */
export interface ITile {
  tileType: ETiles;
  x: number;
  y: number;
  boardPosition: [number, number];
  unit?: IUnitData | undefined;
  item?: IItemData | undefined
}

/**
 * GameState Interface
 */
export interface IGameState {
  player1: IPlayerState;
  player2?: IPlayerState;
  boardState: ITile[][];
  action?: ITurnAction;
}

/**
 * Chat message interface
 */
export interface IChatMessage {
  username: string;
  message: string;
  createdAt: Date;
}
export interface IChat {
  _id: string;
  messages: IChatMessage[]
}

/**
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayerData[];
  turnNumber: number;
  currentState: IGameState[];
  previousTurn: IGameState[];
  gameOver?: IGameOver,
  status: EGameStatus;
  createdAt: Date;
  finishedAt: Date;
  lastPlayedAt: Date;
  activePlayer: string;
  chatLogs: IChat;
}
