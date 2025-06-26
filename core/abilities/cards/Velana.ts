import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class ThornWhip extends BaseAbility {
  constructor() {
    super("Velana", "Thorn Whip");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 21;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Pull enemy closer (positioning effect)
    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "system",
      source: context.caster.id,
      target: context.targets[0]?.id,
      message: "Thorny vine pulls the enemy closer!",
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Thorn Whip",
      message: `${context.caster.character.name} lashes with thorny vines that drag enemies`,
    });
  }
}

export class WindSeed extends BaseAbility {
  constructor() {
    super("Velana", "Wind Seed");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 28;
    
    // Initial damage
    this.applyDamage(context, damage);

    // Plants grow over 5 seconds, dealing damage each second
    this.applyStatusToTargets(context, {
      name: "Growing Plants",
      type: "dot",
      duration: 5.0,
      value: 6, // Additional damage per second
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Wind Seed",
      message: `${context.caster.character.name} plants seeds carried by wind that grow into damaging plants`,
    });
  }
}

export class FeralInstinct extends BaseAbility {
  constructor() {
    super("Velana", "Feral Instinct");
  }

  execute(context: AbilityContext): void {
    // Next 3 abilities have 50% reduced cooldown
    this.applyStatusToCaster(context, {
      name: "Feral Instinct",
      type: "buff",
      duration: 15.0,
      value: 0.5, // 50% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Feral Instinct",
      message: `${context.caster.character.name} awakens primal instincts for rapid ability use`,
    });
  }
}

export class MidnightBloom extends BaseAbility {
  constructor() {
    super("Velana", "Midnight Bloom");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 65;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create area of darkness, +50% damage in darkness for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Midnight Empowerment",
      type: "buff",
      duration: 8.0,
      value: 1.5, // 50% damage increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Midnight Bloom",
      message: `${context.caster.character.name}'s garden blooms in eternal night, empowering attacks`,
    });
  }
}
