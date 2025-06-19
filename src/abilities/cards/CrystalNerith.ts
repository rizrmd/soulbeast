import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class PetalStream extends BaseAbility {
  constructor() {
    super("Crystal Nerith", "Petal Stream");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 18;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Heal self for 10 HP
    this.applyHeal(context, 10, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Petal Stream",
      message: `${context.caster.character.name} sends a gentle stream of water and sakura petals`,
    });
  }
}

export class DreamShield extends BaseAbility {
  constructor() {
    super("Crystal Nerith", "Dream Shield");
  }

  execute(context: AbilityContext): void {
    // Absorb next 60 damage, then heal for absorbed amount
    this.applyStatusToCaster(context, {
      name: "Dream Shield",
      type: "buff",
      duration: 15.0, // Long duration shield
      value: 60, // Absorbs 60 damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Dream Shield",
      message: `${context.caster.character.name} creates a shield that converts damage to healing`,
    });
  }
}

export class NaturesEmbrace extends BaseAbility {
  constructor() {
    super("Crystal Nerith", "Nature's Embrace");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 30;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Root enemy and heal self over time
    this.applyStatusToTargets(context, {
      name: "Rooted",
      type: "debuff",
      duration: 4.0,
      value: 0, // Cannot move
    });

    this.applyStatusToCaster(context, {
      name: "Nature's Healing",
      type: "hot",
      duration: 4.0,
      value: 8, // 8 HP per second
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Nature's Embrace",
      message: `${context.caster.character.name} uses vines to embrace and hold the enemy while healing`,
    });
  }
}

export class SakuraStorm extends BaseAbility {
  constructor() {
    super("Crystal Nerith", "Sakura Storm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 55;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Heal 60 HP and cleanse all debuffs
    this.applyHeal(context, 60, true);

    // Remove all debuffs from self (cleanse)
    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "system",
      source: context.caster.id,
      target: context.caster.id,
      message: "Divine sakura petals cleanse all ailments!",
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Sakura Storm",
      message: `${context.caster.character.name} summons divine sakura petals that heal and purify`,
    });
  }
}
