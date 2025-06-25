# SoulBeast Ability Verification Scripts

This repository includes CLI scripts to verify that all abilities defined in `SoulBeast.ts` have corresponding implementations in the abilities folder.

## Scripts

### 1. Basic Verification (`verify-abilities.ts`)

A simple script that checks for missing implementations and orphaned abilities.

```bash
# Run basic verification
bun run verify-abilities.ts
```

**Output:**
- Summary of defined vs implemented abilities
- List of missing implementations with associated SoulBeasts
- List of orphaned implementations (implemented but not defined)
- Exit code 0 if all good, 1 if issues found

### 2. Detailed Verification (`verify-abilities-detailed.ts`)

An enhanced script with organized output and additional options.

```bash
# Basic detailed verification
bun run verify-abilities-detailed.ts

# Show ability details (type, damage, effect, description)
bun run verify-abilities-detailed.ts --details
bun run verify-abilities-detailed.ts -d

# Show suggested class names for missing abilities
bun run verify-abilities-detailed.ts --suggestions
bun run verify-abilities-detailed.ts -s

# Combine options
bun run verify-abilities-detailed.ts --details --suggestions
```

**Features:**
- Groups missing abilities by SoulBeast character
- Shows which character files exist/missing
- Suggests TypeScript class names for missing abilities
- Optional detailed ability information
- Color-coded output for better readability

## Example Output

```
🔍 SoulBeast Ability Implementation Verification (Detailed)
============================================================

📊 Summary:
   Defined abilities: 70
   Implemented abilities: 113

❌ Missing Implementations (22):

   📁 Bone Thurak (BoneThurak.ts) ✅:
      • Fossilize
      • Magma Spit
      • Petrifying Gaze
      • Demonic Core
      • Unearth

      💡 Suggested class names:
         Fossilize → class Fossilize
         Magma Spit → class MagmaSpit
         Petrifying Gaze → class PetrifyingGaze
         Demonic Core → class DemonicCore
         Unearth → class Unearth
```

## Integration

These scripts can be integrated into your development workflow:

### Pre-commit Hook
```bash
# Add to .git/hooks/pre-commit
bun run verify-abilities.ts
```

### CI/CD Pipeline
```yaml
# Add to your GitHub Actions or similar
- name: Verify Abilities
  run: bun run verify-abilities.ts
```

### NPM Scripts
```json
{
  "scripts": {
    "verify-abilities": "bun run verify-abilities.ts",
    "verify-abilities:detailed": "bun run verify-abilities-detailed.ts --suggestions"
  }
}
```

## File Structure

The scripts expect this file structure:
```
src/
├── engine/
│   └── SoulBeast.ts          # Ability definitions
└── abilities/
    ├── AbilityRegistry.ts     # Ability implementations registry
    └── cards/
        ├── BoneThurak.ts      # Character-specific abilities
        ├── VoidGhorth.ts
        └── ...
```

## Exit Codes

- `0`: All abilities properly implemented
- `1`: Missing implementations or orphaned abilities found