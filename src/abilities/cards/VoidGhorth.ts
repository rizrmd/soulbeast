import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class SavageSplash extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Savage Splash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 19;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Heal self for 8 HP
    this.applyHeal(context, 8, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Savage Splash",
      message: `${context.caster.character.name} attacks with healing waters`,
    });
  }
}

export class DimensionalBite extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Dimensional Bite");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Ignores 100% of enemy armor
    const originalArmor = target.armor;
    target.armor = 0;
    
    context.dealDamage(context.caster, target, damage);
    
    target.armor = originalArmor;

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Dimensional Bite",
      message: `${context.caster.character.name} phases through dimensions to deliver a devastating bite`,
    });
  }
}

export class TerrorHowl extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Terror Howl");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Reduce enemy damage output by 50% for 3 seconds (terror effect)
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Terror",
          type: "debuff",
          duration: 3.0,
          value: 0.5,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Terror Howl",
      message: `${context.caster.character.name} lets out a horrifying roar that disorients enemies`,
    });
  }
}

export class VoidTsunami extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Void Tsunami");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 75;
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create void zones that deal 12 damage/second
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Void Zone",
          type: "dot",
          duration: 5.0,
          value: 12,
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Void Tsunami",
      message: `${context.caster.character.name} summons dimensional water that tears reality apart`,
    });
  }
}
