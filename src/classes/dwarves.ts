import { EActionType, EAttackType, EGameSounds, ETiles } from "../enums/gameEnums";
import { IHero, IItem } from "../interfaces/gameInterface";
import GameScene from "../scenes/game.scene";
import { canBeAttacked, getAOETiles, playSound, roundToFive, turnIfBehind, useAnimation } from "../utils/gameUtils";
import { Crystal } from "./crystal";
import { Hero } from "./hero";
import { Item } from "./item";
import { Tile } from "./tile";


// Base Dwarf class with the racial passive
export abstract class Dwarf extends Hero {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Abstract methods to be implemented by children
  special(_target: Hero): void { };
  equipFactionBuff(handPosition: number): void {
    playSound(this.scene, EGameSounds.DRAGON_SCALE_USE);

    const dragonScaleImg = this.scene.add.image(this.x + 10, this.y - 10, 'dragonScale').setOrigin(0.5).setDepth(100);
    useAnimation(dragonScaleImg);

    this.factionBuff = true;
    this.factionBuffImage.setVisible(true);
    this.characterImage.setTexture(this.updateCharacterImage());

    this.physicalDamageResistance += 20;

    this.increaseMaxHealth(this.baseHealth * 0.1);

    this.unitCard.updateCardData(this);
    this.updateTileData();

    this.scene.sound.play(EGameSounds.DRAGON_SCALE_USE);

    this.context.gameController!.afterAction(EActionType.USE, handPosition, this.boardPosition);
  }}

// Hero Class: Paladin
export class Paladin extends Dwarf {

  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Heals self for 50% of any healing done
  onHealingDone(amount: number): void {
    const selfHealAmount = roundToFive(amount * 0.5);
    this.getsHealed(selfHealAmount);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    if (this.superCharge) {
      playSound(this.scene, EGameSounds.PALADIN_ATTACK);
    } else {
      playSound(this.scene, EGameSounds.PALADIN_ATTACK_BIG);
    }

    target.getsDamaged(this.getTotalPower(), this.attackType);

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  async heal(target: Hero): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    this.playHealSounds();

    let healingAmount: number;
    if (target.isKO) {
      healingAmount = this.getTotalHealing(0.5);
      // Revive KO'd hero
      target.isKO = false;
    } else {
      healingAmount = this.getTotalHealing(2.0);
    }

    target.getsHealed(healingAmount);
    if (healingAmount > 0) {
      this.onHealingDone(healingAmount);
    }
    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.HEAL, this.boardPosition, target.boardPosition);
  }

  playHealSounds() {
    this.context.sound.play(EGameSounds.HEAL, { volume: 0.5 });
  }

  async move(targetTile: Tile): Promise<void> {
    // remove current auras
    let aoeTiles = getAOETiles(this.context, this, this.getTile(), true);
    let allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit =
        this.context.gameController!.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController!.board.crystals.find(c => c.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        unit.magicalDamageResistance -= 5;
        unit.physicalDamageResistance -= 5;
        unit.paladinAura -= 1;
      }
    });

    // add new auras
    aoeTiles = getAOETiles(this.context, this, targetTile, true);
    allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
    allTiles.forEach(tile => {
      const unit =
        this.context.gameController!.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController!.board.crystals.find(c => c.boardPosition === tile.boardPosition);

      if (unit && unit !== this) {
        unit.magicalDamageResistance += 5;
        unit.physicalDamageResistance += 5;
        unit.paladinAura += 1;
        unit.unitCard.updateCardData(unit as any); // compiler is being dumb, unit matches the type of whatever it is.
      }
    });

    super.move(targetTile);
  }

  special(_target: Hero): void {};
}

// Hero Class: Grenadier
export class Grenadier extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);

    if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GRENADIER_ATTACK_MELEE);
      target.getsDamaged(this.getTotalPower() * 0.5, this.attackType);
    } else { // Ranged attack, ignores LOS
      if (!this.superCharge) {
        playSound(this.scene, EGameSounds.GRENADIER_ATTACK);
      } else {
        playSound(this.scene, EGameSounds.GRENADIER_ATTACK_BIG);
      }
      const damage = this.getTotalPower();
      const splashDamage = damage * 0.5;

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // AoE damage to nearby enemies
      const aoeTiles = getAOETiles(this.context, this, target.getTile(), false);
      const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
      allTiles.forEach(tile => {
        const unit =
          this.context.gameController!.board.units.find(u => u.boardPosition === tile.boardPosition) ||
          this.context.gameController!.board.crystals.find(c => c.boardPosition === tile.boardPosition);
        if (unit && target !== unit && unit.belongsTo !== this.belongsTo) {
          unit.getsDamaged(splashDamage, this.attackType);
        }
      });
    }

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }
  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Hero Class: Gunner
