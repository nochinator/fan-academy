import { EEffect, EFaction, EGameSounds, EUnitEvent, EUnitTypes } from "../enums/gameEnums";
import GameScene from "../scenes/game.scene";
import { playSound } from "../utils/gameUtils";
import { Unit } from "./unit";
import { IEffect } from "../interfaces/gameInterface";
import { Crystal } from "./crystal";

export abstract class Effect {
  context: GameScene;
  target: Unit;
  name: EEffect;
  duration: number;
  triggers: EUnitEvent[];
  priority: number;
  potency: number;

  constructor(context: GameScene, target: Unit, name: EEffect, duration: number, triggers: EUnitEvent[], potency = 0, priority = 0) {
    this.context = context;
    this.target = target;
    this.name = name;
    this.duration = duration;
    this.triggers = triggers;
    this.priority = priority;
    this.potency = potency;
  }

  exportData(): IEffect {
    return {
      name: this.name,
      potency: this.potency,
      duration: this.duration
    }
  }

  abstract apply(): void;
  abstract remove(): void;
  onMove(): boolean { return false };
  onAttack(): boolean { return false };
  onHeal(): boolean { return false };
  onSpecial(): boolean { return false };
  onPushed(): boolean { return false };
  onHurtMagical(): boolean { return false };
  onHurtPhysical(): boolean { return false };
  onHealed(): boolean { return false };
  onEquip(): boolean { return false };
  onTurnOver(): [boolean, boolean] { return [false, false] };
  onEvent(event: EUnitEvent[]): boolean {
    let triggerd = false;
    let block = false;
  
    if (event.includes(EUnitEvent.MOVE)) {
      if (this.onMove()) block = true;
      triggerd = true;
      console.log(event);
    } else if (event.includes(EUnitEvent.ATTACK)) {
      if (this.onAttack()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.HEAL)) {
      if (this.onHeal()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.SPECIAL)) {
      if (this.onSpecial()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.PUSHED)) {
      if (this.onPushed()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.HURT_MAGICAL)) {
      if (this.onHurtMagical()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.HURT_PHYSICAL)) {
      if (this.onHurtPhysical()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.HEALED)) {
      if (this.onHealed()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.EQUIP)) {
      if (this.onEquip()) block = true;
      triggerd = true;
    } else if (event.includes(EUnitEvent.TURN_OVER)) {
      const [shouldBlock, shouldTrigger] = this.onTurnOver()
      if (shouldBlock) block = true;
      if (shouldTrigger) triggerd = true;
    }
  
    if (triggerd) {
      this.duration--;
      if (this.duration === 0) {
        this.target.removeEffect(this);
      }
      this.target.unitCard.updateCardData(this.target.exportData());
    }
    return block
  };
}

export class RuneMetalEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.RUNE_METAL_EQUIPMENT, -1, []);
  }

  apply(): void {
    playSound(this.context, EGameSounds.RUNE_METAL_USE)
    this.target.runeMetalImage?.setVisible(true);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.powerMultiplier.set('runeMetal', 1.5);
  }

  remove(): void {
    this.target.runeMetalImage?.setVisible(false);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.powerMultiplier.set('runeMetal', 1);
  }
}

export class HelmEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.HELM_EQUIPMENT, -1, []);
  }

  apply(): void {
    playSound(this.context, EGameSounds.ITEM_USE);
    this.target.shiningHelmImage?.setVisible(true);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * 0.1)
    this.target.magicalDamageResistance += 20;
  }

  remove(): void {
    this.target.shiningHelmImage?.setVisible(false);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * -0.1)
    this.target.magicalDamageResistance -= 20;
  }
}

export class DragonScaleEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.DRAGON_SCALE_EQUIPMENT, -1, []);
  }

  apply(): void {
    playSound(this.context, EGameSounds.DRAGON_SCALE_USE)
    this.target.factionBuffImage?.setVisible(true);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * 0.1)
    this.target.physicalDamageResistance += 20;
    this.context.sound.play(EGameSounds.DRAGON_SCALE_USE);
  }

  remove(): void {
    this.target.factionBuffImage?.setVisible(false);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * -0.1)
    this.target.physicalDamageResistance -= 20;
  }
}

// TODO: life steal increase
export class SoulStoneEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.SOUL_STONE_EQUIPMENT, -1, []);
  }

  apply(): void {
    playSound(this.context, EGameSounds.ITEM_USE)
    this.target.factionBuffImage?.setVisible(true);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * 0.1)
    this.target.physicalDamageResistance += 20;
  }

  remove(): void {
    this.target.factionBuffImage?.setVisible(false);
    this.target.characterImage.setTexture(this.target.updateCharacterImage());
    this.target.increaseMaxHealth(this.target.baseHealth * -0.1)
    this.target.physicalDamageResistance -= 20;
  }
}

