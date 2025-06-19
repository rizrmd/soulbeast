import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class SteelStrike extends BaseAbility {
  constructor() {
    super("Moltak", "Steel Strike");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 25;
    const target = context.targets[0];
    if (!target || !target.isAlive) return;

    // Temporarily reduce armor by 50% for this attack (ignores 50% of enemy armor)
    const originalArmor = target.armor;
    target.armor = target.armor * 0.5; // 50% armor remaining
    
    context.dealDamage(context.caster, target, damage);
    
    target.armor = originalArmor; // Restore armor

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: target.id,
      ability: abilityData?.name ?? "Steel Strike",
      message: `${context.caster.character.name} strikes with molten metal that pierces defenses`,
    });
  }
}

export class ForgeStrike extends BaseAbility {
  constructor() {
    super("Moltak", "Forge Strike");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 45;
    
    // Deal massive damage
    this.applyDamage(context, damage);

    // Stun for 2 seconds
    this.applyStatusToTargets(context, {
      name: "Stun",
      type: "debuff",
      duration: 2.0,
      value: 0,
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: abilityData?.name ?? "Forge Strike",
      message: `${context.caster.character.name} delivers a massive double blow that leaves enemies dazed`,
    });
  }
}

export class DemonSteel extends BaseAbility {
  constructor() {
    super("Moltak", "Demon Steel");
  }

  execute(context: AbilityContext): void {
    // Gain 30 armor and reflect 25% damage for 8 seconds
    this.applyStatusToCaster(context, {
      name: "Demon Steel",
      type: "buff",
      duration: 8.0,
      value: 30, // Armor bonus
    });

    this.applyStatusToCaster(context, {
      name: "Damage Reflection",
      type: "buff", 
      duration: 8.0,
      value: 0.25, // 25% damage reflection
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: this.getAbilityData()?.name ?? "Demon Steel",
      message: `${context.caster.character.name}'s skin becomes like demonic steel, reflecting attacks`,
    });
  }
}

export class MoltenTitan extends BaseAbility {
  constructor() {
    super("Moltak", "Molten Titan");
  }

  execute(context: AbilityContext): void {
    const abilityData = this.getAbilityData();
    const damage = abilityData?.damage ?? 80;
    
    // Deal damage to self (transformation)
    this.applyDamage(context, damage);

    // +50% damage and HP for 10 seconds
    this.applyStatusToCaster(context, {
      name: "Molten Titan Form",
      type: "buff",
      duration: 10.0,
      value: 1.5, // 50% bonus to damage and HP
    });

    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.caster.id,
      ability: abilityData?.name ?? "Molten Titan",
      message: `${context.caster.character.name} transforms into a colossal burning titan`,
    });
  }
}
