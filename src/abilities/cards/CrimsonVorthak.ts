import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class FlameSlash extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Flame Slash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 22; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply burn effect for 5 damage over 3 seconds
    this.applyStatusToTargets(context, {
      name: "Burn",
      type: "dot",
      duration: 3.0,
      value: 5, // Burns for 5 damage over 3 seconds as per SoulBeast data
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Flame Slash",
      message: `${context.caster.character.name} slashes with burning claws, igniting the enemy`,
    });
  }
}

export class DemonicRoar extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Demonic Roar");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15; // Fallback to original value
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply damage reduction debuff to all enemies (30% damage reduction for 4 seconds)
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Weakened",
          type: "debuff",
          duration: 4.0,
          value: 0.7, // 30% damage reduction
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Demonic Roar",
      message: `${context.caster.character.name} lets out a terrifying roar, weakening all enemies`,
    });
  }
}

export class InfernalExecution extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Infernal Execution");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 45; // Fallback to original value
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    let damage = baseDamage;
    
    // Execute effect: +50% damage if target is below 40% HP
    const healthPercentage = target.hp / target.maxHp;
    if (healthPercentage < 0.4) {
      damage = Math.floor(baseDamage * 1.5); // 50% more damage for low health targets
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: "EXECUTE! Infernal Execution deals devastating damage to wounded enemy!",
      });
    }

    context.dealDamage(context.caster, target, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Infernal Execution",
      message: `${context.caster.character.name} channels demonic power for a devastating strike`,
    });
  }
}

export class RoseOfDestruction extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Rose of Destruction");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 70; // Fallback to original value
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create fire field that deals 10 damage/second for 5 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Fire Field",
          type: "dot",
          duration: 5.0,
          value: 10, // 10 damage per second
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Rose of Destruction",
      message: `${context.caster.character.name} blooms a deadly rose of fire that burns the battlefield`,
    });
  }
}
