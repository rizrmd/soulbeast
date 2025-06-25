import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class StoneShard extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Stone Shard");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20; // Fallback to original value

    // Deal damage
    this.applyDamage(context, damage);

    // Apply weakening effect (20% damage reduction)
    this.applyStatusToTargets(context, {
      name: "Stone Weakness",
      type: "debuff",
      duration: 4.0,
      value: 0.8, // 20% damage reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Stone Shard",
      message: `${context.caster.character.name} hurls sharp stone fragments`,
    });
  }
}

export class MoltenBoulder extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Molten Boulder");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 40; // Fallback to original value

    // Deal damage
    this.applyDamage(context, damage);

    // 25% chance to daze for 1 second (prevents ability use)
    if (Math.random() < 0.25) {
      this.applyStatusToTargets(context, {
        name: "Dazed",
        type: "debuff",
        duration: 1.0,
        value: 1,
      });

      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: context.targets[0]?.id,
        message: "DAZED! The molten boulder dazes the enemy!",
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Molten Boulder",
      message: `${context.caster.character.name} launches a massive burning rock projectile`,
    });
  }
}

export class BoneArmor extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Bone Armor");
  }

  execute(context: AbilityContext): void {
    // Apply damage reduction buff for 6 seconds
    this.applyStatusToCaster(context, {
      name: "Bone Armor",
      type: "buff",
      duration: 6.0,
      value: 0.5, // 50% damage reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Bone Armor",
      message: `${context.caster.character.name} summons protective bone plating`,
    });
  }
}

export class AncientEruption extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Ancient Eruption");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 65; // Fallback to original value
    const enemies = this.getEnemyTeam(context);

    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create 3 lava pools that deal 8 damage/second
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Lava Pool",
          type: "dot",
          duration: 5.0, // 5 seconds
          value: 8, // 8 damage per second
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Ancient Eruption",
      message: `${context.caster.character.name} calls forth an ancient volcanic eruption, creating lava pools`,
    });
  }
}

export class Earthquake extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Earthquake");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 30;
    const enemies = this.getEnemyTeam(context);

    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // 40% chance to stun all enemies for 2 seconds
    if (Math.random() < 0.4) {
      for (const enemy of enemies) {
        if (enemy.isAlive) {
          context.applyStatusEffect(enemy, {
            name: "Stunned",
            type: "debuff",
            duration: 2.0,
            value: 1,
          });
        }
      }
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        message: "EARTHQUAKE! All enemies are stunned by the tremors!",
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Earthquake",
      message: `${context.caster.character.name} causes the ground to shake violently`,
    });
  }
}

export class BoneSpikes extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Bone Spikes");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;

    // Deal damage
    this.applyDamage(context, damage);

    // Apply bleeding effect
    this.applyStatusToTargets(context, {
      name: "Pierced",
      type: "dot",
      duration: 5.0,
      value: 4, // 4 damage per second
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Bone Spikes",
      message: `${context.caster.character.name} erupts sharp bone spikes from the ground`,
    });
  }
}

export class MagmaFlow extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Magma Flow");
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

    // Create persistent magma flow that deals damage over time
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Magma Flow",
          type: "dot",
          duration: 6.0,
          value: 6, // 6 damage per second
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Magma Flow",
      message: `${context.caster.character.name} creates rivers of flowing magma`,
    });
  }
}

export class StoneWall extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Stone Wall");
  }

  execute(context: AbilityContext): void {
    // Creates a barrier that absorbs 80 damage for 10 seconds
    this.applyStatusToCaster(context, {
      name: "Stone Wall",
      type: "buff",
      duration: 12.0,
      value: 80, // Absorbs 80 damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Stone Wall",
      message: `${context.caster.character.name} erects a massive stone barrier`,
    });
  }
}

