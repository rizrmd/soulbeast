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
