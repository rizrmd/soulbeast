# SoulBeast Ability System

This document explains how the new ability system works and how to add new card abilities.

## Overview

The ability system has been redesigned to support custom implementations for each SoulBeast card's abilities. Instead of relying on text parsing and generic effects, each ability now has its own implementation class that can execute complex, card-specific logic.

## Architecture

### Core Components

1. **AbilityContext**: Provides all the tools an ability needs to interact with the battle
2. **BaseAbility**: Abstract base class with common utility methods
3. **AbilityRegistry**: Maps ability names to their implementations
4. **Card-specific ability files**: Individual implementations for each card

### File Structure

```
src/abilities/
├── types.ts               # Core interfaces and types
├── BaseAbility.ts         # Base class with utility methods
├── AbilityRegistry.ts     # Central registry mapping names to implementations
├── index.ts              # Module exports
└── cards/                # Individual card ability implementations
    ├── KethStalker.ts
    ├── CrimsonVorthak.ts
    ├── BoneThurak.ts
    ├── ShromXelar.ts
    ├── VoidGhorth.ts
    └── [NewCard].ts
```

## How It Works

1. When an ability is executed, the BattleEngine checks the `abilityRegistry` for a custom implementation
2. If found, it creates an `AbilityContext` with all necessary battle information and utility functions
3. The ability's `execute()` method is called with this context
4. If no custom implementation exists, it falls back to the legacy text-parsing system

## Adding New Abilities

### Step 1: Create the Card File

Create a new file in `src/abilities/cards/[CardName].ts`:

```typescript
import { BaseAbility } from "../BaseAbility";
import { AbilityContext } from "../types";

export class YourAbilityName extends BaseAbility {
  execute(context: AbilityContext): void {
    // Your ability implementation here
    
    // Deal damage to targets
    this.applyDamage(context, 25);
    
    // Apply status effects
    this.applyStatusToTargets(context, {
      name: "Burn",
      type: "dot",
      duration: 3.0,
      value: 5,
      tickInterval: 1.0,
      remainingTicks: 3,
    });
    
    // Add battle event
    context.addEvent({
      timestamp: context.getCurrentTime(),
      type: "ability_used",
      source: context.caster.id,
      target: context.targets[0]?.id,
      ability: "Your Ability Name",
      message: "Ability description for battle log",
    });
  }
}
```

### Step 2: Register the Abilities

Add your abilities to `src/abilities/AbilityRegistry.ts`:

```typescript
// Import your abilities
import { 
  YourAbilityName,
  AnotherAbility 
} from "./cards/YourCard";

// Add to the registry
export const abilityRegistry: AbilityRegistry = {
  // ... existing abilities ...
  
  // Your Card
  "Your Ability Name": new YourAbilityName(),
  "Another Ability": new AnotherAbility(),
};
```

## Available Utility Methods

### BaseAbility Methods

- `applyDamage(context, damage)` - Deal damage to all targets
- `applyHeal(context, amount, targetSelf)` - Heal caster or targets
- `applyStatusToTargets(context, effect)` - Apply status effect to targets
- `applyStatusToCaster(context, effect)` - Apply status effect to caster
- `getEnemyTeam(context)` - Get all living enemies
- `getAllyTeam(context)` - Get all living allies

### AbilityContext Properties

- `caster` - The entity casting the ability
- `targets` - Array of target entities
- `allEntities` - Map of all battle entities
- `getCurrentTime()` - Get current timestamp
- `addEvent(event)` - Add event to battle log
- `applyStatusEffect(entity, effect)` - Apply status effect to specific entity
- `dealDamage(attacker, target, damage)` - Deal specific damage amount
- `heal(entity, amount)` - Heal specific entity

## Status Effect Types

- **buff**: Positive effect on the entity
- **debuff**: Negative effect on the entity  
- **dot**: Damage over time
- **hot**: Heal over time

## Advanced Examples

### Conditional Damage (Execute Effect)

```typescript
execute(context: AbilityContext): void {
  const target = context.targets[0];
  if (!target) return;

  let damage = 40;
  
  // Execute effect: extra damage if target is below 30% HP
  const healthPercentage = target.hp / target.maxHp;
  if (healthPercentage < 0.3) {
    damage = 80; // Double damage for low health targets
  }

  context.dealDamage(context.caster, target, damage);
}
```

### Area Effect with Scaling

```typescript
execute(context: AbilityContext): void {
  const enemies = this.getEnemyTeam(context);
  
  // Base damage increases per target
  let damage = 25 + (enemies.length * 5);
  
  for (const enemy of enemies) {
    if (enemy.isAlive) {
      context.dealDamage(context.caster, enemy, damage);
    }
  }
}
```

### Armor Penetration

```typescript
execute(context: AbilityContext): void {
  const target = context.targets[0];
  if (!target) return;

  // Temporarily remove armor for this attack
  const originalArmor = target.armor;
  target.armor = 0;
  
  context.dealDamage(context.caster, target, 35);
  
  target.armor = originalArmor; // Restore armor
}
```

## Currently Implemented Cards

- ✅ Keth Stalker (Nightmare Frost, Crystal Prison, Abyssal Tide, Nightmare Hunt)
- ✅ Crimson Vorthak (Flame Slash, Demonic Roar, Infernal Execution, Rose of Destruction)
- ✅ Bone Thurak (Stone Shard, Molten Boulder, Bone Armor, Ancient Eruption)
- ✅ Shrom Xelar (Spore Burst, Mycelium Network, Soul Absorb, Fungal Nightmare)
- ✅ Void Ghorth (Savage Splash, Dimensional Bite, Terror Howl, Void Tsunami)
- ✅ Deep Zephyros (Mind Lash, Bestial Surge, Abyssal Drain, Mind Break)
- ✅ Astrix (Void Wind, Divine Punishment, Stellar Dash, Paradox Storm)
- ✅ Ember Pyrrak (Flame Burst, Molten Claw, Dawn's Embrace, Solar Apocalypse)
- ✅ Seraph Valdris (Holy Bolt, Wind of Judgment, Nature's Sanctuary, Final Judgment)
- ✅ Morthen (Frost Bite, Silent Strike, Predator's Focus, Absolute Zero)
- ✅ Stellar Nexath (Starlight, Cosmic Winds, Life Web, Galaxy Dance)
- ✅ Moltak (Steel Strike, Forge Strike, Demon Steel, Molten Titan)
- ✅ Hexis (Chaos Shard, Divine Corruption, Geometric Prison, Chaos Singularity)
- ✅ Crystal Nerith (Petal Stream, Dream Shield, Nature's Embrace, Sakura Storm)
- ✅ Velana (Thorn Whip, Wind Seed, Feral Instinct, Midnight Bloom)
- ✅ Crimson Thyra (Soul Flame, Butterfly Swarm, Reaper's Wind, Soul Harvest)

**All 16 cards have been fully implemented with custom ability logic!**

## Legacy Support

The system maintains backward compatibility. Any ability not found in the registry will use the original text-parsing system, allowing for gradual migration of all abilities.