export class VolcanicRage extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Volcanic Rage");
  }

  execute(context: AbilityContext): void {
    // Passive ability - gain 10% damage for each 10% health lost
    const healthLost = 1 - context.caster.hp / context.caster.maxHp;
    const damageBonus = Math.floor(healthLost * 10) * 0.1; // 10% per 10% health lost

    this.applyStatusToCaster(context, {
      name: "Volcanic Rage",
      type: "buff",
      duration: 999, // Permanent passive
      value: 1 + damageBonus, // Damage multiplier
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Volcanic Rage",
      message: `${context.caster.character.name}'s rage grows with each wound`,
    });
  }
}

export class MagmaSpit extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Magma Spit");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15;

    // Deal initial damage
    this.applyDamage(context, damage);

    // Apply burn effect (damage over time)
    this.applyStatusToTargets(context, {
      name: "Magma Burn",
      type: "debuff",
      duration: 6.0,
      value: 8, // DoT damage per second
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Magma Spit",
      message: `${context.caster.character.name} spits molten rock that clings and burns`,
    });
  }
}

export class PrimalRoar extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Primal Roar");
  }

  execute(context: AbilityContext): void {
    const enemies = this.getEnemyTeam(context);

    // Apply fear to all enemies (30% damage reduction for 8 seconds)
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Feared",
          type: "debuff",
          duration: 8.0,
          value: 0.7, // 30% damage reduction
        });
      }
    }

    // Boost own damage by 40% for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Primal Fury",
      type: "buff",
      duration: 8.0,
      value: 1.4, // 40% damage increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Primal Roar",
      message: `${context.caster.character.name} lets out a terrifying primal roar`,
    });
  }
}

export class Unearth extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Unearth");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();

    // Reset cooldowns of all non-ultimate abilities
    // Get all ability names from the caster's character and reset their cooldowns
    const abilityNames = context.caster.character.abilities.map((a) => a.name);
    abilityNames.forEach((abilityName) => {
      if (abilityName !== "Unearth") {
        context.caster.abilityCooldowns.set(abilityName, 0);
      }
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Unearth",
      message: `${context.caster.character.name} digs deep into ancient power, resetting ability cooldowns`,
    });
  }
}

export class Fossilize extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Fossilize");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();

    // Check if the effect is already applied to avoid stacking
    const existingEffect = context.caster.statusEffects.find(
      (effect) => effect.name === "Fossilize"
    );

    const hpPercent = (context.caster.hp / context.caster.maxHp) * 100;
    if (!existingEffect && hpPercent <= 60) {
      // Apply permanent damage reduction buff
      this.applyStatusToCaster(
        context,
        this.createDamageReductionEffect("Fossilize", 0.8, -1) // 20% damage reduction (0.8 multiplier), permanent
      );

      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "ability_used",
        source: context.caster.id,
        ability: abilityData?.name ?? "Fossilize",
        message: `${context.caster.character.name}'s hide hardens like ancient stone`,
      });
    }
  }
}

export class PetrifyingGaze extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Petrifying Gaze");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 10;

    // Deal damage
    this.applyDamage(context, damage);

    // Apply slow effect
    this.applyStatusToTargets(context, {
      name: "Petrified",
      type: "debuff",
      duration: 3.0,
      value: 50, // 50% slow
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Petrifying Gaze",
      message: `${context.caster.character.name}'s demonic gaze turns flesh to stone`,
    });
  }
}

export class DemonicCore extends BaseAbility {
  constructor() {
    super("Bone Thurak", "Demonic Core");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();

    if (true) {
      const healAmount = 12;

      setTimeout(() => {
        this.applyHeal(context, 12, true);

        context.addEvent({
          timestamp: context.getCurrentTime(),
          type: "ability_used",
          source: context.caster.id,
          ability: abilityData?.name ?? "Demonic Core",
          message: `${context.caster.character.name}'s demonic heart converts flames to vitality (+${healAmount} HP)`,
        });
      }, 300);
    }
  }
}
