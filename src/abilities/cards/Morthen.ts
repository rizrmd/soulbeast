import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class FrostBite extends BaseAbility {
  constructor() {
    super("Morthen", "Frost Bite");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Increase enemy ability cooldowns by 30% for 3 seconds
    this.applyStatusToTargets(context, {
      name: "Frost Slow",
      type: "debuff",
      duration: 3.0,
      value: 1.3, // 30% longer cooldowns
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Frost Bite",
      message: `${context.caster.character.name} delivers a chilling bite that numbs the target's reflexes`,
    });
  }
}

export class SilentStrike extends BaseAbility {
  constructor() {
    super("Morthen", "Silent Strike");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 40;
    
    // Cannot be dodged or blocked - deal damage directly
    this.applyDamage(context, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Silent Strike",
      message: `${context.caster.character.name} moves like the wind to deliver an unavoidable strike`,
    });
  }
}

export class PredatorsFocus extends BaseAbility {
  constructor() {
    super("Morthen", "Predator's Focus");
  }

  execute(context: AbilityContext): void {
    // Next ability deals triple damage
    this.applyStatusToCaster(context, {
      name: "Predator's Focus",
      type: "buff",
      duration: 10.0, // Duration to apply the damage boost
      value: 3.0, // Triple damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Predator's Focus",
      message: `${context.caster.character.name} focuses hunting instincts for a devastating attack`,
    });
  }
}

export class AbsoluteZero extends BaseAbility {
  constructor() {
    super("Morthen", "Absolute Zero");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 70;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Freeze enemy for 3 seconds
    this.applyStatusToTargets(context, {
      name: "Frozen",
      type: "debuff",
      duration: 3.0,
      value: 0, // Complete immobilization
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Absolute Zero",
      message: `${context.caster.character.name} brings the temperature to absolute zero, freezing the enemy solid`,
    });
  }
}
