import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class HolyBolt extends BaseAbility {
  constructor() {
    super("Seraph Valdris", "Holy Bolt");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 23;
    
    // Deal damage
    this.applyDamage(context, damage);

    // Heal self for 5 HP
    this.applyHeal(context, 5, true);

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Holy Bolt",
      message: `${context.caster.character.name} channels divine energy that harms foes and heals the righteous`,
    });
  }
}

export class WindOfJudgment extends BaseAbility {
  constructor() {
    super("Seraph Valdris", "Wind of Judgment");
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

    // Remove all enemy buffs
    for (const enemy of enemies) {
      if (enemy.isAlive) {
        // Clear all positive status effects
        context.addEvent({
          timestamp: context.getCurrentTime(),
          type: "system",
          source: context.caster.id,
          target: enemy.id,
          message: "Divine wind strips away all enhancements!",
        });
      }
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      ability: abilityData?.name ?? "Wind of Judgment",
      message: `${context.caster.character.name} calls forth divine wind that strips away false enhancements`,
    });
  }
}

export class NaturesSanctuary extends BaseAbility {
  constructor() {
    super("Seraph Valdris", "Nature's Sanctuary");
  }

  execute(context: AbilityContext): void {
    // Reduce damage by 75% for 3 seconds
    this.applyStatusToCaster(context, {
      name: "Nature's Sanctuary",
      type: "buff",
      duration: 3.0,
      value: 0.25, // 75% damage reduction
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Nature's Sanctuary",
      message: `${context.caster.character.name} creates a sacred grove of protection`,
    });
  }
}

export class FinalJudgment extends BaseAbility {
  constructor() {
    super("Seraph Valdris", "Final Judgment");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const baseDamage = abilityData?.damage ?? 85;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Damage increases based on enemy's missing HP
    const missingHpPercentage = 1 - (target.hp / target.maxHp);
    const bonusDamage = Math.floor(baseDamage * missingHpPercentage);
    const totalDamage = baseDamage + bonusDamage;

    context.dealDamage(context.caster, target, totalDamage);

    if (bonusDamage > 0) {
      context.addEvent({
        timestamp: context.getCurrentTime(),
        type: "system",
        source: context.caster.id,
        target: target.id,
        message: `DIVINE JUDGMENT! Extra damage dealt to wounded enemy!`,
      });
    }

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Final Judgment",
      message: `${context.caster.character.name} delivers divine wrath that grows stronger against the wounded`,
    });
  }
}
