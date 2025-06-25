import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class MindLash extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mind Lash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Reduce enemy accuracy by 25% for 4 seconds
    this.applyStatusToTargets(context, {
      name: "Disrupted Focus",
      type: "debuff",
      duration: 4.0,
      value: 0.75, // 25% accuracy reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Mind Lash",
      message: `${context.caster.character.name} strikes with psychic energy, disrupting enemy focus`,
    });
  }
}

export class BestialSurge extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Bestial Surge");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    
    // Deal damage to self (bestial power comes at a cost)
    this.applyDamage(context, damage);

    // Reduce ability cooldowns by 20% for 5 seconds
    this.applyStatusToCaster(context, {
      name: "Bestial Surge",
      type: "buff",
      duration: 5.0,
      value: 0.8, // 20% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Bestial Surge",
      message: `${context.caster.character.name} channels primal instincts for rapid ability casting`,
    });
  }
}

export class AbyssalDrain extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Abyssal Drain");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 32;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;
    
    // Deal damage
    context.dealDamage(context.caster, target, damage);

    // Steal 20 HP from enemy
    const stolenHp = Math.min(20, target.hp);
    this.applyHeal(context, stolenHp, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Abyssal Drain",
      message: `${context.caster.character.name} drains life force through demonic waters`,
    });
  }
}

export class MindBreak extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mind Break");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 65;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Enemy abilities have double cooldown for 8 seconds
    this.applyStatusToTargets(context, {
      name: "Mind Broken",
      type: "debuff",
      duration: 8.0,
      value: 2.0, // Double cooldown
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Mind Break",
      message: `${context.caster.character.name} shatters the enemy psyche, disrupting their abilities`,
    });
  }
}

export class PsychicBlast extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Psychic Blast");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 42;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply mental shock - enemy takes 10% more damage for 6 seconds
    this.applyStatusToTargets(context, {
      name: "Mental Shock",
      type: "debuff",
      duration: 6.0,
      value: 1.1, // 10% increased damage taken
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Psychic Blast",
      message: `${context.caster.character.name} unleashes a wave of psychic energy`,
    });
  }
}

export class MentalFortress extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mental Fortress");
  }

  execute(context: AbilityContext): void {
    // Gain immunity to mental effects and 30% damage reduction for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Mental Fortress",
      type: "buff",
      duration: 8.0,
      value: 0.7, // 30% damage reduction
    });

    // Add mental immunity
    this.applyStatusToCaster(context, {
      name: "Mental Immunity",
      type: "buff",
      duration: 8.0,
      value: 1, // Immune to mental effects
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Mental Fortress",
      message: `${context.caster.character.name} fortifies their mind against intrusion`,
    });
  }
}

export class TidalWave extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Tidal Wave");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 38;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply soaked status - enemies take 15% more damage from water abilities for 10 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Soaked",
          type: "debuff",
          duration: 10.0,
          value: 1.15, // 15% more damage from water abilities
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Tidal Wave",
      message: `${context.caster.character.name} summons a massive wave that crashes over all enemies`,
    });
  }
}

export class OceanicFury extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Oceanic Fury");
  }

  execute(context: AbilityContext): void {
    // Gain 50% attack speed and 25% damage for 12 seconds
    this.applyStatusToCaster(context, {
      name: "Oceanic Fury",
      type: "buff",
      duration: 12.0,
      value: 1.5, // 50% attack speed increase
    });

    this.applyStatusToCaster(context, {
      name: "Oceanic Power",
      type: "buff",
      duration: 12.0,
      value: 1.25, // 25% damage increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Oceanic Fury",
      message: `${context.caster.character.name} channels the rage of the deep ocean`,
    });
  }
}

export class DeepCurrent extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Deep Current");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies and slow them
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
        
        // Apply slow effect - 40% speed reduction for 8 seconds
        context.applyStatusEffect(enemy, {
          name: "Deep Current",
          type: "debuff",
          duration: 8.0,
          value: 0.6, // 40% speed reduction
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Deep Current",
      message: `${context.caster.character.name} creates underwater currents that drag enemies down`,
    });
  }
}

export class AbyssalDepths extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Abyssal Depths");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 80;
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create abyssal zones that deal damage over time
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Abyssal Zone",
          type: "debuff",
          duration: 12.0,
          value: 8, // 8 damage per second
        });
      }
    }

    // Heal self for 30% of damage dealt
    const totalDamage = damage * enemies.filter(e => e.isAlive).length;
    const healing = Math.floor(totalDamage * 0.3);
    this.applyHeal(context, healing, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Abyssal Depths",
      message: `${context.caster.character.name} opens portals to the deepest ocean trenches`,
    });
  }
}

export class PsychicBarrier extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Psychic Barrier");
  }

  execute(context: AbilityContext): void {
    // Passive ability - once per battle, negate a debuff applied to you
    this.applyStatusToCaster(context, {
      name: "Psychic Barrier",
      type: "buff",
      duration: 999, // Permanent passive
      value: 1, // One-time debuff negation
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Psychic Barrier",
      message: `${context.caster.character.name} erects a mental shield against harmful effects`,
    });
  }
}

export class TidalSlash extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Tidal Slash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Push enemy back (apply knockback effect)
    this.applyStatusToTargets(context, {
      name: "Knockback",
      type: "debuff",
      duration: 1.0,
      value: 1, // Pushes enemy back
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Tidal Slash",
      message: `${context.caster.character.name} strikes with a blade of water, creating distance`,
    });
  }
}

export class DemonsGuile extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Demon's Guile");
  }

  execute(context: AbilityContext): void {
    // Gain 100% evasion for 3 seconds
    this.applyStatusToCaster(context, {
      name: "Demon's Guile",
      type: "buff",
      duration: 3.0,
      value: 1.0, // 100% evasion
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Demon's Guile",
      message: `${context.caster.character.name} uses demonic power to become untouchable`,
    });
  }
}

export class MentalFog extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mental Fog");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Silence all enemies for 1.5 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Mental Fog",
          type: "debuff",
          duration: 1.5,
          value: 1, // Complete silence
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Mental Fog",
      message: `${context.caster.character.name} creates a psychic fog that clouds thoughts`,
    });
  }
}

export class CalamityHowl extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Calamity Howl");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 28;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Fear the target for 2 seconds
    this.applyStatusToTargets(context, {
      name: "Fear",
      type: "debuff",
      duration: 2.0,
      value: 1, // Makes them run away
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Calamity Howl",
      message: `${context.caster.character.name} lets out a bestial howl that instills deep terror`,
    });
  }
}

export class MindReader extends BaseAbility {
  constructor() {
    super("Deep Zephyros", "Mind Reader");
  }

  execute(context: AbilityContext): void {
    // Passive ability - gain 20% increased evasion against enemies with active buffs
    this.applyStatusToCaster(context, {
      name: "Mind Reader",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.2, // 20% increased evasion against buffed enemies
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Mind Reader",
      message: `${context.caster.character.name} anticipates foe's actions when they are empowered`,
    });
  }
}
