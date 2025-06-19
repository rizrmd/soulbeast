import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class NightmareFrost extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Nightmare Frost");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 18; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply slow effect for 2 seconds
    this.applyStatusToTargets(context, {
      name: "Slow",
      type: "debuff",
      duration: 2.0,
      value: 0.7, // 30% speed reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Nightmare Frost",
      message: `${context.caster.character.name} uses Nightmare Frost, slowing the enemy with demonic frost`,
    });
  }
}

export class CrystalPrison extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Crystal Prison");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply stun effect for 1.5 seconds
    this.applyStatusToTargets(context, {
      name: "Stun",
      type: "debuff",
      duration: 1.5,
      value: 0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Crystal Prison",
      message: `${context.caster.character.name} traps the enemy in crystalline ice`,
    });
  }
}

export class AbyssalTide extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Abyssal Tide");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35; // Fallback to original value
    
    // Deal damage to all enemies
    this.applyDamage(context, damage);

    // Heal self for 15 HP
    this.applyHeal(context, 15, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Abyssal Tide",
      message: `${context.caster.character.name} summons dark waters that damage all foes and restore vitality`,
    });
  }
}

export class NightmareHunt extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Nightmare Hunt");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 60; // Fallback to original value
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply cooldown reduction effect to caster (next 2 abilities have 50% reduced cooldown)
    this.applyStatusToCaster(context, {
      name: "Nightmare Hunt Boost",
      type: "buff",
      duration: 10.0, // Duration to apply the cooldown reduction
      value: 0.5, // 50% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Nightmare Hunt",
      message: `${context.caster.character.name} enters a hunting frenzy, unleashing rapid attacks`,
    });
  }
}
