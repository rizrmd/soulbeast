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
