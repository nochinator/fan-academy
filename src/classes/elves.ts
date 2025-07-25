import { EActionType, EAttackType, EClass, EFaction, EHeroes } from "../enums/gameEnums";

import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, generateFourDigitId, getAOETiles, isEnemySpawn, isOnBoard, roundToFive, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";

export abstract class DarkElf extends Hero {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  equipFactionBuff(handPosition: number): void {
    const soulStone = this.scene.add.image(this.x, this.y - 10, 'soulStone').setOrigin(0.5).setDepth(100);
    useAnimation(soulStone);

    this.factionBuff = true;
    this.factionBuffImage.setVisible(true);
    this.characterImage.setTexture(this.updateCharacterImage());
    this.increaseMaxHealth(50);

    this.unitCard.updateCardHealth(this);
    this.updateTileData();

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }

  lifeSteal(damage: number): void {
    if (this.factionBuff) {
      const roundedHealing = roundToFive(damage * 0.666);
      this.getsHealed(roundedHealing);
    } else {
      const roundedHealing = roundToFive(damage * 0.333);
      this.getsHealed(roundedHealing);
    }
  }
}

export class Impaler extends DarkElf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }
  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    const gameController = this.context.gameController!;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    // Keep original position for replay purposes
    const startingPosition = target.boardPosition;

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      distance === 1 &&
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      target.removeFromGame();
    } else {
      const totalPower = this.getTotalPower();

      const damageDone = target.getsDamaged(totalPower, this.attackType);

      if (damageDone) this.lifeSteal(damageDone);

      if (target instanceof Hero && target.unitType !== EHeroes.PHANTOM) await gameController.pullEnemy(this, target);

      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, startingPosition);
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class VoidMonk extends DarkElf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }
  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    const splashedEnemies: (Hero | Crystal)[] = [];

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      target.removeFromGame();
    } else {
      const board = this.context.gameController!.board;

      // Get the direction of the attack and offset tiles
      const attackDirection = board.getAttackDirection(this.boardPosition, target.boardPosition);

      const offsetTiles = this.getOffsetTiles(target.boardPosition, attackDirection);

      if (!offsetTiles.length) throw new Error(`voidMonk attack() No offsetTiles: ${this.boardPosition}, ${target.boardPosition}`);

      for (const offset of offsetTiles) {
        const tileBP = target.boardPosition + offset;
        if (!isOnBoard(tileBP)) continue;

        const tile = board.getTileFromBoardPosition(tileBP);
        if (!tile) throw new Error(`voidMonk attack() No tile found`);

        if (!canBeAttacked(this, tile)) continue;

        if (tile.hero) {
          const hero = board.units.find(unit => unit.unitId === tile.hero!.unitId);
          if (hero) splashedEnemies.push(hero);
        }

        if (tile.crystal) {
          const crystal = board.crystals.find(c => c.boardPosition === tile.crystal!.boardPosition);
          if (crystal) splashedEnemies.push(crystal);
        }
      };

      // Apply damage to targets
      let damageDone = 0;
      const unitDamage = target.getsDamaged(this.getTotalPower(), this.attackType);
      if (unitDamage) damageDone += unitDamage;
      if (splashedEnemies.length) {
        const splashDamage = this.getTotalPower() * 0.666;
        console.log(splashDamage);
        splashedEnemies.forEach(enemy => {
          const unitDamage = enemy.getsDamaged(splashDamage, this.attackType);
          if (unitDamage) damageDone += unitDamage;
        });
      }

      if (damageDone) this.lifeSteal(damageDone);

      this.removeAttackModifiers();
    }

    if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();

    splashedEnemies.forEach(enemy => {
      if (enemy instanceof Hero && enemy.unitType == EHeroes.PHANTOM) enemy.removeFromGame();
    });

    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getOffsetTiles(_target: number, attackDirection: number): number[] {
    // Direction can only be 1, 3, 5 or 7
    switch (attackDirection) {
      case 1: return [-1, 1, -9];
      case 3: return [-9, 1, 9];
      case 5: return [-1, 1, 9];
      case 7: return [-9, -1, 9];
      default: return [];
    }
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Necromancer extends DarkElf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }
  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    const gameController = this.context.gameController!;

    turnIfBehind(this.context, this, target);

    if (target instanceof Hero && target.isKO) {
      const tile = target.getTile();

      const phantom = new Phantom(this.context, createElvesPhantomData({
        unitId: `${this.context.userId}_phantom_${generateFourDigitId()}`,
        boardPosition: target.boardPosition,
        belongsTo: this.belongsTo,
        row: target.row,
        col: target.col
      }), tile, true);

      target.removeFromGame(true);

      tile.hero = phantom.exportData();

      this.removeAttackModifiers();

      gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
      gameController?.addActionToState(EActionType.SPAWN_PHANTOM, this.boardPosition);
    } else {
      const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
      if (damageDone) this.lifeSteal(damageDone);

      this.removeAttackModifiers();

      if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();

      gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
    }
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Priestess extends DarkElf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }
  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    const gameController = this.context.gameController!;
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      distance === 1 &&
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      target.removeFromGame();
    } else {
      const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
      if (damageDone) this.lifeSteal(damageDone);

      // Apply a 50% debuff to the target's next attack
      if (target instanceof Hero && !target.isDebuffed && !target.isKO) {
        target.isDebuffed = true;
        target.debuffImage.setVisible(true);
        target.unitCard.updateCardPower(target);
      }

      this.removeAttackModifiers();

      if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    }

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(target: Hero): void {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    if (target.isKO) {
      const healingAmount = this.getTotalHealing(this.basePower, 0.5);
      target.getsHealed(healingAmount);
    } else {
      const healingAmount = this.getTotalHealing(this.basePower, 2);
      target.getsHealed(healingAmount);
    }

    this.context.gameController?.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);
  };

  teleport(_target: Hero): void {};
}

