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

export class CrimsonClaws extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Crimson Claws");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 18;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply bleeding effect
    this.applyStatusToTargets(context, {
      name: "Bleeding",
      type: "dot",
      duration: 4.0,
      value: 3, // 3 damage per second
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Crimson Claws",
      message: `${context.caster.character.name} rakes with razor-sharp claws`,
    });
  }
}

export class InfernalShield extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Infernal Shield");
  }

  execute(context: AbilityContext): void {
    // Absorbs 50 damage for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Infernal Shield",
      type: "buff",
      duration: 8.0,
      value: 55, // Absorbs 55 damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Infernal Shield",
      message: `${context.caster.character.name} conjures a protective barrier of hellfire`,
    });
  }
}

export class BlazingCharge extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Blazing Charge");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Gain 25% movement speed for 6 seconds
    this.applyStatusToCaster(context, {
      name: "Blazing Speed",
      type: "buff",
      duration: 6.0,
      value: 1.25, // 25% speed increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Blazing Charge",
      message: `${context.caster.character.name} charges forward in a blaze of fury`,
    });
  }
}

export class MoltenArmor extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Molten Armor");
  }

  execute(context: AbilityContext): void {
    // Passive ability - reflects 20% of received damage as fire damage
    this.applyStatusToCaster(context, {
      name: "Molten Armor",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.2, // 20% damage reflection
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Molten Armor",
      message: `${context.caster.character.name}'s skin hardens into molten armor`,
    });
  }
}

export class FireStorm extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Fire Storm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply burn to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Fire Storm Burn",
          type: "dot",
          duration: 4.0,
          value: 8, // 8 damage per second
          tickInterval: 1.0,
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Fire Storm",
      message: `${context.caster.character.name} unleashes a devastating storm of fire`,
    });
  }
}

export class BurningBlood extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Burning Blood");
  }

  execute(context: AbilityContext): void {
    // Passive ability: Take 5% less damage for each 10% health missing
    this.applyStatusToCaster(context, {
      name: "Burning Blood",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.05, // 5% damage reduction per 10% health missing
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Burning Blood",
      message: `${context.caster.character.name}'s demonic blood boils with defiance`,
    });
  }
}

export class Cauterize extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Cauterize");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    
    // Heal for 20 HP
    this.applyHeal(context, 20, true);
    
    // Deal 5 damage to self
    context.dealDamage(context.caster, context.caster, 5);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Cauterize",
      message: `${context.caster.character.name} sears their wounds with fire to recover`,
    });
  }
}

export class RagingBeast extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Raging Beast");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    
    // Increases damage output by 25% for 6 seconds
    this.applyStatusToCaster(context, {
      name: "Raging Beast",
      type: "buff",
      duration: 6.0,
      value: 1.25, // 25% damage increase
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Raging Beast",
      message: `${context.caster.character.name} unleashes their inner beast for a surge of power`,
    });
  }
}

export class ScentOfBlood extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Scent of Blood");
  }

  execute(context: AbilityContext): void {
    // Passive ability: Gain 25% critical hit chance when enemy is below 40% HP
    this.applyStatusToCaster(context, {
      name: "Scent of Blood",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.25, // 25% critical hit chance when enemy below 40% HP
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Scent of Blood",
      message: `${context.caster.character.name} is driven into a frenzy by the smell of blood`,
    });
  }
}

export class FireWall extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Fire Wall");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 35;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Apply fire wall effect that damages enemies using quick abilities for 8 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Fire Wall",
          type: "debuff",
          duration: 8.0,
          value: 15, // Damage when using quick abilities
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Fire Wall",
      message: `${context.caster.character.name} creates a barrier of flames that punishes hasty actions`,
    });
  }
}

export class RecklessCharge extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Reckless Charge");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 50;
    
    // Deal damage to target
    this.applyDamage(context, damage);
    
    // Deal 12 damage to yourself
    context.dealDamage(context.caster, context.caster, 12);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Reckless Charge",
      message: `${context.caster.character.name} launches a devastating attack at personal cost`,
    });
  }
}

export class DemonForm extends BaseAbility {
  constructor() {
    super("Crimson Vorthak", "Demon Form");
  }

  execute(context: AbilityContext): void {
    // Transform: +50% damage, +30% speed, immunity to debuffs for 12 seconds
    this.applyStatusToCaster(context, {
      name: "Demon Form",
      type: "buff",
      duration: 12.0,
      value: 1.5, // 50% damage increase
    });

    this.applyStatusToCaster(context, {
      name: "Demon Speed",
      type: "buff",
      duration: 12.0,
      value: 1.3, // 30% speed increase
    });

    this.applyStatusToCaster(context, {
      name: "Debuff Immunity",
      type: "buff",
      duration: 12.0,
      value: 1, // Immunity to debuffs
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Demon Form",
      message: `${context.caster.character.name} transforms into a terrifying demon`,
    });
  }
}
