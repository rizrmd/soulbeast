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

export class VoidClaws extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Void Claws");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 28;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply void corruption (reduces healing by 50% for 6 seconds)
    this.applyStatusToTargets(context, {
      name: "Void Corruption",
      type: "debuff",
      duration: 6.0,
      value: 0.5, // 50% healing reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Void Claws",
      message: `${context.caster.character.name} rakes with claws infused with void energy`,
    });
  }
}

export class DimensionalShield extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Dimensional Shield");
  }

  execute(context: AbilityContext): void {
    // Creates a shield that absorbs 70 damage and has 30% chance to reflect attacks
    this.applyStatusToCaster(context, {
      name: "Dimensional Shield",
      type: "buff",
      duration: 8.0,
      value: 70, // Absorbs 70 damage
    });

    // Add reflection chance
    this.applyStatusToCaster(context, {
      name: "Dimensional Reflection",
      type: "buff",
      duration: 8.0,
      value: 0.3, // 30% reflection chance
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Dimensional Shield",
      message: `${context.caster.character.name} phases partially out of reality for protection`,
    });
  }
}

export class AbyssalRegeneration extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Abyssal Regeneration");
  }

  execute(context: AbilityContext): void {
    // Passive ability - heal 5% max HP when an enemy dies
    this.applyStatusToCaster(context, {
      name: "Abyssal Regeneration",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.05, // 5% max HP healing on enemy death
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Abyssal Regeneration",
      message: `${context.caster.character.name} feeds on the life force of fallen enemies`,
    });
  }
}

export class VoidPortal extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Void Portal");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 40;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Teleport behind enemy and gain 25% damage boost for next attack
    this.applyStatusToCaster(context, {
      name: "Void Portal Advantage",
      type: "buff",
      duration: 5.0,
      value: 1.25, // 25% damage boost
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Void Portal",
      message: `${context.caster.character.name} opens a portal and strikes from an unexpected angle`,
    });
  }
}

export class RealityTear extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Reality Tear");
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

    // Apply reality distortion - enemies have 20% chance to miss attacks for 8 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Reality Distortion",
          type: "debuff",
          duration: 8.0,
          value: 0.2, // 20% miss chance
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Reality Tear",
      message: `${context.caster.character.name} tears holes in reality itself`,
    });
  }
}

export class DimensionalStorm extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Dimensional Storm");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 90;
    const enemies = this.getEnemyTeam(context);
    
    // Deal massive damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Create dimensional chaos - random effects on all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        const randomEffect = Math.random();
        if (randomEffect < 0.33) {
          // Stun for 2 seconds
          context.applyStatusEffect(enemy, {
            name: "Dimensional Stun",
            type: "debuff",
            duration: 2.0,
            value: 1,
          });
        } else if (randomEffect < 0.66) {
          // Slow for 6 seconds
          context.applyStatusEffect(enemy, {
            name: "Dimensional Slow",
            type: "debuff",
            duration: 6.0,
            value: 0.5, // 50% speed reduction
          });
        } else {
          // Confusion for 4 seconds
          context.applyStatusEffect(enemy, {
            name: "Dimensional Confusion",
            type: "debuff",
            duration: 4.0,
            value: 1, // Random targeting
          });
        }
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Dimensional Storm",
      message: `${context.caster.character.name} unleashes a chaotic storm of dimensional energy`,
    });
  }
}

export class PhaseShift extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Phase Shift");
  }

  execute(context: AbilityContext): void {
    // Passive ability - 20% chance to evade any incoming attack
    this.applyStatusToCaster(context, {
      name: "Phase Shift",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.2, // 20% evasion chance
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Phase Shift",
      message: `${context.caster.character.name} flickers between dimensions`,
    });
  }
}

export class AquaJet extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Aqua Jet");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 22;
    
    // Deal damage with high priority
    this.applyDamage(context, damage);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Aqua Jet",
      message: `${context.caster.character.name} propels forward with a jet of water`,
    });
  }
}

export class RegenerativeTorpor extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Regenerative Torpor");
  }

  execute(context: AbilityContext): void {
    const maxHp = context.caster.maxHp;
    const healAmount = Math.floor(maxHp * 0.4); // 40% of max HP
    
    // Apply healing over time for 5 seconds
    this.applyStatusToCaster(context, {
      name: "Regenerative Torpor",
      type: "hot", // Heal over time
      duration: 5.0,
      value: healAmount / 5, // Spread healing over 5 seconds
      tickInterval: 1.0,
    });

    // Apply slow debuff to self
    this.applyStatusToCaster(context, {
      name: "Torpor Slow",
      type: "debuff",
      duration: 5.0,
      value: 0.5, // 50% speed reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Regenerative Torpor",
      message: `${context.caster.character.name} enters a deep regenerative state`,
    });
  }
}

export class UnstableRift extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Unstable Rift");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 30;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply confusion - reduces accuracy by 40% for 4 seconds
    this.applyStatusToTargets(context, {
      name: "Rift Confusion",
      type: "debuff",
      duration: 4.0,
      value: 0.4, // 40% accuracy reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Unstable Rift",
      message: `${context.caster.character.name} tears a hole in reality that disorients the foe`,
    });
  }
}

export class BeastOfTheDepths extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Beast of the Depths");
  }

  execute(context: AbilityContext): void {
    // Passive ability - gain 1% damage for every 2% HP missing
    this.applyStatusToCaster(context, {
      name: "Beast of the Depths",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.01, // 1% damage per 2% HP missing
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Beast of the Depths",
      message: `${context.caster.character.name} becomes more ferocious as wounds accumulate`,
    });
  }
}

export class Drown extends BaseAbility {
  constructor() {
    super("Void Ghorth", "Drown");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Prevent enemy from using abilities for 2 seconds (silence)
    this.applyStatusToTargets(context, {
      name: "Drowned",
      type: "debuff",
      duration: 2.0,
      value: 1, // Complete silence
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Drown",
      message: `${context.caster.character.name} floods the enemy's senses, silencing their powers`,
    });
  }
}
