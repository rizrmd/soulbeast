import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class SporeBurst extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Spore Burst");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // 30% chance to poison for 8 damage over 4 seconds
    if (Math.random() < 0.3) {
      this.applyStatusToTargets(context, {
        name: "Poison",
        type: "dot",
        duration: 4.0,
        value: 8,
        tickInterval: 1.0,
      });

      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: context.targets[0]?.id,
        message: "POISONED! Toxic spores infect the enemy!",
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Spore Burst",
      message: `${context.caster.character.name} releases toxic spores from mushroom cap`,
    });
  }
}

export class MyceliumNetwork extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Mycelium Network");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 28;
    const enemies = this.getEnemyTeam(context);
    
    // Damage increases per target hit
    let damageMultiplier = 1.0;
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        const finalDamage = Math.floor(baseDamage * damageMultiplier);
        context.dealDamage(context.caster, enemy, finalDamage);
        damageMultiplier += 0.2; // Increase by 20% for each target
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Mycelium Network",
      message: `${context.caster.character.name} activates underground fungal network, damage growing with each target`,
    });
  }
}

export class SoulAbsorb extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Soul Absorb");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;
    
    // Deal damage
    const actualDamageDealt = context.dealDamage(context.caster, target, damage);

    // Heal for 100% of damage dealt
    this.applyHeal(context, actualDamageDealt, true);

    // Gain 20% damage boost
    this.applyStatusToCaster(context, this.createDamageBoostEffect("Soul Power", 1.2, 10.0));

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Soul Absorb",
      message: `${context.caster.character.name} feeds on enemy soul energy, growing stronger`,
    });
  }
}

export class FungalNightmare extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Fungal Nightmare");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 70;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Cause hallucinations - enemy attacks random targets for 6 seconds
    this.applyStatusToTargets(context, {
      name: "Hallucinations",
      type: "debuff",
      duration: 6.0,
      value: 1.0, // Complete confusion
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Fungal Nightmare",
      message: `${context.caster.character.name} invades the enemy mind with psychedelic spores, causing chaos`,
    });
  }
}

export class ToxicAura extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Toxic Aura");
  }

  execute(context: AbilityContext): void {
    // Passive ability - enemies that hit you have a chance to be poisoned
    this.applyStatusToCaster(context, {
      name: "Toxic Aura",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.3, // 30% chance to poison attackers
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Toxic Aura",
      message: `${context.caster.character.name}'s presence becomes poisonous to attackers`,
    });
  }
}

export class RapidGrowth extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Rapid Growth");
  }

  execute(context: AbilityContext): void {
    // Heals for 30 HP over 3 seconds
    this.applyStatusToCaster(context, {
      name: "Rapid Growth",
      type: "hot",
      duration: 3.0,
      value: 10, // 10 HP per second for 3 seconds = 30 HP total
      tickInterval: 1.0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Rapid Growth",
      message: `${context.caster.character.name} rapidly grows new fungal matter to heal`,
    });
  }
}

export class HallucinogenicHaze extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Hallucinogenic Haze");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 10;
    const enemies = this.getEnemyTeam(context);
    
    // Deal damage to all enemies
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.dealDamage(context.caster, enemy, damage);
      }
    }

    // Reduce enemy accuracy by 30% for 5 seconds
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        context.applyStatusEffect(enemy, {
          name: "Hallucinogenic Haze",
          type: "debuff",
          duration: 5.0,
          value: 0.3, // 30% accuracy reduction
          behaviors: {
            accuracyReduction: true,
          },
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Hallucinogenic Haze",
      message: `${context.caster.character.name} releases a confusing haze that impairs enemy accuracy`,
    });
  }
}

export class ParasiticSpore extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Parasitic Spore");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 15;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Apply parasitic spore - if target dies while this is active, heal for 25 HP
    this.applyStatusToTargets(context, {
      name: "Parasitic Spore",
      type: "debuff",
      duration: 10.0,
      value: 25, // Healing amount on death
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Parasitic Spore",
      message: `${context.caster.character.name} infects the enemy with a parasitic spore`,
    });
  }
}

export class Symbiosis extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Symbiosis");
  }

  execute(context: AbilityContext): void {
    // Passive ability - healing abilities also deal 25% of healed amount as damage to random enemy
    this.applyStatusToCaster(context, {
      name: "Symbiosis",
      type: "buff",
      duration: 999, // Permanent passive
      value: 0.25, // 25% of healing as damage
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Symbiosis",
      message: `${context.caster.character.name} establishes a symbiotic connection - life taken from others`,
    });
  }
}

export class Decompose extends BaseAbility {
  constructor() {
    super("Shrom Xelar", "Decompose");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 20;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Reduce enemy armor by 40% for 8 seconds
    this.applyStatusToTargets(context, {
      name: "Decompose",
      type: "debuff",
      duration: 8.0,
      value: 0.4, // 40% armor reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Decompose",
      message: `${context.caster.character.name} breaks down the enemy's defenses, making them vulnerable`,
    });
  }
}
