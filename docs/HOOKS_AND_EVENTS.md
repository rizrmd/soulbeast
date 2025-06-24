# SoulBeast Ability Hooks and Events System

This document describes the generalized event and hook system that replaces hardcoded effect name conditions in the battle engine.

## Overview

The new system provides:
- **Behavioral Flags**: Replace hardcoded name checks with semantic flags
- **Hook Functions**: Allow custom behavior for status effects
- **Event System**: Enable abilities to listen and respond to battle events
- **Extensibility**: Easy to add new behaviors without modifying the battle engine

## Status Effect Behaviors

Instead of checking effect names like `effect.name.includes("Shield")`, the system now uses behavioral flags:

```typescript
interface StatusEffect {
  // ... existing properties
  behaviors?: {
    isShield?: boolean;           // Effect absorbs damage
    isDreamShield?: boolean;      // Shield converts absorbed damage to healing
    isFocus?: boolean;            // Multiplicative damage boost (replaces base damage)
    preventsActions?: boolean;    // Prevents entity from taking actions (stun)
    damageReduction?: boolean;    // Reduces incoming/outgoing damage
    damageBoost?: boolean;        // Increases damage output
    oneTimeUse?: boolean;         // Effect is consumed after use
  };
}
```

## Hook Functions

Status effects can now define custom behavior through hook functions:

```typescript
interface StatusEffect {
  // ... existing properties
  onApply?: (entity: BattleEntity, effect: StatusEffect) => void;
  onRemove?: (entity: BattleEntity, effect: StatusEffect) => void;
  onTick?: (entity: BattleEntity, effect: StatusEffect) => void;
  onDamageDealt?: (attacker: BattleEntity, target: BattleEntity, damage: number, effect: StatusEffect) => number;
  onDamageReceived?: (attacker: BattleEntity, target: BattleEntity, damage: number, effect: StatusEffect) => number;
  onHeal?: (healer: BattleEntity, target: BattleEntity, amount: number, effect: StatusEffect) => number;
}
```

### Hook Examples

#### Custom Damage Modification
```typescript
const berserkerRage: StatusEffect = {
  name: "Berserker Rage",
  type: "buff",
  duration: 10.0,
  value: 1.0,
  onDamageDealt: (attacker, target, damage, effect) => {
    // Increase damage based on missing health
    const missingHealthPercent = 1 - (attacker.hp / attacker.maxHp);
    return damage * (1 + missingHealthPercent);
  }
};
```

#### Custom Healing Effect
```typescript
const vampiricAura: StatusEffect = {
  name: "Vampiric Aura",
  type: "buff",
  duration: 15.0,
  value: 1.0,
  onDamageDealt: (attacker, target, damage, effect) => {
    // Heal attacker for 25% of damage dealt
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + damage * 0.25);
    return damage; // Don't modify the actual damage
  }
};
```

## BaseAbility Helper Methods

The `BaseAbility` class now provides helper methods for creating common status effects:

### Shield Effects
```typescript
protected createShieldEffect(name: string, value: number, duration: number, isDreamShield: boolean = false): StatusEffect

// Usage
this.applyStatusToCaster(context, this.createShieldEffect("Magic Shield", 50, 8.0));
this.applyStatusToCaster(context, this.createShieldEffect("Dream Shield", 30, 5.0, true));
```

### Damage Effects
```typescript
protected createDamageBoostEffect(name: string, boostMultiplier: number, duration: number): StatusEffect
protected createFocusEffect(name: string, multiplier: number, duration: number): StatusEffect
protected createDamageReductionEffect(name: string, reductionMultiplier: number, duration: number): StatusEffect

// Usage
this.applyStatusToCaster(context, this.createDamageBoostEffect("Power Up", 1.5, 10.0));
this.applyStatusToCaster(context, this.createFocusEffect("Focused Strike", 2.0, 999)); // One-time use
this.applyStatusToTargets(context, this.createDamageReductionEffect("Armor", 0.7, 12.0));
```

### Control Effects
```typescript
protected createStunEffect(name: string, duration: number): StatusEffect
protected createFearEffect(name: string, damageReduction: number, duration: number): StatusEffect

// Usage
this.applyStatusToTargets(context, this.createStunEffect("Paralysis", 3.0));
this.applyStatusToTargets(context, this.createFearEffect("Terror", 0.5, 5.0));
```

## Event System

Entities can now listen to and emit battle events:

### New Event Types
- `before_damage`: Emitted before damage calculation
- `after_damage`: Emitted after damage is applied
- `before_heal`: Emitted before healing calculation
- `after_heal`: Emitted after healing is applied
- `turn_start`: Emitted at the start of an entity's turn
- `turn_end`: Emitted at the end of an entity's turn

### Event Modification
Events can be modified by listeners:

```typescript
interface BattleEvent {
  // ... existing properties
  preventDefault?: boolean;    // Prevent the event from occurring
  modifiedValue?: number;      // Modify the damage/heal amount
}
```

### Using Events in Abilities
```typescript
export class ReactiveAbility extends BaseAbility {
  execute(context: AbilityContext): void {
    // Set up event listener for damage
    const onDamageReceived = (event: BattleEvent) => {
      if (event.type === "before_damage" && event.target === context.caster.id) {
        // Reduce incoming damage by 20%
        event.modifiedValue = (event.value || 0) * 0.8;
      }
    };
    
    // Register listener
    context.caster.on("before_damage", onDamageReceived);
    
    // Apply a status effect that will clean up the listener
    this.applyStatusToCaster(context, {
      name: "Reactive Defense",
      type: "buff",
      duration: 10.0,
      value: 1.0,
      onRemove: (entity, effect) => {
        entity.off("before_damage", onDamageReceived);
      }
    });
  }
}
```

## Migration Guide

### Before (Hardcoded Names)
```typescript
// Battle Engine - OLD
if (effect.name.includes("Shield")) {
  // Shield logic
}
if (effect.name === "Stun") {
  return false; // Prevent action
}

// Ability - OLD
this.applyStatusToCaster(context, {
  name: "Power Boost",
  type: "buff",
  duration: 10.0,
  value: 1.3,
});
```

### After (Behavioral Flags)
```typescript
// Battle Engine - NEW
if (effect.behaviors?.isShield) {
  // Shield logic
}
if (effect.behaviors?.preventsActions) {
  return false; // Prevent action
}

// Ability - NEW
this.applyStatusToCaster(context, this.createDamageBoostEffect("Power Boost", 1.3, 10.0));
```

## Benefits

1. **Maintainability**: No more hardcoded string checks in the battle engine
2. **Extensibility**: Easy to add new behaviors without engine changes
3. **Flexibility**: Custom hooks allow complex, unique effects
4. **Performance**: Behavioral flags are faster than string operations
5. **Type Safety**: Better TypeScript support and compile-time checking
6. **Reusability**: Helper methods reduce code duplication

## Best Practices

1. **Use Helper Methods**: Prefer `createDamageBoostEffect()` over manual status creation
2. **Combine Behaviors**: Effects can have multiple behavioral flags
3. **Clean Up Listeners**: Always remove event listeners in `onRemove` hooks
4. **Document Custom Hooks**: Complex hook logic should be well-commented
5. **Test Edge Cases**: Ensure hooks handle all possible scenarios

This system provides a solid foundation for creating complex, interactive abilities while keeping the battle engine clean and maintainable.