export class ManaVialEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.MANA_VIAL_BUFF, -1, []);
  }

  apply(): void {
    playSound(this.context, EGameSounds.POTION_USE)
    const manaVialBuff = this.target.hasEffect(EEffect.MANA_VIAL_BUFF);
    if (manaVialBuff) {
      this.target.maxHealth += 50
    }
    this.target.getsHealed(1000);
  }

  remove(): void {
    this.target.maxHealth -= 50
  }
}

export class dwarvernBrewEquipment extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.DRUNK_BUFF, -1, [EUnitEvent.HURT_MAGICAL, EUnitEvent.HURT_PHYSICAL]);
  }

  apply(): void {
    playSound(this.context, EGameSounds.BREW_USE)
    this.target.getsHealed(1000);
    this.target.physicalDamageResistance += 50;
    this.target.magicalDamageResistance += 50;  }

  remove(): void {
    this.target.physicalDamageResistance -= 50;
    this.target.magicalDamageResistance -= 50;  }
}

export class SuperChargeBuff extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.SUPERCHARGED_BUFF, 1, [EUnitEvent.ATTACK]);
  }

  apply(): void {
    playSound(this.context, EGameSounds.SCROLL_USE)
    this.target.superChargeAnim?.setVisible(true);
    this.target.powerMultiplier.set('superCharge', 3);
  }

  remove(): void {
    this.target.superChargeAnim?.setVisible(false);
    this.target.powerMultiplier.set('superCharge', 0);
  }
}

export class CrystalTileEffect extends Effect {
  constructor(scene: GameScene, target: Unit, potency = 300) {
    super(scene, target, EEffect.CRYSTAL_TILE_EFFECT, 1, [EUnitEvent.MOVE, EUnitEvent.PUSHED], potency);
    
    if (target.faction === EFaction.DWARVES) {
      this.potency = 360;
      if (target.type === EUnitTypes.ENGINEER) {
        this.potency = 420;
      }
    }
  }

  apply(): void {
    if (this.target instanceof Crystal) {
      let newLevel: number = this.target.hasEffect(EEffect.CRYSTAL_TILE_EFFECT) + 1;
      this.target.updateDebuffAnimation(newLevel);
    } else {
      this.target.crystalDebuffTileAnim.setVisible(false);
      this.context.gameController.board.crystals.forEach(crystal => {
        if (crystal.belongsTo !== this.target.belongsTo) {
          crystal.applyEffect(new CrystalTileEffect(this.context, crystal, this.potency));
        }
      });
    }
  }

  remove(): void {
    if (this.target instanceof Crystal) {
      let newLevel: number = this.target.hasEffect(EEffect.CRYSTAL_TILE_EFFECT); // effect is removed before remove function is called
      this.target.updateDebuffAnimation(newLevel);
    } else {
      this.context.gameController.board.crystals.forEach(crystal => {
        if (crystal.belongsTo !== this.target.belongsTo) {
          for (const effect of crystal.getEffect(EEffect.CRYSTAL_TILE_EFFECT, true)) {
            if (effect.potency === this.potency) {
              crystal.removeEffect(effect);
              break; // only remove one matching effect
            }
          }
        }
      });
    }
  }
}

export class PhysicalTileEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.PHYSICAL_TILE_BUFF, -1, [EUnitEvent.MOVE, EUnitEvent.PUSHED], 20);
    
    if (this.target.faction === EFaction.DWARVES) {
      this.potency = 24;
      if (this.target.type === EUnitTypes.ENGINEER) {
        this.potency = 28;
      }
    }
  }

  apply(): void {
    playSound(this.context, EGameSounds.SHIELD_TILE)
    this.target.physicalResistanceTileAnim.setVisible(true);
    this.target.physicalDamageResistance += this.potency;
  }

  remove(): void {
    this.target.physicalResistanceTileAnim.setVisible(false);
    this.target.physicalDamageResistance -= this.potency;
  }
}

export class MagicalTileEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.PHYSICAL_TILE_BUFF, -1, [EUnitEvent.MOVE, EUnitEvent.PUSHED], 20);
    
    if (this.target.faction === EFaction.DWARVES) {
      this.potency = 24;
      if (this.target.type === EUnitTypes.ENGINEER) {
        this.potency = 28;
      }
    }
  }

  apply(): void {
    playSound(this.context, EGameSounds.HELM_TILE)
    this.target.magicalResistanceTileAnim.setVisible(true);
    this.target.magicalDamageResistance += this.potency;
  }

  remove(): void {
    this.target.magicalResistanceTileAnim.setVisible(false);
    this.target.magicalDamageResistance -= this.potency;
  }
}

