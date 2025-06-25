import { AbilityContext, AbilityImplementation } from "./types";
import { BattleEntity, StatusEffect, Ability } from "../types";
import { AllSoulBeast } from "../engine/SoulBeast";

export abstract class BaseAbility implements AbilityImplementation {
  protected characterName?: string;
  protected abilityName?: string;

  constructor(characterName?: string, abilityName?: string) {
    this.characterName = characterName;
    this.abilityName = abilityName;
  }

  abstract execute(context: AbilityContext): void;

  protected getAbilityData(): Ability | null {
    if (!this.characterName || !this.abilityName) {
      return null;
    }
    
    const character = AllSoulBeast[this.characterName as keyof typeof AllSoulBeast];
    if (!character) {
      console.warn(`Character ${this.characterName} not found in SoulBeast data`);
      return null;
    }
    
    const ability = character.abilities.find(a => a.name === this.abilityName);
    if (!ability) {
      console.warn(`Ability ${this.abilityName} not found for character ${this.characterName}`);
      return null;
    }
    
    return ability as Ability;
  }

  protected applyDamage(context: AbilityContext, damage: number): void {
    for (const target of context.targets) {
      if (target.isAlive) {
        context.dealDamage(context.caster, target, damage);
      }
    }
  }

  protected applyHeal(context: AbilityContext, amount: number, targetSelf: boolean = true): void {
    const healTarget = targetSelf ? context.caster : context.targets[0];
    if (healTarget) {
      context.heal(healTarget, amount);
    }
  }

  protected applyStatusToTargets(context: AbilityContext, effect: StatusEffect): void {
    for (const target of context.targets) {
      if (target.isAlive) {
        context.applyStatusEffect(target, effect);
      }
    }
  }

  protected applyStatusToCaster(context: AbilityContext, effect: StatusEffect): void {
    context.applyStatusEffect(context.caster, effect);
  }

  // Helper methods for creating status effects with behaviors
  protected createShieldEffect(name: string, value: number, duration: number, isDreamShield: boolean = false): StatusEffect {
    return {
      name,
      type: "buff",
      duration,
      value,
      behaviors: {
        isShield: true,
        isDreamShield,
      },
      onRemove: isDreamShield ? (entity: BattleEntity, effect: StatusEffect) => {
        // Dream shield converts absorbed damage to healing
        const absorbedDamage = (effect as any).absorbedDamage || 0;
        if (absorbedDamage > 0) {
          entity.hp = Math.min(entity.maxHp, entity.hp + absorbedDamage);
        }
      } : undefined,
    };
  }

  protected createFocusEffect(name: string, multiplier: number, duration: number): StatusEffect {
    return {
      name,
      type: "buff",
      duration,
      value: multiplier,
      behaviors: {
        isFocus: true,
        damageBoost: true,
        oneTimeUse: duration >= 999,
      },
    };
  }

  protected createStunEffect(name: string, duration: number): StatusEffect {
    return {
      name,
      type: "debuff",
      duration,
      value: 0,
      behaviors: {
        preventsActions: true,
      },
    };
  }

  protected createDamageReductionEffect(name: string, reductionMultiplier: number, duration: number): StatusEffect {
    return {
      name,
      type: "buff",
      duration,
      value: reductionMultiplier,
      behaviors: {
        damageReduction: true,
      },
    };
  }

  protected createDamageBoostEffect(name: string, boostMultiplier: number, duration: number): StatusEffect {
    return {
      name,
      type: "buff",
      duration,
      value: boostMultiplier,
      behaviors: {
        damageBoost: true,
        oneTimeUse: duration >= 999,
      },
    };
  }

  protected createPermanentEffect(name: string, type: "buff" | "debuff", value: number, behaviors?: any): StatusEffect {
    return {
      name,
      type,
      duration: -1, // Permanent effect
      value,
      behaviors,
    };
  }

  protected createFearEffect(name: string, damageReduction: number, duration: number): StatusEffect {
    return {
      name,
      type: "debuff",
      duration,
      value: damageReduction,
      behaviors: {
        damageReduction: true,
      },
    };
  }

  protected getEnemyTeam(context: AbilityContext): BattleEntity[] {
    const casterTeam = context.caster.id.startsWith("player1_") ? "player1" : "player2";
    const enemyTeam = casterTeam === "player1" ? "player2" : "player1";
    
    return Array.from(context.allEntities.values()).filter(
      entity => entity.id.startsWith(enemyTeam + "_") && entity.isAlive
    );
  }

  protected getAllyTeam(context: AbilityContext): BattleEntity[] {
    const casterTeam = context.caster.id.startsWith("player1_") ? "player1" : "player2";
    
    return Array.from(context.allEntities.values()).filter(
      entity => entity.id.startsWith(casterTeam + "_") && entity.isAlive && entity.id !== context.caster.id
    );
  }
}
