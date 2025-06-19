import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class VoidWind extends BaseAbility {
  constructor() {
    super("Astrix", "Void Wind");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 21; // Fallback to original value

    // Temporarily remove armor for this attack (ignores 100% of armor)
    const originalArmor = target.armor;
    target.armor = 0;
    
    context.dealDamage(context.caster, target, damage);
    
    target.armor = originalArmor; // Restore armor

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Void Wind",
      message: `${context.caster.character.name} strikes with void-infused wind that bypasses all armor`,
    });
  }
}

export class DivinePunishment extends BaseAbility {
  constructor() {
    super("Astrix", "Divine Punishment");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    let damage = abilityData?.damage ?? 38; // Fallback to original value
    
    // Check if target has demon composition
    const isDemon = target.character.composition.demon && target.character.composition.demon > 0;
    if (isDemon) {
      damage = (abilityData?.damage ?? 38) * 2; // Double damage vs demon enemies (+100% damage as per effect)
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: "DIVINE WRATH! Holy power devastates the demonic enemy!",
      });
    }

    context.dealDamage(context.caster, target, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Divine Punishment",
      message: `${context.caster.character.name} channels holy power against the enemy`,
    });
  }
}

export class StellarDash extends BaseAbility {
  constructor() {
    super("Astrix", "Stellar Dash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply invulnerability during cast (brief immunity)
    this.applyStatusToCaster(context, {
      name: "Stellar Invulnerability",
      type: "buff",
      duration: abilityData?.castTime ?? 2.1, // Duration of cast time
      value: 1.0, // Full immunity
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Stellar Dash",
      message: `${context.caster.character.name} dashes at light speed, becoming invulnerable to all attacks`,
    });
  }
}

export class ParadoxStorm extends BaseAbility {
  constructor() {
    super("Astrix", "Paradox Storm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const enemies = this.getEnemyTeam(context);
    
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        let damage = abilityData?.damage ?? 65; // Fallback to original value
        
        // Deal divine damage to demons, demon damage to divine
        const isDemon = enemy.character.composition.demon && enemy.character.composition.demon > 0;
        const isDivine = enemy.character.composition.divine && enemy.character.composition.divine > 0;
        
        if (isDemon || isDivine) {
          // The effect description mentions dealing opposite damage types, 
          // we'll interpret this as increased effectiveness
          damage = Math.floor((abilityData?.damage ?? 65) * 1.4); // 40% more damage for paradox effect
          context.addEvent({
            timestamp: context.getCurrentTime(),
            type: "system",
            source: context.caster.id,
            target: enemy.id,
            message: `PARADOX! Contradictory energies devastate ${enemy.character.name}!`,
          });
        }
        
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Paradox Storm",
      message: `${context.caster.character.name} creates a storm of contradictory energies!`,
    });
  }
}
