import { EAction, EAttackType, EClass, EFaction, EGameStatus, EHeroes, EItems } from "../enums/gameEnums";

/**
 * Item Interface
 */
export interface IItem {
  class: EClass;
  itemId: string; // userId_itemName_itemNumber
  itemType: EItems;
  boardPosition: number //45 | 46 | 47 | 48 | 49 | 50 | 51 // Needs a check when dragging to be applied to the unit if possible
  isActiveValue: boolean;
}

/**
 * Patial Hero Interface -used for instantiating hero subclasses
 */
export interface IPartialHeroInit {
  unitId: string,
  boardPosition?: number,
  currentHealth?: number,
  isKO?: boolean,
  factionBuff?: boolean,
  runeMetal?: boolean,
  shiningHelm?: boolean
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
  movement: number;
  range: number;
  attackType: EAttackType;
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number; // If > 0, the unit can heal
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  isActiveValue: boolean;
  // belongsTo: string; // user id
}

/**
 * Faction Interface
 */
export interface IFaction {
  userId: string; // REVIEW: required to differentiate units by id when playing the same faction
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
  boardState: IHero[];
  action?: ITurnAction;
}

/**
 * Game Interface
 */
export interface IGame {
  _id: string;
  players: IPlayerData[];
  gameState: IGameState[]; // turn 0 is the dealing of the hands
  currentState?: IGameState;
  winCondition?: string;
  winner?: string;
  status: EGameStatus;
  createdAt: Date;
  activePlayer: string;
  // TODO: add a mapType field that is enum. The enum will be used to render a specific tile combination for that map
}
