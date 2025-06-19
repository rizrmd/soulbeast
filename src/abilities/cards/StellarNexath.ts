import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class Starlight extends BaseAbility {
  constructor() {
    super("Stellar Nexath", "Starlight");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 22;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Restore 6 HP
    this.applyHeal(context, 6, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Starlight",
      message: `${context.caster.character.name} channels gentle starlight that heals while harming enemies`,
    });
  }
}

export class CosmicWinds extends BaseAbility {
  constructor() {
    super("Stellar Nexath", "Cosmic Winds");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 33;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Increase ability speed by 50%
    this.applyStatusToCaster(context, {
      name: "Cosmic Speed",
      type: "buff",
      duration: 8.0,
      value: 1.5, // 50% ability speed increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Cosmic Winds",
      message: `${context.caster.character.name} rides stellar winds for enhanced agility`,
    });
  }
}

export class LifeWeb extends BaseAbility {
  constructor() {
    super("Stellar Nexath", "Life Web");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Connect to enemy, sharing all damage taken
    this.applyStatusToTargets(context, {
      name: "Life Web Connection",
      type: "debuff",
      duration: 8.0,
      value: 1.0, // Share all damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Life Web",
      message: `${context.caster.character.name} creates a mystical bond that shares pain`,
    });
  }
}

export class GalaxyDance extends BaseAbility {
  constructor() {
    super("Stellar Nexath", "Galaxy Dance");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 60;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Hit 5 times over 3 seconds, each hit stronger
    const hits = 5;
    for (let i = 0; i < hits; i++) {
      const hitDamage = Math.floor(baseDamage * (1 + i * 0.2)); // Each hit 20% stronger
      
      setTimeout(() => {
        if (target.isAlive) {
          context.dealDamage(context.caster, target, hitDamage);
          context.addEvent({
            timestamp: context.getCurrentTime(),
            type: "system",
            source: context.caster.id,
            target: target.id,
            message: `Galaxy Dance hit ${i + 1}/5 - ${hitDamage} damage!`,
          });
        }
      }, i * 600); // 0.6 seconds between hits
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Galaxy Dance",
      message: `${context.caster.character.name} dances through space-time, striking multiple times`,
    });
  }
}