export class PowerTileEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.PHYSICAL_TILE_BUFF, -1, [EUnitEvent.MOVE, EUnitEvent.PUSHED], 100);
    
    if (this.target.faction === EFaction.DWARVES) {
      this.potency = 120;
      if (this.target.type === EUnitTypes.ENGINEER) {
        this.potency = 140;
      }
    }
  }

  apply(): void {
    playSound(this.context, EGameSounds.SWORD_TILE)
    this.target.powerTileAnim.setVisible(true);
    this.target.basePower += this.potency;
  }

  remove(): void {
    this.target.powerTileAnim.setVisible(false);
    this.target.magicalDamageResistance -= this.potency;
  }
}

export class SpeedTileEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.SPEED_TILE_BUFF, 1, [EUnitEvent.MOVE, EUnitEvent.PUSHED], 2);
    
    if (target.faction === EFaction.DWARVES) {
      this.potency = 3;
      if (target.type === EUnitTypes.ENGINEER) {
        this.potency = 4;
      }
    } else if (target.faction === EFaction.CRYSTAL) {
      this.potency = 1; // future mechanic
    }
  }

  apply(): void {
    playSound(this.context, EGameSounds.HELM_TILE)
    this.target.magicalResistanceTileAnim.setVisible(true);
    this.target.movement += this.potency;
  }

  remove(): void {
    this.target.magicalResistanceTileAnim.setVisible(false);
    this.target.movement -= this.potency;
  }
}

export class ShiledBuff extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.SHIELD_BUFF, 1, [EUnitEvent.HURT_MAGICAL, EUnitEvent.HURT_PHYSICAL], -1);
  }

  apply(): void {
    playSound(this.context, EGameSounds.ENGINEER_SHIELD_MAKE);
    this.target.shieldImage?.setVisible(true);
    this.target.physicalDamageResistance += 1000;
    this.target.magicalDamageResistance += 1000;
  }

  onHurtMagical(): boolean {
    return true
  }

  onHurtPhysical(): boolean {
    return true
  }

  remove(): void {
    playSound(this.context, EGameSounds.ENGINEER_SHIELD_BREAK);
    this.target.shieldImage?.setVisible(false);
    this.target.physicalDamageResistance -= 1000;
    this.target.magicalDamageResistance -= 1000;
  }
}

export class PaladinBuff extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.PALADIN_BUFF, -1, [EUnitEvent.MOVE, EUnitEvent.PUSHED]);
  }

  apply(): void {
    this.target.physicalDamageResistance += 5;
    this.target.magicalDamageResistance += 5;
    this.target.powerMultiplier.set('paladinBuff', (this.target.powerMultiplier.get('paladinBuff') ?? 1.0) + 0.05);
  }

  onMove(): boolean {
    this.target.removeEffect(this)
    return false
  }

  remove(): void {
    this.target.physicalDamageResistance -= 5;
    this.target.magicalDamageResistance -= 5;
    this.target.powerMultiplier.set('paladinBuff', (this.target.powerMultiplier.get('paladinBuff') ?? 1.0) - 0.05);
  }
}

export class ConsumeBuff extends Effect {
  constructor(scene: GameScene, target: Unit, potency = 1) {
    super(scene, target, EEffect.SPEED_TILE_BUFF, -1, [], potency);
  }

  apply(): void {
    let oldEffect = this.target.getEffect(EEffect.CONSUME_BUFF);
    if (oldEffect) {
      this.potency = oldEffect.potency;
      if (this.potency < 3) this.potency += 1
      else this.target.getsHealed(100, true);
      this.target.removeEffect(oldEffect);
    }
    this.target.baseHealth += 100 * this.potency;
    this.target.basePower += 50 * this.potency;
  }

  remove(): void {
    this.target.baseHealth -= 100 * this.potency;
    this.target.basePower -= 50 * this.potency;
  }
}

export class AnnihilatorDebuffEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.ANNIHILATOR_DEBUFF, 1, [EUnitEvent.HURT_PHYSICAL]);
  }

  apply(): void {
    this.target.physicalDamageResistance -= 50;
    this.target.annihilatorDebuffImage?.setVisible(true);
  }

  remove(): void {
    this.target.physicalDamageResistance += 50;
    this.target.annihilatorDebuffImage?.setVisible(false);
  }
}

export class PriestessDebuffEffect extends Effect {
  constructor(scene: GameScene, target: Unit) {
    super(scene, target, EEffect.PRIESTESS_DEBUFF, 1, [EUnitEvent.ATTACK]);
  }

  apply(): void {
    this.target.priestessDebuffImage?.setVisible(true);
    this.target.powerMultiplier.set('priestessDebuff', 0.5);
  }

  remove(): void {
    this.target.priestessDebuffImage?.setVisible(false);
    this.target.powerMultiplier.set('priestessDebuff', 1);
  }
}


