import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class VoidWind extends BaseAbility {
  constructor() {
    super("Astrix", "Void Wind");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 21; // Fallback to original value

    // Temporarily remove armor for this attack (ignores 100% of armor)
    const originalArmor = target.armor;
    target.armor = 0;
    
    context.dealDamage(context.caster, target, damage);
    
    target.armor = originalArmor; // Restore armor

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Void Wind",
      message: `${context.caster.character.name} strikes with void-infused wind that bypasses all armor`,
    });
  }
}

export class DivinePunishment extends BaseAbility {
  constructor() {
    super("Astrix", "Divine Punishment");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    let damage = abilityData?.damage ?? 38; // Fallback to original value
    
    // Check if target has demon composition
    const isDemon = target.character.composition.demon && target.character.composition.demon > 0;
    if (isDemon) {
      damage = (abilityData?.damage ?? 38) * 2; // Double damage vs demon enemies (+100% damage as per effect)
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: "DIVINE WRATH! Holy power devastates the demonic enemy!",
      });
    }

    context.dealDamage(context.caster, target, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Divine Punishment",
      message: `${context.caster.character.name} channels holy power against the enemy`,
    });
  }
}

export class StellarDash extends BaseAbility {
  constructor() {
    super("Astrix", "Stellar Dash");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25; // Fallback to original value
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply invulnerability during cast (brief immunity)
    this.applyStatusToCaster(context, {
      name: "Stellar Invulnerability",
      type: "buff",
      duration: abilityData?.castTime ?? 2.1, // Duration of cast time
      value: 1.0, // Full immunity
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Stellar Dash",
      message: `${context.caster.character.name} dashes at light speed, becoming invulnerable to all attacks`,
    });
  }
}

export class ParadoxStorm extends BaseAbility {
  constructor() {
    super("Astrix", "Paradox Storm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const enemies = this.getEnemyTeam(context);
    
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        let damage = abilityData?.damage ?? 65; // Fallback to original value
        
        // Deal divine damage to demons, demon damage to divine
        const isDemon = enemy.character.composition.demon && enemy.character.composition.demon > 0;
        const isDivine = enemy.character.composition.divine && enemy.character.composition.divine > 0;
        
        if (isDemon || isDivine) {
          // The effect description mentions dealing opposite damage types, 
          // we'll interpret this as increased effectiveness
          damage = Math.floor((abilityData?.damage ?? 65) * 1.4); // 40% more damage for paradox effect
          context.addEvent({
            timestamp: context.getCurrentTime(),
            type: "system",
            source: context.caster.id,
            target: enemy.id,
            message: `PARADOX! Contradictory energies devastate ${enemy.character.name}!`,
          });
        }
        
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Paradox Storm",
      message: `${context.caster.character.name} creates a storm of contradictory energies!`,
    });
  }
}

export class CelestialBeam extends BaseAbility {
  constructor() {
    super("Astrix", "Celestial Beam");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 45;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply celestial mark - target takes 20% more damage from all sources for 8 seconds
    this.applyStatusToTargets(context, {
      name: "Celestial Mark",
      type: "debuff",
      duration: 8.0,
      value: 1.2, // 20% increased damage taken
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Celestial Beam",
      message: `${context.caster.character.name} channels a beam of pure celestial energy`,
    });
  }
}

export class VoidShield extends BaseAbility {
  constructor() {
    super("Astrix", "Void Shield");
  }

  execute(context: AbilityContext): void {
    // Create a shield that absorbs 60 damage and reflects 25% of damage back to attackers
    this.applyStatusToCaster(context, {
      name: "Void Shield",
      type: "buff",
      duration: 10.0,
      value: 60, // Absorbs 60 damage
    });

    // Add reflection
    this.applyStatusToCaster(context, {
      name: "Void Reflection",
      type: "buff",
      duration: 10.0,
      value: 0.25, // 25% reflection
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Void Shield",
      message: `${context.caster.character.name} surrounds themselves with a shield of void energy`,
    });
  }
}

export class CosmicSurge extends BaseAbility {
  constructor() {
    super("Astrix", "Cosmic Surge");
  }

  execute(context: AbilityContext): void {
    // Gain 40% increased damage and 30% cooldown reduction for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Cosmic Power",
      type: "buff",
      duration: 8.0,
      value: 1.4, // 40% damage increase
    });

    this.applyStatusToCaster(context, {
      name: "Cosmic Speed",
      type: "buff",
      duration: 8.0,
      value: 0.7, // 30% cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Cosmic Surge",
      message: `${context.caster.character.name} channels cosmic energy to enhance their abilities`,
    });
  }
}

export class DimensionalRift extends BaseAbility {
  constructor() {
    super("Astrix", "Dimensional Rift");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
        
        // 25% chance to stun each enemy for 2 seconds
        if (Math.random() < 0.25) {
          context.applyStatusEffect(enemy, {
            name: "Dimensional Stun",
            type: "debuff",
            duration: 2.0,
            value: 1, // Stunned
          });
          
          context.addEvent({
            timestamp: context.getCurrentTime(),
            type: "system",
            source: context.caster.id,
            target: enemy.id,
            message: `${enemy.character.name} is caught in the dimensional rift and stunned!`,
          });
        }
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Dimensional Rift",
      message: `${context.caster.character.name} tears open a rift between dimensions`,
    });
  }
}

export class AstralProjection extends BaseAbility {
  constructor() {
    super("Astrix", "Astral Projection");
  }

