import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class FlameBurst extends BaseAbility {
  constructor() {
    super("Ember Pyrrak", "Flame Burst");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 26; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply burn for 4 damage over 4 seconds
    this.applyStatusToTargets(context, {
      name: "Burn",
      type: "dot",
      duration: 4.0,
      value: 4,
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Flame Burst",
      message: `${context.caster.character.name} unleashes pure fire that ignites the target`,
    });
  }
}

export class MoltenClaw extends BaseAbility {
  constructor() {
    super("Ember Pyrrak", "Molten Claw");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 42; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Reduce enemy armor by 40%
    this.applyStatusToTargets(context, {
      name: "Melted Armor",
      type: "debuff",
      duration: 8.0,
      value: 0.6, // 40% armor reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Molten Claw",
      message: `${context.caster.character.name} strikes with superheated claws, melting enemy defenses`,
    });
  }
}

export class DawnsEmbrace extends BaseAbility {
  constructor() {
    super("Ember Pyrrak", "Dawn's Embrace");
  }

  execute(context: AbilityContext): void {
    // Apply healing over time - 50 HP over 5 seconds (10 HP per second)
    this.applyStatusToCaster(context, {
      name: "Dawn's Healing",
      type: "hot",
      duration: 5.0,
      value: 10, // 10 HP per second
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Dawn's Embrace",
      message: `${context.caster.character.name} channels the healing power of dawn's first light`,
    });
  }
}

export class SolarApocalypse extends BaseAbility {
  constructor() {
    super("Ember Pyrrak", "Solar Apocalypse");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 75; // Fallback to original value
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Burns all enemies for 8 damage/second for 5 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Solar Burn",
          type: "dot",
          duration: 5.0,
          value: 8, // 8 damage per second
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Solar Apocalypse",
      message: `${context.caster.character.name} brings forth the fury of a dying star!`,
    });
  }
}
