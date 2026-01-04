import { sendTurnMessage } from "../colyseus/colyseusGameRoom";
import { EActionClass, EActionType, EGameSounds, EGameStatus, ETiles, EUiSounds } from "../enums/gameEnums";
import { IGame, IGameOver, IGameState, IPlayerState, ITurnAction, IUserData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { replayButton } from "../scenes/gameSceneUtils/replayButton";
import { createNewUnit, createNewItem, forcedMoveAnimation, forcedMoveSpawnCheck, getActionClass, getNewPositionAfterForce, isUnit, isItem, playSound, textAnimationSizeIncrease, visibleUnitCardCheck } from "../utils/gameUtils";
import { deselectUnit, getPlayersKey } from "../utils/playerUtils";
import { ActionPie } from "./actionPie";
import { Board } from "./board";
import { ConcedeWarningPopup } from "./concedePopup";
import { Deck } from "./deck";
import { Door } from "./door";
import { GameOverScreen } from "./gameOverScreen";
import { GameUI } from "./gameUI";
import { Hand } from "./hand";
import { Unit } from "./unit";
import { Item } from "./item";
import { RematchButton } from "./rematchButton";
import { Tile } from "./tile";
import { TurnButton } from "./turnButton";
import { TurnWarningPopup } from "./turnPopup";
import { Crystal } from "./crystal";

export class GameController {
  context: GameScene;
  game: IGame;
  gameUI: GameUI;
  board: Board;
  hand: Hand;
  deck: Deck;
  actionPie: ActionPie;
  door: Door;
  turnButton: TurnButton;
  turnPopup: TurnWarningPopup;
  rematchButton: RematchButton;
  lastTurnState: IGameState;
  currentTurn: IGameState[];
  blockingLayer: Phaser.GameObjects.Rectangle;
  replayButton: Phaser.GameObjects.Image;
  playerData: IUserData[];

  gameOver: IGameOver | undefined;
  gameOverScreen: GameOverScreen | undefined;
  concedeButton: Phaser.GameObjects.Image;
  concedePopup: ConcedeWarningPopup;

  constructor(context: GameScene) {
    if (context.triggerReplay && context.chatComponent) context.chatComponent!.pointerEvents = 'none';

    if (context.currentGame.status === EGameStatus.FINISHED && !context.triggerReplay){
      const gameOverScreen = new GameOverScreen(context);
      gameOverScreen.init();
    }

    this.context = context;
    this.game = context.currentGame!;
    this.lastTurnState = context.currentGame.previousTurn[context.triggerReplay ? 0 : context.currentGame.previousTurn.length - 1];
    this.board = new Board(context, this.lastTurnState.boardState);

    this.playerData = context.currentGame.players.map(player => { return player.userData;});
    this.gameUI = new GameUI(context, this.board, this.playerData);
    context.player1 = this.lastTurnState.player1;
    context.player2 = this.lastTurnState.player2;

    this.deck = new Deck(context);
    this.hand = new Hand(context, this.board);
    this.actionPie = new ActionPie(context);

    this.turnButton = new TurnButton(context);
    this.turnPopup = new TurnWarningPopup(context);

    this.rematchButton = new RematchButton(context).setVisible(false);

    this.concedeButton = this.addConcedeButton(context);
    this.concedePopup = new ConcedeWarningPopup(context);

    if (context.triggerReplay) {
      this.rematchButton.setVisible(false);
      this.turnButton.buttonImage.setVisible(false);
    }
    else if (this.game.status === EGameStatus.FINISHED) {
      this.rematchButton.setVisible(true);
      this.turnButton.buttonImage.setVisible(false);
      this.gameOverEffects();
    }

    if (context.activePlayer !== context.userId) this.turnButton.buttonImage.setVisible(false);

    this.door = new Door(context);

    // Used to block the user from clicking on some other part of the game during a replay. Clicking skips replay
    this.blockingLayer = context.add.rectangle(910, 0, 1040, 1650, 0x000000, 0.3).setOrigin(0.5).setInteractive().setDepth(999).setVisible(this.context.triggerReplay);

    this.blockingLayer.on('pointerdown', () => {
      context.scene.restart({
        userId: context.userId,
        colyseusClient: context.colyseusClient,
        currentGame: context.currentGame,
        currentRoom: context.currentRoom,
        triggerReplay: false
      });
    });

    this.replayButton = replayButton(context);

    this.currentTurn = [];

    // Add a generic gameobject pointer event to make it easier to hide a unit info card
    context.input.on('gameobjectdown', () => visibleUnitCardCheck(context));
  }

  addConcedeButton(context: GameScene): Phaser.GameObjects.Image {
    const button = context.add.image(1350, 70, 'concedeButton').setScale(0.9).setInteractive({ useHandCursor: true });
    button.on('pointerdown', ()=> {
      playSound(this.context, EUiSounds.BUTTON_GENERIC);
      this.concedePopup.setVisible(true);
    });
    return button;
  }

  async replayTurn() {
    const opponentHand: (Unit | Item)[] = [];
  
    // Always reconstruct opponent's hand from viewer's POV (symmetric for both players)
    const opponentData = this.context.isPlayerOne ? this.lastTurnState.player2 : this.lastTurnState.player1;
  
    opponentData?.factionData?.unitsInHand?.forEach(unit => {
      if (isUnit(unit)) {
        opponentHand.push(createNewUnit(this.context, unit).setVisible(false).setInteractive(false));
      }
      if (isItem(unit)) {
        opponentHand.push(createNewItem(this.context, unit).setVisible(false).setInteractive(false));
      }
    });
  
    for (let i = 1; i < this.context.currentGame.previousTurn.length; i++) {
      const turn = this.context.currentGame.previousTurn[i];
  
      const actionsToIgnore = [EActionType.DRAW, EActionType.PASS];
      const actionTaken = turn.action?.action;
  
      if (!actionTaken || actionsToIgnore.includes(actionTaken)) continue;
  
      await new Promise<void>(resolve => {
        this.context.time.delayedCall(1000, async () => {
          if (
            actionTaken === EActionType.SPAWN ||
            actionTaken === EActionType.MOVE
          ) await this.replaySpawnOrMove(turn.action!, opponentHand);
  
          if (
            actionTaken === EActionType.ATTACK ||
            actionTaken === EActionType.SPECIAL
          ) await this.replayAttackHealSpecial(turn.action!);
  
          if (actionTaken === EActionType.SHUFFLE) await this.replayShuffle();
  
          if (actionTaken === EActionType.USE) await this.replayUse(turn.action!, opponentHand);
  
          if (actionTaken === EActionType.REMOVE_UNITS) await this.removeKOUnits();
  
          resolve();
        });
      });
    }
  
    this.context.scene.restart({
      userId: this.context.userId,
      colyseusClient: this.context.colyseusClient,
      currentGame: this.context.currentGame,
      currentRoom: this.context.currentRoom,
      triggerReplay: false,
      gameOver: undefined
    });
  }

  async replaySpawnOrMove(action: ITurnAction, opponentHand: (Unit | Item)[]): Promise<void> {
    const actionTaken = action.action;
    const hand = opponentHand.length ? opponentHand : this.hand.hand;

    // Use a deep comparison for the board position array
    const unit = actionTaken === EActionType.SPAWN ?
      hand.find(unit => unit.boardPosition && unit.boardPosition[0] === action.actorPosition![0] && unit.boardPosition[1] === action.actorPosition![1]) as Unit :
      this.board.units.find(unit => unit.boardPosition[0] === action.actorPosition![0] && unit.boardPosition[1] === action.actorPosition![1]);

    const tile = this.board.getTileFromBoardPosition(action.targetPosition!);

    if (!unit || !tile) throw new Error('Missing unit or tile in spawn or move action');

    if (actionTaken === EActionType.MOVE) await unit.move(tile);
    if (actionTaken === EActionType.SPAWN) unit.setVisible(true).spawn(tile);
  };

  async replayAttackHealSpecial(action: ITurnAction): Promise<void> {
    // Use a deep comparison for the board position array
    const unit = this.board.units.find(unit => unit.boardPosition[0] === action.actorPosition![0] && unit.boardPosition[1] === action.actorPosition![1]);
    const target = this.board.crystals.find(crystal => crystal.boardPosition[0] === action.targetPosition![0] && crystal.boardPosition[1] === action.targetPosition![1]) ?? this.board.units.find(unit => unit.boardPosition[0] === action.targetPosition![0] && unit.boardPosition[1] === action.targetPosition![1]);

    if (!unit || !target) throw new Error('Missing unit or target in attack or heal action');

    // VSCode says await has no effect on them, but it does work
    if (action.action === EActionType.ATTACK) await unit.attack(target.getTile());
    if (action.action === EActionType.SPECIAL) await unit.special(target.getTile());
  };

  async replayUse(action: ITurnAction, opponentHand: (Unit | Item)[]): Promise<void> {
    const hand = opponentHand.length ? opponentHand : this.hand.hand;

    // Use a deep comparison for the board position array
    const item = hand.find(item => item.boardPosition && item.boardPosition[0] === action.actorPosition![0] && item.boardPosition[1] === action.actorPosition![1]) as Item;
    if (!item) throw new Error('Missing item in use action');

    if (item.dealsDamage) {
      const tile = this.board.getTileFromBoardPosition(action.targetPosition!);
      if (!tile) throw new Error('Missing tile in use action');
      await item.use(tile);
    }

    if (!item.dealsDamage) {
      const unit = this.board.units.find(unit => unit.boardPosition[0] === action.targetPosition![0] && unit.boardPosition[1] === action.targetPosition![1]);
      if (!unit) throw new Error('Missing target in use action');
      await item.use(unit);
    }
  }

  async replayShuffle(): Promise<void> {
    const shuffleText = this.context.add.text(600, 350, 'OPPONENT SWAPPED AN ITEM!', {
      fontFamily: "proLight",
      fontSize: 50,
      color: '#fffb00'
    }).setDepth(999);
    playSound(this.context, EGameSounds.SHUFFLE);

    await textAnimationSizeIncrease(shuffleText, 1.3);
  }

  async resetTurn() {
    deselectUnit(this.context);
    this.context.longPressStart = undefined;
    this.context.visibleUnitCard = undefined;
    playSound(this.context, EGameSounds.RESET_TURN);

    this.context.scene.restart();
  };

  getDeck() {
    return this.deck.getDeck();
  }

  drawUnits() {
    playSound(this.context, EGameSounds.DRAW);

    const drawAmount = 6 - this.hand.getHandSize();
    if (this.deck.getDeckSize() === 0 || drawAmount === 0) return;

    this.door.openDoor();

    const drawnUnits = this.deck.removeFromDeck(drawAmount); // IHero IItem

    this.hand.addToHand(drawnUnits);

    // Add action to turn state
    const { player, opponent } = getPlayersKey(this.context);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData(),
        unitsInDeck: this.deck.getDeck()
      }
    };
    const opponentState = this.context[opponent];
    this.currentTurn.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        actionClass: EActionClass.AUTO,
        action: EActionType.DRAW

      },
      boardState: this.board.getBoardState()
    });
  }

  async removeKOUnits() {
    const unitsToRemove: Unit[] = [];

    this.board.units.forEach(unit => {
      if (unit.isKO) {
        if (unit.lastBreath) unitsToRemove.push(unit);
        if (!unit.lastBreath) {
          unit.lastBreath = true;
        }
      }
    });

    if (unitsToRemove.length) {
      playSound(this.context, EGameSounds.VANISH);
      const animation = (unit: Unit): Promise<void> => {
        return new Promise((resolve) => {
          this.context.tweens.add({
            targets: unit,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
              unit.removeFromGame(true);
              resolve();
            }
          });
        });
      };

      await Promise.all(unitsToRemove.map(unit => {
        return animation.call(this.context, unit);
      }));
    }

    this.addActionToState(EActionType.REMOVE_UNITS);
  }

  hasActionsLeft(): boolean {
    if (this.context.turnNumber === 0 && this.context.currentTurnAction! < 4) return true;
    if (this.context.currentTurnAction! < 6) return true;
    return false;
  }

  async endOfTurnActions(): Promise<void> {
    if (this.context.activeUnit) deselectUnit(this.context);

    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();

    this.currentTurn.unshift(this.lastTurnState);

    this.context.activePlayer = this.context.opponentId;
    this.context.turnNumber!++;

    sendTurnMessage(this.context.currentRoom, this.currentTurn, this.context.opponentId, this.context.turnNumber!, this.gameOver);

    if (this.gameOver) this.gameOverEffects();
  }

  async gameOverEffects() {
    if (this.gameOver?.winner === this.context.activePlayer) {
      playSound(this.context, EUiSounds.WIN_SFX);
    } else {
      playSound(this.context, EUiSounds.LOSE_SFX);
    }
  }

  onTileClicked(tile: Tile) {
    console.log(`A tile ${tile.tileType} has been clicked`);
  }

  afterAction(actionType: EActionType, activePosition: [number, number], targetPosition?: [number, number]): void {
    if (this.context.triggerReplay) return;

    this.addActionToState(actionType, activePosition, targetPosition);

    this.actionPie.hideActionSlice(this.context.currentTurnAction!++);

    if (this.context.activeUnit) deselectUnit(this.context);
  }

  addActionToState(action: EActionType, actorPosition?: [number, number], targetPosition?: [number, number]): void {
    const { player, opponent } = getPlayersKey(this.context);

    const actionClass = getActionClass(action);

    const playerState: IPlayerState = {
      ...this.context[player]!,
      factionData: {
        ...this.context[player]!.factionData,
        unitsInHand: this.hand.exportHandData(),
        unitsInDeck: this.deck.getDeck()
      }
    };

    const opponentState = this.context[opponent];
    this.currentTurn.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        actorPosition,
        // The target position is now explicitly passed as an array
        targetPosition: targetPosition,
        action,
        actionClass
      },
      boardState: this.board.getBoardState()
    });
  }

  async pushEnemy(attacker: Unit, target: Unit): Promise<void> {
    if (target instanceof Crystal) return; // can't push crystals
    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pushEnemy() no attacker or target board position');
      return;
    }

    const attackerRow = attackerTile.boardPosition[0];
    const attackerCol = attackerTile.boardPosition[1];
    const targetRow = target.boardPosition[0];
    const targetCol = target.boardPosition[1];

    // This function returns a [row, col] tuple, which is the correct format for the new system.
    const newPosition = getNewPositionAfterForce(attackerRow, attackerCol, targetRow, targetCol, true);

    const isWrongRow = newPosition[0] < 0 || newPosition[0] > 4;
    const isWrongCol = newPosition[1] < 0 || newPosition[1] > 8;
    if (isWrongRow || isWrongCol) {
      console.error('pushEnemy() Cant push enemy out of the map');
      return;
    }

    const targetNewTile = this.board.getTileFromBoardPosition(newPosition);
    if (!targetNewTile) {
      console.error('pushEnemy() No destination tile found');
      return;
    }
    if (targetNewTile.unit) {
      console.error('pushEnemy() Destination tile is occupied');
      return;
    }
    if (targetNewTile.tileType === ETiles.SPAWN && forcedMoveSpawnCheck(targetNewTile, target) && !target.isKO) {
      console.error(`pushEnemy() Can't push a non-KO'd enemy onto a friendly spawn`);
      return;
    }

    if (!target.isKO) target.specialTileCheck(targetNewTile);

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
    targetNewTile.unit = target;
    targetTile.removeUnit();
  }

  async pullEnemy(attacker: Unit, target: Unit): Promise<void> {
    if (target instanceof Crystal) return; // can't pull crystals

    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pullEnemy() no attacker or target board position');
      return;
    }

    const attackerRow = attackerTile.boardPosition[0];
    const attackerCol = attackerTile.boardPosition[1];
    const targetRow = attackerTile.boardPosition[0];
    const targetCol = attackerTile.boardPosition[1];

    // This function returns a [row, col] tuple, which is the correct format for the new system.
    const newPosition = getNewPositionAfterForce(attackerRow, attackerCol, targetRow, targetCol, false);

    const targetNewTile = this.board.getTileFromBoardPosition(newPosition);
    if (!targetNewTile) {
      console.error('pullEnemy() No destination tile found');
      return;
    }
    if (targetNewTile.unit) {
      console.error('pullEnemy() Destination tile is occupied');
      return;
    }
    if (targetNewTile.tileType === ETiles.SPAWN && forcedMoveSpawnCheck(targetNewTile, attacker) && !target.isKO) {
      console.error(`pushEnemy() Can't pull a non-KO'd enemy onto a friendly spawn`);
      return;
    }

    if (!target.isKO) target.specialTileCheck(targetNewTile);

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
    targetNewTile.unit = target;
    targetTile.removeUnit();
  }
}