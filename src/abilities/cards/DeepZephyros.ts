import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class MindLash extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mind Lash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Reduce enemy accuracy by 25% for 4 seconds
    this.applyStatusToTargets(context, {
      name: "Disrupted Focus",
      type: "debuff",
      duration: 4.0,
      value: 0.75, // 25% accuracy reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Mind Lash",
      message: `${context.caster.character.name} strikes with psychic energy, disrupting enemy focus`,
    });
  }
}

export class BestialSurge extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Bestial Surge");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    
    // Deal damage to self (bestial power comes at a cost)
    this.applyDamage(context, damage);

    // Reduce ability cooldowns by 20% for 5 seconds
    this.applyStatusToCaster(context, {
      name: "Bestial Surge",
      type: "buff",
      duration: 5.0,
      value: 0.8, // 20% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Bestial Surge",
      message: `${context.caster.character.name} channels primal instincts for rapid ability casting`,
    });
  }
}

export class AbyssalDrain extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Abyssal Drain");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 32;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;
    
    // Deal damage
    context.dealDamage(context.caster, target, damage);

    // Steal 20 HP from enemy
    const stolenHp = Math.min(20, target.hp);
    this.applyHeal(context, stolenHp, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Abyssal Drain",
      message: `${context.caster.character.name} drains life force through demonic waters`,
    });
  }
}

export class MindBreak extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mind Break");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 65;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Enemy abilities have double cooldown for 8 seconds
    this.applyStatusToTargets(context, {
      name: "Mind Broken",
      type: "debuff",
      duration: 8.0,
      value: 2.0, // Double cooldown
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Mind Break",
      message: `${context.caster.character.name} shatters the enemy psyche, disrupting their abilities`,
    });
  }
}
