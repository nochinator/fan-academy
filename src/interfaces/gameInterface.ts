import { SuperCharge } from "../classes/item";
import { EAction, EAttackType, EClass, EFaction, EGameStatus, EHeroes, EItems, ETiles } from "../enums/gameEnums";

/**
 * Turn sent interface
 */
export interface ITurnSentMessage {
  roomId: string;
  game: IGame;
  newActivePlayer: string;
}

/**
 * Coordinates Interface
 */
export type Coordinates = {
  x: number,
  y: number,
  row?: number,
  col?: number
  boardPosition?: number
};

/**
 * Item Interface
 */
export interface IItem {
  class: EClass;
  faction: EFaction;
  unitId: string; // userId_itemName_itemNumber
  itemType: EItems;
  boardPosition: number // 45-51
  belongsTo: number;
  canHeal: boolean;
  dealsDamage: boolean;
}

/**
 * Unit Interface
 */
export interface IHero {
  class: EClass;
  faction: EFaction;
  unitType: EHeroes;
  unitId: string; // userId_unitName_unitNumber
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  healingRange: number;
  attackType: EAttackType;
  power: number;
  powerModifier: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  superCharge: boolean;
  belongsTo: number;
  canHeal: boolean
}

/**
 * Faction Interface
 */
export interface IFaction {
  userId?: string;
  factionName: string;
  unitsInHand: (IHero | IItem)[];
  unitsInDeck: (IHero | IItem)[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * User data Interface
 */
export interface IPlayerData {
  userData: {
    _id: string;
    username: string; // from populate in the BE
    picture: string; // from populate in the BE
  };
  faction: EFaction;
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  actorPosition?: number;
  targetPosition?: number; // an item can be a target for shuffle
  action: EAction,
  actionNumber: number;
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
  row: number;
  col: number;
  tileType: ETiles;
  x: number;
  y: number;
  boardPosition: number;
  occupied: boolean;
  obstacle: boolean;
  hero?: IHero | undefined;
}

/**
 * GameState Interface
 */
export interface IGameState {
  // After a turn is played, a new turn (without action but with the current board state) is created as CurrentTurn
  player1: IPlayerState;
  player2?: IPlayerState;
  boardState: ITile[];
  action?: ITurnAction;
}

/**
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayerData[];
  gameState: IGameState[][];
  currentState: IGameState[];
  currentTurn: number;
  winCondition?: string;
  winner?: string;
  status: EGameStatus;
  createdAt: Date;
  activePlayer: string;
  // TODO: add a mapType field that is enum. The enum will be used to render a specific tile combination for that map
}
