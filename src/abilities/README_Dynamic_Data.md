# Dynamic SoulBeast Data Loading

This document explains how abilities can now dynamically load their data from the SoulBeast constants, ensuring that changes to the SoulBeast data are automatically reflected in battle implementations.

## Overview

Abilities can now automatically load their damage values, cooldowns, and other properties directly from the `AllSoulBeast` constants in `src/engine/SoulBeast.ts`. This means when you update ability data in the SoulBeast file, it will automatically be used in battles without needing to manually update each ability implementation.

## How to Update Abilities

### Step 1: Update the Constructor

Change your ability constructor to call the parent constructor with the character name and ability name:

```typescript
export class VoidWind extends BaseAbility {
  constructor() {
    super("Astrix", "Void Wind"); // Character name and ability name from SoulBeast data
  }
  
  // ... rest of implementation
}
```

### Step 2: Use Dynamic Data Loading

Replace hardcoded values with data loaded from SoulBeast:

```typescript
execute(context: AbilityContext): void {
  const abilityData = this.getAbilityData();
  const damage = abilityData?.damage ?? 21; // Use SoulBeast data with fallback
  
  // Use the dynamic damage value
  context.dealDamage(context.caster, target, damage);
  
  // Use dynamic ability name in events
  context.addEvent({
    // ...
    ability: abilityData?.name ?? "Void Wind",
    // ...
  });
}
```

### Step 3: Handle Optional Data

Always provide fallback values in case the SoulBeast data is not available:

```typescript
const damage = abilityData?.damage ?? 21; // Original hardcoded value as fallback
const castTime = abilityData?.castTime ?? 2.1; // Fallback for cast time
const abilityName = abilityData?.name ?? "Ability Name"; // Fallback for ability name
```

## Benefits

1. **Automatic Updates**: When you change damage or other values in `SoulBeast.ts`, they automatically apply to battles
2. **Single Source of Truth**: All ability data is centralized in the SoulBeast constants
3. **Backward Compatibility**: Abilities that haven't been updated yet still work with their hardcoded values
4. **Easy Maintenance**: No need to update multiple files when balancing abilities

## Example: Updated Astrix Abilities

All Astrix abilities have been updated to use this new system:

- `VoidWind`: Loads damage (21) from SoulBeast data
- `DivinePunishment`: Loads base damage (38) and applies 2x multiplier for demons
- `StellarDash`: Loads damage (25) and cast time (2.1s)
- `ParadoxStorm`: Loads base damage (65) and applies 1.4x multiplier for divine/demon enemies

## Migration Strategy

You can gradually update abilities to use this system:

1. **High Priority**: Abilities that frequently need balance changes
2. **Medium Priority**: Complex abilities with multiple parameters
3. **Low Priority**: Simple abilities with stable values

Each ability class can be updated independently without breaking existing functionality.

## Testing

After updating an ability:
1. Verify it loads the correct data from SoulBeast
2. Test that fallback values work if SoulBeast data is missing
3. Confirm battle behavior matches expected SoulBeast values
4. Check that ability names appear correctly in battle logs

## Available SoulBeast Properties

The following properties are available from `getAbilityData()`:

- `name`: Ability name
- `emoji`: Visual emoji icon
- `type`: "quick" | "power" | "ultimate"
- `cooldown`: Cooldown in seconds
- `damage`: Base damage value
- `effect`: Description of special effects
- `description`: Full ability description
- `target`: Target type ("single-enemy", "all-enemy", etc.)
- `castTime`: Cast time in seconds (optional)
- `initiationTime`: Initial delay before first use (optional)