export class Gunner extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);

    const distance = this.getDistanceToTarget(target);
    const board = this.context.gameController!.board;

    if (distance === 1) { // Melee attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK_ONLY);
      target.getsDamaged(this.getTotalPower(), this.attackType);
    } else { // Ranged cone attack
      playSound(this.scene, EGameSounds.GUNNER_ATTACK);
      const damage = this.getTotalPower() * 0.66;
      const attackDirection = board.getAttackDirection(this.boardPosition, target.boardPosition);
      const coneUnits = this.getConeTiles(this.boardPosition, attackDirection);

      // Damage main target
      target.getsDamaged(damage, this.attackType);

      // Damage up to two other targets in the cone
      let targetsHit = 0;
      coneUnits.forEach(unit => {
        if (targetsHit >= 2) return;
        if (unit && canBeAttacked(this, unit.getTile()) && unit !== target) {
          unit.getsDamaged(damage, this.attackType);
          targetsHit++;
        }
      });
    }

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  getConeTiles(startPos: number, direction: number) {
    const units = [];
    const board = this.context.gameController!.board
    const findTile = (position: number) =>
      position > 0 && position < 45 ?
        board.getUnitFromTile(board.getTileFromBoardPosition(position))?.belongsTo !== this.belongsTo ?
        board.getUnitFromTile(board.getTileFromBoardPosition(position))
        : undefined : undefined; // there is a unit that is on other team
  
    const offsets: { [key: number]: number[] } = {
      1: [-10, -19, -8, -17], // vertical up
      5: [10, 19, 8, 17],    // vertical down
      2: [-9, -18, 1, 2],  // up-right
      6: [9, 18, -1, -2],      // down-left
      3: [-8, -7, 10, 11],   // horizontal left
      7: [8, 7, -10, -11],   // horizontal right
      4: [9, 18, 1, 2],    // down-right
      8: [-9, -18, -1, -2],    // up-left
    };
  
    const currentOffsets = offsets[direction];
    if (currentOffsets) {
      const [offset1, offset2, offset3, offset4] = currentOffsets;
      const unit1 = findTile(startPos + offset1) ?? findTile(startPos + offset2);
      const unit2 = findTile(startPos + offset3) ?? findTile(startPos + offset4);
      if (unit1) units.push(unit1);
      if (unit2) units.push(unit2);
    }
  
    return units;
  }

  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Hero Class: Engineer
export class Engineer extends Dwarf {
  private shieldedTarget: Hero | Crystal | null = null;

  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  // Engineer's special ability: Shield
  async special(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    playSound(this.scene, EGameSounds.ENGINEER_SHIELD_MAKE);

    // Remove old shield if one exists
    if (this.shieldedTarget) {
      playSound(this.scene, EGameSounds.ENGINEER_SHIELD_BREAK);
      this.shieldedTarget.shieldImage.setVisible(false);
      this.shieldedTarget.isShielded = false;
    }

    // Apply new shield
    this.shieldedTarget = target;
    target.isShielded = true;
    target.shieldImage.setVisible(true);

    this.context.gameController!.afterAction(EActionType.SPECIAL, this.boardPosition, target.boardPosition);
  }

  // Override the racial passive to apply double benefits
  applyTilePassive(): void {
    const tile = this.getTile();
    if (!tile) return;

    // Apply double the racial passive based on the tile type
    switch (tile.tileType) {
      case ETiles.POWER:
        this.basePower += 240;
        break;
      case ETiles.PHYSICAL_RESISTANCE:
        this.basePhysicalDamageResistance += (this.basePhysicalDamageResistance * 0.48);
        break;
      case ETiles.MAGICAL_RESISTANCE:
        this.baseMagicalDamageResistance += (this.baseMagicalDamageResistance * 0.48);
        break;
      case ETiles.CRYSTAL_DAMAGE:
        this.basePower += 720;
        break;
      case ETiles.SPEED:
        this.movement += 4;
        break;
    }
    this.unitCard.updateCardData(this);
    this.updateTileData();
  }

