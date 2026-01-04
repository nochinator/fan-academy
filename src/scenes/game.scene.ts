import { Client, Room } from "colyseus.js";
import { Crystal } from "../classes/crystal";
import { GameController } from "../classes/gameController";
import { Unit } from "../classes/unit";
import { Item } from "../classes/item";
import { ICoordinates, IGame, IPlayerData, IPlayerState } from "../interfaces/gameInterface";
import { calculateAllCenterPoints } from "../utils/boardCalculations";
import { createChatComponent } from "./gameSceneUtils/chatComponent";
import { loadGameBoardUI } from "./gameSceneUtils/gameBoardUI";
import { loadGameAssets } from "./mainMenuUtils/gameAssets";
import { Tile } from "../classes/tile";
import { gameListFadeOutText, textAnimationFadeOut } from "../utils/gameUtils";
import { Sound } from "phaser";

export default class GameScene extends Phaser.Scene {
  userId!: string;
  colyseusClient!: Client;
  centerPoints: Record<string, ICoordinates>;

  currentRoom!: Room;
  currentGame!: IGame;
  currentTurnAction!: number;
  turnNumber: number | undefined;

  activeUnit: Unit | Item | undefined;

  gameController!: GameController;

  activePlayer: string | undefined;
  isPlayerOne: boolean | undefined;
  opponentId!: string;

  player1: IPlayerState | undefined;
  player2: IPlayerState | undefined;

  longPressStart: number | undefined;
  visibleUnitCard: Unit | Item | Crystal | Tile | undefined;

  triggerReplay = true;

  chatComponent: Phaser.GameObjects.DOMElement | undefined;

  thinkingTune!: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;

  constructor() {
    super({ key: 'GameScene' });
    this.centerPoints = calculateAllCenterPoints();
  }

  init(data: {
    userId: string,
    colyseusClient: Client,
    currentGame: IGame,
    currentRoom: Room,
    triggerReplay?: boolean
  }) {
    this.userId = data.userId;
    this.colyseusClient = data.colyseusClient;
    this.turnNumber = data.currentGame.turnNumber;
    this.currentGame = data.currentGame;
    this.currentRoom = data.currentRoom;
    const opponent = data.currentGame.players.find((p: IPlayerData) => data.userId !== p.userData._id);
    this.opponentId = opponent!.userData._id;

    this.triggerReplay = data.triggerReplay ?? true;

    // Updating GameScene properties
    this.activePlayer = this.currentGame.activePlayer;
    this.isPlayerOne = this.currentGame?.players[0].userData._id === this.userId;
    this.currentTurnAction = this.turnNumber === 0 ? 3 : 1;
  }

  preload() {
    this.load.html('chatComponent', 'html/chat.html');
    loadGameAssets(this);
    loadGameBoardUI(this);
  }

  create() {
    this.time.addEvent({
      delay: 300000, // 5 minutes
      callback: () => {
        this.currentRoom.send("ping");
      },
      loop: true
    });

    const userPreferences = this.registry.get('userPreferences');
    if (userPreferences.chat) this.chatComponent = createChatComponent(this);

    this.input.mouse!.disableContextMenu();
    this.gameController = new GameController(this);
    if (this.triggerReplay) this.gameController.replayTurn();

    this.thinkingTune = this.sound.add('thinkingTune', { loop: true });

    this.game.events.on('messageToGameScene', (data: {
      x: number,
      y: number,
      message: string
    }) => {
      const { x, y, message } = data;
      const openGameLimitReached = gameListFadeOutText(this, x, y, message );
      textAnimationFadeOut(openGameLimitReached, 3000);
    });

    this.events.on('shutdown', () => {
      this.sound.stopAll();
    });

    this.events.on('destroy', () => {
      this.sound.stopAll();
    });
  }
};