  execute(context: AbilityContext): void {
    // Become untargetable for 5 seconds and heal 15% of max HP
    this.applyStatusToCaster(context, {
      name: "Astral Form",
      type: "buff",
      duration: 5.0,
      value: 1, // Untargetable
    });

    // Calculate healing (15% of max HP)
    const healing = Math.floor(context.caster.maxHp * 0.15);
    this.applyHeal(context, healing, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Astral Projection",
      message: `${context.caster.character.name} projects their consciousness to the astral plane`,
    });
  }
}

export class Starfall extends BaseAbility {
  constructor() {
    super("Astrix", "Starfall");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 18;
    
    // Hit 3 times as per effect description
    for (let i = 0; i < 3; i++) {
      if (target.isAlive) {
        context.dealDamage(context.caster, target, damage);
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Starfall",
      message: `${context.caster.character.name} calls down a volley of meteorites that strike 3 times`,
    });
  }
}

export class Singularity extends BaseAbility {
  constructor() {
    super("Astrix", "Singularity");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 100;
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply gravity well - enemies are pulled toward center and slowed by 50% for 6 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Gravity Well",
          type: "debuff",
          duration: 6.0,
          value: 0.5, // 50% speed reduction
        });
      }
    }

    // Self-damage as cost (10% of max HP)
    const selfDamage = Math.floor(context.caster.maxHp * 0.1);
    context.dealDamage(context.caster, context.caster, selfDamage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Singularity",
      message: `${context.caster.character.name} creates a devastating singularity at great personal cost`,
    });
  }
}

export class CosmicBalance extends BaseAbility {
  constructor() {
    super("Astrix", "Cosmic Balance");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const allies = this.getAllyTeam(context);
    const enemies = this.getEnemyTeam(context);
    
    // Calculate average HP percentage of all units
    let totalHpPercentage = 0;
    let unitCount = 0;
    
    for (const ally of allies) {
      if (ally.isAlive) {
        totalHpPercentage += ally.hp / ally.maxHp;
        unitCount++;
      }
    }
    
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        totalHpPercentage += enemy.hp / enemy.maxHp;
        unitCount++;
      }
    }
    
    const averageHpPercentage = totalHpPercentage / unitCount;
    const targetHp = Math.floor(averageHpPercentage * context.caster.maxHp);
    
    // Set caster's HP to the average percentage
    if (context.caster.hp > targetHp) {
      const damage = context.caster.hp - targetHp;
      context.dealDamage(context.caster, context.caster, damage);
    } else if (context.caster.hp < targetHp) {
      const healing = targetHp - context.caster.hp;
      this.applyHeal(context, healing, true);
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Cosmic Balance",
      message: `${context.caster.character.name} balances their life force with the cosmic order`,
    });
  }
}

export class VoidJaunt extends BaseAbility {
  constructor() {
    super("Astrix", "Void Jaunt");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    
    // Teleport to a random location and gain 50% evasion for 4 seconds
    this.applyStatusToCaster(context, {
      name: "Void Evasion",
      type: "buff",
      duration: 4.0,
      value: 0.5, // 50% evasion
    });
    
    // Reduce all ability cooldowns by 2 seconds
    this.applyStatusToCaster(context, {
      name: "Void Acceleration",
      type: "buff",
      duration: 0.1, // Instant effect
      value: 2.0, // 2 seconds cooldown reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Void Jaunt",
      message: `${context.caster.character.name} phases through the void, becoming elusive`,
    });
  }
}

export class ZephyrsBlessing extends BaseAbility {
  constructor() {
    super("Astrix", "Zephyr's Blessing");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const allies = this.getAllyTeam(context);
    
    // Grant all allies 25% increased movement speed and 15% increased damage for 10 seconds
    for (const ally of allies) {
      if (ally.isAlive) {
        context.applyStatusEffect(ally, {
          name: "Zephyr's Speed",
          type: "buff",
          duration: 10.0,
          value: 1.25, // 25% speed increase
        });
        
        context.applyStatusEffect(ally, {
          name: "Zephyr's Power",
          type: "buff",
          duration: 10.0,
          value: 1.15, // 15% damage increase
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Zephyr's Blessing",
      message: `${context.caster.character.name} calls upon the winds to bless their allies`,
    });
  }
}

export class GravityWell extends BaseAbility {
  constructor() {
    super("Astrix", "Gravity Well");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 30;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies and pull them together
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
        
        // Apply gravity effect - reduces movement speed by 60% for 6 seconds
        context.applyStatusEffect(enemy, {
          name: "Gravity Pull",
          type: "debuff",
          duration: 6.0,
          value: 0.4, // 60% speed reduction
        });
        
        // Apply vulnerability - 20% increased damage taken for 6 seconds
        context.applyStatusEffect(enemy, {
          name: "Gravitational Stress",
          type: "debuff",
          duration: 6.0,
          value: 1.2, // 20% increased damage taken
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Gravity Well",
      message: `${context.caster.character.name} creates a powerful gravitational field`,
    });
  }
}

export class EntropicTouch extends BaseAbility {
  constructor() {
    super("Astrix", "Entropic Touch");
  }

  execute(context: AbilityContext): void {
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 40;
    
    // Deal damage
    context.dealDamage(context.caster, target, damage);
    
    // Apply entropy effect - target loses 3% of current HP per second for 8 seconds
    context.applyStatusEffect(target, {
      name: "Entropic Decay",
      type: "debuff",
      duration: 8.0,
      value: 0.03, // 3% current HP per second
    });
    
    // Apply healing reduction - 50% less healing received for 8 seconds
    context.applyStatusEffect(target, {
      name: "Entropic Corruption",
      type: "debuff",
      duration: 8.0,
      value: 0.5, // 50% healing reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Entropic Touch",
      message: `${context.caster.character.name} touches the enemy with the power of entropy`,
    });
  }
}