  attack(target: Hero | Crystal): void {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    playSound(this.scene, EGameSounds.ENGINEER_ATTACK);
    target.getsDamaged(this.getTotalPower(), this.attackType);

    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void { };
}

// Hero Class: Annihilator
export class Annihilator extends Dwarf {
  constructor(context: GameScene, data: IHero, tile?: Tile) {
    super(context, data, tile);
  }

  async attack(target: Hero | Crystal): Promise<void> {
    this.flashActingUnit();
    turnIfBehind(this.context, this, target);
    playSound(this.scene, EGameSounds.ANNIHILATOR_SHOOT);

    const damage = this.getTotalPower();
    const splashDamage = damage * 0.2;

    // Apply debuff to main target
    if (!target.annihilatorDebuff) {
      target.physicalDamageResistance -= 50;
    }
    target.annihilatorDebuff = true;
    target.annihilatorDebuffImage.setVisible(true);
    target.unitCard.updateCardData(target as any); // stupid compiler
    target.getsDamaged(damage, this.attackType);

    // Apply AoE splash damage and knockback
    const aoeTiles = getAOETiles(this.context, this, target.getTile(), false);
    const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];   
    let enemiesToPush: Hero[] = []
    allTiles.forEach(tile => {
      const unit =
        this.context.gameController!.board.units.find(u => u.boardPosition === tile.boardPosition) ||
        this.context.gameController!.board.crystals.find(c => c.boardPosition === tile.boardPosition);

      if (unit && unit.belongsTo !== this.belongsTo && unit !== target) {
        unit.getsDamaged(splashDamage, this.attackType);
        
        if (unit instanceof Hero) {
          enemiesToPush.push(unit);
        }
      }
    });
    // so paladin aura isn't removed before damaging
    enemiesToPush.forEach(enemy => {
      this.context.gameController!.pushEnemy(target, enemy);
    });


    this.removeAttackModifiers();
    this.context.gameController!.afterAction(EActionType.ATTACK, this.boardPosition, target.boardPosition);
  }

  heal(_target: Hero): void { };
  special(_target: Hero): void {};}

// Upgrades and Consumables
// --- UPGRADES ---
export class Sword extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.basePower *= 1.5;
    target.unitCard.updateCardData(target);
    target.updateTileData();
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class DragonScale extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }

  use(target: Hero): void {
    target.equipFactionBuff(this.boardPosition);
    this.removeFromGame();
  }
}

export class Helm extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.baseMagicalDamageResistance += 20;
    target.increaseMaxHealth(target.baseHealth * 0.1);
    target.unitCard.updateCardData(target);
    target.updateTileData();
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class DwarvenBrew extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(target: Hero): void {
    target.getsHealed(1000);
    target.isDrunk = true;
    target.physicalDamageResistance += 50;
    target.magicalDamageResistance += 50;
    target.unitCard.updateCardData(target);
    target.updateTileData();
    playSound(this.scene, EGameSounds.BREW_USE);
    this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
    this.removeFromGame();
  }
}

export class Pulverizer extends Item {
  constructor(context: GameScene, data: IItem) {
    super(context, data);
  }
  use(targetTile: Tile): void {
    const target = this.context.gameController!.board.getUnitFromTile(targetTile);
    const damage = 600;

    // Apply damage to main target
    if (target){
      const totalDamage = target.getsDamaged(damage, EAttackType.PHYSICAL);
      playSound(this.scene, EGameSounds.DRILL_USE);
  
      // If target is a hero, destroy team-specific equipment
      if (target instanceof Hero && target.factionBuff) {
        target.factionBuff = false;
        target.factionBuffImage.setVisible(false);
        target.characterImage.setTexture(target.updateCharacterImage());
        target.increaseMaxHealth(target.baseHealth * -0.1);
    
        target.unitCard.updateCardData(target);
        target.updateTileData();
      }
  
      // AoE splash logic for crystals
      else if (target instanceof Crystal) {
        const splashDamage = totalDamage * 0.333;
        const aoeTiles = getAOETiles(this.context, this, targetTile, false);
        const allTiles = [...aoeTiles.heroTiles, ...aoeTiles.crystalTiles];
  
        allTiles.forEach(tile => {
          const unit = this.context.gameController!.board.getUnitFromTile(tile);
  
          if (unit && unit !== target) unit.getsDamaged(splashDamage, EAttackType.PHYSICAL);
        });
      }
  
      this.context.gameController!.afterAction(EActionType.USE, this.boardPosition, target.boardPosition);
      this.removeFromGame();
    }
  }
}