import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class ChaosShard extends BaseAbility {
  constructor() {
    super("Hexis", "Chaos Shard");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 19;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Random elemental effect each cast
    const effects = [
      { name: "Burn", type: "dot", duration: 3.0, value: 4, tickInterval: 1.0 },
      { name: "Freeze", type: "debuff", duration: 2.0, value: 0.5 },
      { name: "Shock", type: "debuff", duration: 1.5, value: 0.8 },
      { name: "Poison", type: "dot", duration: 4.0, value: 3, tickInterval: 1.0 },
      { name: "Stone Weakness", type: "debuff", duration: 3.0, value: 0.7 },
    ];

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    this.applyStatusToTargets(context, randomEffect as any);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "system",
      source: context.caster.id,
      target: context.targets[0]?.id,
      message: `CHAOS! Random ${randomEffect.name} effect applied!`,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Chaos Shard",
      message: `${context.caster.character.name} hurls a crystalline projectile with unpredictable properties`,
    });
  }
}

export class DivineCorruption extends BaseAbility {
  constructor() {
    super("Hexis", "Divine Corruption");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 36;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Heal enemy but apply strong poison
    this.applyHeal(context, 20, false); // Heal target

    // Apply strong poison
    context.applyStatusEffect(target, {
      name: "Divine Poison",
      type: "dot",
      duration: 6.0,
      value: 12, // Strong poison damage
      tickInterval: 1.0,
    });

    context.dealDamage(context.caster, target, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Divine Corruption",
      message: `${context.caster.character.name} gives a twisted blessing that heals before destroying`,
    });
  }
}

export class GeometricPrison extends BaseAbility {
  constructor() {
    super("Hexis", "Geometric Prison");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Trap enemy for 4 seconds
    this.applyStatusToTargets(context, {
      name: "Geometric Prison",
      type: "debuff",
      duration: 4.0,
      value: 0, // Complete immobilization
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Geometric Prison",
      message: `${context.caster.character.name} creates an inescapable geometric prison`,
    });
  }
}

export class ChaosSingularity extends BaseAbility {
  constructor() {
    super("Hexis", "Chaos Singularity");
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

    // Randomly apply all status effects to all enemies
    const allEffects = [
      { name: "Burn", type: "dot", duration: 5.0, value: 8, tickInterval: 1.0 },
      { name: "Freeze", type: "debuff", duration: 3.0, value: 0.5 },
      { name: "Poison", type: "dot", duration: 6.0, value: 10, tickInterval: 1.0 },
      { name: "Disorientation", type: "debuff", duration: 4.0, value: 0.6 },
      { name: "Weakness", type: "debuff", duration: 5.0, value: 0.7 },
    ];

    for (const enemy of enemies) {
      if (enemy.isAlive) {
        // Apply 2-3 random effects to each enemy
        const numEffects = Math.floor(Math.random() * 2) + 2; // 2-3 effects
        const shuffled = [...allEffects].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numEffects && i < shuffled.length; i++) {
          context.applyStatusEffect(enemy, shuffled[i] as any);
        }
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Chaos Singularity",
      message: `${context.caster.character.name} creates a point of pure chaos that affects everything`,
    });
  }
}
