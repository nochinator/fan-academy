import { sendTurnMessage } from "../colyseus/colyseusGameRoom";
import { EActionClass, EActionType, EGameSounds, EGameStatus, EHeroes, ETiles, EUiSounds } from "../enums/gameEnums";
import { IGame, IGameOver, IGameState, IPlayerState, ITurnAction, IUserData } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { replayButton } from "../scenes/gameSceneUtils/replayButton";
import { createNewHero, createNewItem, forcedMoveAnimation, getActionClass, getNewPositionAfterForce, isEnemySpawn, isHero, isItem, playSound, textAnimationSizeIncrease, visibleUnitCardCheck } from "../utils/gameUtils";
import { deselectUnit, getPlayersKey } from "../utils/playerUtils";
import { ActionPie } from "./actionPie";
import { Board } from "./board";
import { ConcedeWarningPopup } from "./concedePopup";
import { Deck } from "./deck";
import { Door } from "./door";
import { GameOverScreen } from "./gameOverScreen";
import { GameUI } from "./gameUI";
import { Hand } from "./hand";
import { Hero } from "./hero";
import { Item } from "./item";
import { RematchButton } from "./rematchButton";
import { Tile } from "./tile";
import { TurnButton } from "./turnButton";
import { TurnWarningPopup } from "./turnPopup";

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
      const gameOverScreen =  new GameOverScreen(context);
      gameOverScreen.init();
    }

    this.context = context;
    this.game = context.currentGame!;
    this.lastTurnState =  context.currentGame.previousTurn[context.triggerReplay ? 0 : context.currentGame.previousTurn.length - 1];
    this.board = new Board(context, this.lastTurnState.boardState);

    this.playerData = context.currentGame.players.map(player => { return player.userData;});
    this.gameUI = new GameUI(context, this.board, this.playerData);
    context.player1 = this.lastTurnState.player1;
    context.player2 = this.lastTurnState.player2;

    this.deck  = new Deck(context);
    this.hand = new Hand(context);
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
    // Fake the opponent's hand if needed
    const opponentHand: (Hero | Item)[] = [];
    if (this.context.activePlayer === this.context.userId) {
      const opponentData = this.context.isPlayerOne ? this.lastTurnState.player2 : this.lastTurnState.player1;

      opponentData?.factionData.unitsInHand.forEach(unit => {
        if (isHero(unit)) opponentHand.push(createNewHero(this.context, unit).setVisible(false).setInteractive(false));
        if (isItem(unit)) opponentHand.push(createNewItem(this.context, unit).setVisible(false).setInteractive(false));
      });
    }

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
          ) this.replaySpawnOrMove(turn.action!, opponentHand);

          if (
            actionTaken === EActionType.ATTACK ||
            actionTaken === EActionType.HEAL ||
            actionTaken === EActionType.TELEPORT ||
            actionTaken === EActionType.SPAWN_PHANTOM
          ) await this.replayAttackHealTeleport(turn.action!);

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
    } );
  }

  replaySpawnOrMove(action: ITurnAction, opponentHand: (Hero | Item)[]): void {
    const actionTaken = action.action;
    const hand = opponentHand.length ? opponentHand : this.hand.hand;

    const hero = actionTaken === EActionType.SPAWN ? hand.find(unit => unit.boardPosition === action.actorPosition) as Hero : this.board.units.find(unit => unit.boardPosition === action.actorPosition);

    const tile = this.board.getTileFromBoardPosition(action.targetPosition!);

    if (!hero || !tile) throw new Error('Missing hero or tile in spawn or move action');

    if (actionTaken === EActionType.MOVE) hero.move(tile);
    if (actionTaken === EActionType.SPAWN) hero.setVisible(true).spawn(tile);
  };

  async replayAttackHealTeleport(action: ITurnAction): Promise<void> {
    const hero = this.board.units.find(unit => unit.boardPosition === action.actorPosition);
    const target = this.board.crystals.find(crystal => crystal.boardPosition === action.targetPosition) ?? this.board.units.find(unit => unit.boardPosition === action.targetPosition);
    if (!hero || !target) throw new Error('Missing hero or target in attack or heal action');

    // VSCode says await has no effect on them, but it does work
    if (action.action === EActionType.ATTACK || action.action === EActionType.SPAWN_PHANTOM) await hero.attack(target);
    if (action.action === EActionType.HEAL) await hero.heal(target as Hero);
    if (action.action === EActionType.TELEPORT) await hero.teleport(target as Hero);
  };

  async replayUse(action: ITurnAction, opponentHand: (Hero | Item)[]): Promise<void> {
    const hand = opponentHand.length ? opponentHand : this.hand.hand;

    const item = hand.find(item => item.boardPosition === action.actorPosition) as Item;
    if (!item) throw new Error('Missing item in use action');

    if (item.dealsDamage) {
      const tile = this.board.getTileFromBoardPosition(action.targetPosition!);
      if (!item) throw new Error('Missing tile in use action');
      await item.use(tile);
    }

    if (!item.dealsDamage) {
      const hero = this.board.units.find(unit => unit.boardPosition === action.targetPosition);
      if (!hero) throw new Error('Missing target in use action');
      await item.use(hero);
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
    this.context.scene.restart();
    playSound(this.context, EGameSounds.RESET_TURN);
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
    // Remove KO'd units from the board
    const unitsToRemove: Hero[] = [];

    this.board.units.forEach(unit => {
      if (unit.isKO) {
        if (unit.lastBreath) unitsToRemove.push(unit);
        if (!unit.lastBreath) {
          unit.lastBreath = true;
          unit.updateTileData();
        }
      }
    });

    if (unitsToRemove.length) {
      playSound(this.context, EGameSounds.VANISH);
      const animation = (hero: Hero): Promise<void> => {
        return new Promise((resolve) => {
          this.context.tweens.add({
            targets: hero,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
              hero.removeFromGame(true);
              resolve();
            }
          });
        });
      };

      await Promise.all(unitsToRemove.map(unit => {
        return animation.call(this.context, unit);
      }));
    }

    this.addActionToState(EActionType.REMOVE_UNITS); // this step needs to happen every turn in order to update the tiles
  }

  hasActionsLeft(): boolean {
    if (this.context.turnNumber === 0 && this.context.currentTurnAction! < 4) return true;
    if (this.context.currentTurnAction! < 6) return true;
    return false;
  }

  async endOfTurnActions(): Promise<void> {
    // If a unit was currently selected, de-select it
    if (this.context.activeUnit) deselectUnit(this.context);

    // Refresh actionPie, draw units and update door banner
    this.actionPie.resetActionPie();
    this.drawUnits();
    this.door.updateBannerText();

    // Add the last action of the previous turn at index 0 of the actions array to serve as the base for the replay
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

  onHeroClicked(hero: Hero) {
    console.log(`A hero in position ${hero.boardPosition} has been clicked`);
    if (hero.boardPosition > 44) this.board.highlightSpawns(hero.unitType);

    if (hero.boardPosition < 45) {
      this.board.highlightEnemyTargets(hero);
      this.board.highlightFriendlyTargets(hero);
      this.board.highlightMovementArea(hero);

      if (hero.unitType === EHeroes.NINJA || hero.getTile().tileType === ETiles.TELEPORTER) this.board.highlightTeleportOptions(hero);
    }
  }

  onItemClicked(item: Item) {
    console.log(`An item ${item.unitId} has been clicked`);
    if (item.dealsDamage) {
      this.board.highlightAllBoard();
    } else {
      this.board.highlightEquipmentTargets(item);
    }
  }

  onTileClicked(tile: Tile) {
    console.log(`A tile ${tile.tileType} has been clicked`);
  }

  rebuildFromState(state: IGameState): void {
    const { player, opponent } = getPlayersKey(this.context);
    
    const playerState = this.context.isPlayerOne ? state.player1 : state.player2;
    this.context[player] = playerState;

    const opponentState = this.context.isPlayerOne ? state.player2 : state.player1;
    this.context[opponent] = opponentState;
    
    this.board.setBoardState(state.boardState);

    this.hand.importHandData(playerState!.factionData.unitsInHand);
    
    this.deck.setDeck(playerState!.factionData.unitsInDeck);

    this.door.updateBannerText();
    
    this.context.currentTurnAction!--;
  }

  undoLastAction(): void {
    playSound(this.context, EUiSounds.BUTTON_GENERIC);

    if (this.currentTurn.length <= 0) {
      return;
    }

    // initial board state is stored in lastTurnState
    const previousState = this.currentTurn[this.currentTurn.length - 1] ?? this.lastTurnState;
  
    this.rebuildFromState(previousState);

    this.currentTurn.pop();
  
    this.actionPie.showActionSlice(this.context.currentTurnAction!);
    if (this.context.activeUnit) deselectUnit(this.context);
  }

  afterAction(actionType: EActionType, activePosition: number, targetPosition?: number): void {
    // Don't trigger pie animation during replays
    if (this.context.triggerReplay) return;

    // Add action to current state
    this.addActionToState(actionType, activePosition, targetPosition);

    // Remove a slice from the action pie
    this.actionPie.hideActionSlice(this.context.currentTurnAction!++);

    // Deselect unit and clear highlights
    if (this.context.activeUnit) deselectUnit(this.context);
  }

  addActionToState(action: EActionType, actorPosition?: number, targetPosition?: number): void {
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
    // Add action to current turn state
    this.currentTurn.push({
      player1: this.context.isPlayerOne ? playerState : opponentState!,
      player2: !this.context.isPlayerOne ? playerState : opponentState!,
      action: {
        actorPosition,
        targetPosition: targetPosition ?? actorPosition,
        action,
        actionClass
      },
      boardState: this.board.getBoardState()
    });
  }

  async pushEnemy(attacker: Hero, target: Hero): Promise<void> {
    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pushEnemy() no attacker or target board position');
      return;
    }

    const newPosition = getNewPositionAfterForce(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col, true);

    // If the tile is beyond the boundaries of the map, ignore
    const isWrongRow = newPosition.row < 0 || newPosition.row > 4;
    const isWrongCol = newPosition.col < 0 || newPosition.col > 8;
    if (isWrongRow || isWrongCol) {
      console.error('pushEnemy() Cant push enemy out of the map');
      return;
    }

    const targetNewTile = this.board.getTileFromCoordinates(newPosition.row, newPosition.col);
    if (!targetNewTile) {
      console.error('pushEnemy() No destination tile found');
      return;
    }
    if (targetNewTile.crystal || targetNewTile.hero) {
      console.error('pushEnemy() Destination tile is occupied');
      return;
    }
    if (targetNewTile.tileType == ETiles.SPAWN && !isEnemySpawn(this.context, targetNewTile) && !target.isKO) {
      console.error(`pushEnemy() Can't push a non-KO'd enemy onto a friendly spawn`);
      return;
    }

    if (!target.isKO) target.specialTileCheck(targetNewTile.tileType, targetTile.tileType);

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
    targetNewTile.hero = target.exportData();
    targetTile.removeHero();
  }

  async pullEnemy(attacker: Hero, target: Hero): Promise<void> {
    const attackerTile = this.board.getTileFromBoardPosition(attacker.boardPosition);
    const targetTile = this.board.getTileFromBoardPosition(target.boardPosition);
    if (!attackerTile || !targetTile) {
      console.error('pullEnemy() no attacker or target board position');
      return;
    }

    const newPosition = getNewPositionAfterForce(attackerTile.row, attackerTile.col, targetTile.row, targetTile.col, false);

    const targetNewTile = this.board.getTileFromCoordinates(newPosition.row, newPosition.col);
    if (!targetNewTile) {
      console.error('pullEnemy() No destination tile found');
      return;
    }
    if (targetNewTile.crystal || targetNewTile.hero) {
      console.error('pullEnemy() Destination tile is occupied');
      return;
    }
    if (targetNewTile.tileType == ETiles.SPAWN && !isEnemySpawn(this.context, targetNewTile) && !target.isKO) {
      console.error(`pushEnemy() Can't pull a non-KO'd enemy onto a friendly spawn`);
      return;
    }

    if (!target.isKO) target.specialTileCheck(targetNewTile.tileType, targetTile.tileType);

    await forcedMoveAnimation(this.context, target, targetNewTile);

    target.updatePosition(targetNewTile);
    targetNewTile.hero = target.exportData();
    targetTile.removeHero();
  }
}