export class Wraith extends DarkElf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }
  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    if (target instanceof Hero && target.isKO) {
      target.removeFromGame();

      if (this.unitsConsumed < 3) {
        this.increaseMaxHealth(100);
        this.basePower += 50;
        this.unitCard.updateCardPower(this);
        this.unitsConsumed++;
        this.updateTileData();
      }
    } else {
      const damageDone = target.getsDamaged(this.getTotalPower(), this.attackType);
      if (damageDone) this.lifeSteal(damageDone);

      this.removeAttackModifiers();

      if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    }

    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
}

export class Phantom extends Hero {
  spawnAnim?: Phaser.GameObjects.Image;

  constructor(context: GameScene, data: IHero, tile?: Tile, spawned = false) {
    super(context, data, tile);

    if (spawned && tile) {
      this.spawnAnim = context.add.image(0, -15, 'phantomSpawnAnim_1').setOrigin(0.5).setScale(0.9);

      this.specialTileCheck(tile.tileType);
      this.add([this.spawnAnim]);
      this.singleTween(this.spawnAnim, 200);
    }
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    const gameController = this.context.gameController!;
    turnIfBehind(this.context, this, target);

    // Check required for the very specific case of being orthogonally adjacent to a KO'd enemy unit on an enemy spawn
    if (
      target instanceof Hero &&
      target.isKO &&
      isEnemySpawn(this.context, target.getTile())
    ) {
      target.removeFromGame();
    } else {
      target.getsDamaged(this.getTotalPower(), this.attackType);

      this.removeAttackModifiers();

      if (target && target instanceof Hero && target.unitType === EHeroes.PHANTOM) target.removeFromGame();
    }

    gameController?.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void {};
  teleport(_target: Hero): void {};
  equipFactionBuff(): void {}
}

export class SoulStone extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(target: Hero): void {
    target.equipFactionBuff(this.boardPosition);
    this.removeFromGame();
  }
}

export class ManaVial extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(target: Hero): void {
    const potionImage = this.scene.add.image(target.x, target.y - 10, 'manaVial').setDepth(100);
    useAnimation(potionImage);

    if (target.isKO) return;
    target.healAndIncreaseHealth(1000, 50);

    this.context.gameController?.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class SoulHarvest extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(targetTile: Tile): void {
    const infernoImage = this.scene.add.image(targetTile.x, targetTile.y - 20, 'soulHarvestShockWave').setDepth(100);
    useAnimation(infernoImage);

    const gameController = this.context.gameController;
    if (!gameController) {
      console.error('SoulHarvest use() No gamecontroller');
      return;
    }
    // Damages enemy units and crystals but doesn't remove KO'd enemy units
    const damage = 100;

    const { enemyHeroTiles, enemyCrystalTiles } = getAOETiles(this.context, this, targetTile);

    // Keep track of the cumulative damage done (not attack power used) to enemy heroes (not crystals)
    let totalDamageInflicted = 0;

    enemyHeroTiles?.forEach(tile => {
      const hero = gameController.board.units.find(unit => unit.boardPosition === tile.boardPosition);

      if (!hero) throw new Error('SoulHarvest use() hero not found');
      if (hero.isKO) return;

      totalDamageInflicted += hero.getsDamaged(damage, EAttackType.MAGICAL);
    });

    enemyCrystalTiles.forEach(tile => {
      const crystal = gameController.board.crystals.find(crystal => crystal.boardPosition === tile.boardPosition);
      if (!crystal) throw new Error('SoulHarvest use() crystal not found');

      if (crystal.belongsTo !== this.belongsTo) crystal.getsDamaged(damage);
    });

    // Get total amount of friendly units in the map, including KO'd ones
    const friendlyUnits = gameController.board.units.filter(unit => unit.belongsTo === this.belongsTo);

    // Divide damage dealt by that number + 3, then round to nearest 5. Formula: 1 / (units + 3) * damage
    const lifeIncreaseAmount = roundToFive(1 / (friendlyUnits.length + 3) * totalDamageInflicted);

    // Increase max health of all units, including KO'd ones, and revive them
    friendlyUnits.forEach(unit => unit.increaseMaxHealth(lifeIncreaseAmount));

    gameController.afterAction(EActionType.USE, this.boardPosition, targetTile.boardPosition);

    this.removeFromGame();
  }
}

function createElvesPhantomData(data: Partial<IHero>): IHero {
  // Cannot be equipped, buffed or healed, disappears if KO'd
  return {
    unitType: EHeroes.PHANTOM,
    baseHealth: 100,
    maxHealth: 100,
    currentHealth: data.currentHealth ?? 100,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    basePower: 100,
    physicalDamageResistance: 0,
    basePhysicalDamageResistance: 0,
    magicalDamageResistance: 0,
    baseMagicalDamageResistance: 0,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

function createGenericElvesData(data: Partial<IHero>): {
  class: EClass,
  faction: EFaction,
  unitId: string,
  boardPosition: number,
  isKO: boolean,
  factionBuff: boolean,
  runeMetal: boolean,
  shiningHelm: boolean,
  superCharge: boolean,
  belongsTo: number,
  lastBreath: boolean,
  row: number,
  col: number,
  isDebuffed: boolean,
  attackTile: boolean
} {
  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    row: data.row ?? 0,
    col: data.col ?? 0,
    isDebuffed: data.isDebuffed ?? false,
    attackTile: data.attackTile ?? false
  };
}
