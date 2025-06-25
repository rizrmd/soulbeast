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
    this.applyStatusToTargets(context, this.createDamageReductionEffect("Slow", 0.7, 2.0));

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
    
    // Deal damage to single enemy
    this.applyDamage(context, damage);

    // Apply cooldown reduction effect to caster (next 2 abilities have 50% reduced cooldown)
    this.applyStatusToCaster(context, {
      name: "Nightmare Hunt Boost",
      type: "buff",
      duration: 10.0,
      value: 0.5, // 50% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Nightmare Hunt",
      message: `${context.caster.character.name} enters a hunting frenzy, unleashing rapid attacks`,
    });
  }
}

export class DemonicHaste extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Demonic Haste");
  }

  execute(context: AbilityContext): void {
    // Passive ability - gain 15% evasion after using an ability
    this.applyStatusToCaster(context, {
      name: "Demonic Haste",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.15, // 15% evasion
      behaviors: {
        evasion: true,
      },
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Demonic Haste",
      message: `${context.caster.character.name} gains demonic speed`,
    });
  }
}

export class IceShard extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Ice Shard");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 12;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Lower enemy's frost resistance
    this.applyStatusToTargets(context, {
      name: "Frost Vulnerability",
      type: "debuff",
      duration: 5.0,
      value: 0.2, // 20% increased frost damage taken
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Ice Shard",
      message: `${context.caster.character.name} hurls a quick shard of ice`,
    });
  }
}

export class GlacialArmor extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Glacial Armor");
  }

  execute(context: AbilityContext): void {
    // Reduces incoming damage by 30% for 5 seconds
    this.applyStatusToCaster(context, {
      name: "Glacial Armor",
      type: "buff",
      duration: 5.0,
      value: 0.3, // 30% damage reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Glacial Armor",
      message: `${context.caster.character.name} forms a protective layer of demonic ice`,
    });
  }
}

export class FrozenWake extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Frozen Wake");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 28;
    
    // Deal damage to all enemies
    this.applyDamage(context, damage);

    // Apply minor slow to all enemies
    this.applyStatusToTargets(context, {
      name: "Frozen Wake Slow",
      type: "debuff",
      duration: 3.0,
      value: 0.8, // 20% speed reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Frozen Wake",
      message: `${context.caster.character.name} sends a wave of chilling water over all foes`,
    });
  }
}

export class Permafrost extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Permafrost");
  }

  execute(context: AbilityContext): void {
    // Passive ability - slow effects last 1 second longer
    this.applyStatusToCaster(context, {
      name: "Permafrost",
      type: "buff",
      duration: 999, // Permanent passive
      value: 1.0, // 1 second longer slow effects
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Permafrost",
      message: `${context.caster.character.name}'s chilling presence makes escape nearly impossible`,
    });
  }
}

export class Shatter extends BaseAbility {
  constructor() {
    super("Keth Stalker", "Shatter");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 50;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    let damage = baseDamage;
    
    // Check if target is stunned or frozen (double damage)
    const hasStunOrFreeze = target.statusEffects.some(effect => 
      effect.name === "Stun" || effect.name === "Frozen" || effect.name === "Crystal Prison"
    );
    
    if (hasStunOrFreeze) {
      damage = baseDamage * 2;
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "ability_used",
        source: context.caster.id,
        target: target.id,
        ability: abilityData?.name ?? "Shatter",
        message: `${context.caster.character.name} exploits the enemy's compromised state with a shattering blow (DOUBLE DAMAGE!)`,
      });
    }
    
    context.dealDamage(context.caster, target, damage);

    if (!hasStunOrFreeze) {
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "ability_used",
        source: context.caster.id,
        target: target.id,
        ability: abilityData?.name ?? "Shatter",
        message: `${context.caster.character.name} delivers a shattering blow`,
      });
    }
  }
}
