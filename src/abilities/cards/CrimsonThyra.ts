import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class SoulFlame extends BaseAbility {
  constructor() {
    super("Crimson Thyra", "Soul Flame");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 23;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Burns for 6 damage over 3 seconds
    this.applyStatusToTargets(context, {
      name: "Soul Burn",
      type: "dot",
      duration: 3.0,
      value: 6,
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Soul Flame",
      message: `${context.caster.character.name} unleashes dark fire that burns the soul itself`,
    });
  }
}

export class ButterflySwarm extends BaseAbility {
  constructor() {
    super("Crimson Thyra", "Butterfly Swarm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 32;
    const enemies = this.getEnemyTeam(context);
    let enemiesHit = 0;
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
        enemiesHit++;
      }
    }

    // Each enemy hit increases next ability damage by 10%
    if (enemiesHit > 0) {
      this.applyStatusToCaster(context, {
        name: "Butterfly Power",
        type: "buff",
        duration: 10.0,
        value: 1 + (enemiesHit * 0.1), // 10% per enemy hit
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Butterfly Swarm",
      message: `${context.caster.character.name} summons demonic butterflies that enhance power with each target struck`,
    });
  }
}

export class ReapersWind extends BaseAbility {
  constructor() {
    super("Crimson Thyra", "Reaper's Wind");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 35;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Damage increases based on enemy's current HP
    const healthPercentage = target.hp / target.maxHp;
    const bonusDamage = Math.floor(baseDamage * healthPercentage); // More damage to healthy enemies
    const totalDamage = baseDamage + bonusDamage;

    context.dealDamage(context.caster, target, totalDamage);

    if (bonusDamage > 0) {
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: `Reaper's Wind grows stronger against healthy enemies! Bonus damage: ${bonusDamage}`,
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Reaper's Wind",
      message: `${context.caster.character.name} summons wind that grows stronger against healthy enemies`,
    });
  }
}

export class SoulHarvest extends BaseAbility {
  constructor() {
    super("Crimson Thyra", "Soul Harvest");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 75;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    let damage = baseDamage;
    
    // Deal 50% more damage if enemy below 30% HP
    const healthPercentage = target.hp / target.maxHp;
    if (healthPercentage < 0.3) {
      damage = Math.floor(baseDamage * 1.5);
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: "SOUL HARVEST! Devastating power against weakened souls!",
      });
    }

    context.dealDamage(context.caster, target, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Soul Harvest",
      message: `${context.caster.character.name} reaps weakened souls with devastating power`,
    });
  }
}
