#!/usr/bin/env bun

import { AllSoulBeast } from '../frontend/src/engine/SoulBeast';
import { abilityRegistry } from '../frontend/src/abilities/AbilityRegistry';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

function extractAbilitiesFromSoulBeast(): Set<string> {
  const abilities = new Set<string>();
  
  // Extract all ability names from all SoulBeasts
  Object.values(AllSoulBeast).forEach(soulBeast => {
    soulBeast.abilities.forEach(ability => {
      abilities.add(ability.name);
    });
  });
  
  return abilities;
}

function getImplementedAbilities(): Set<string> {
  return new Set(Object.keys(abilityRegistry));
}

function findMissingAbilities(definedAbilities: Set<string>, implementedAbilities: Set<string>): string[] {
  const missing: string[] = [];
  
  definedAbilities.forEach(ability => {
    if (!implementedAbilities.has(ability)) {
      missing.push(ability);
    }
  });
  
  return missing.sort();
}

function findOrphanedImplementations(definedAbilities: Set<string>, implementedAbilities: Set<string>): string[] {
  const orphaned: string[] = [];
  
  implementedAbilities.forEach(ability => {
    if (!definedAbilities.has(ability)) {
      orphaned.push(ability);
    }
  });
  
  return orphaned.sort();
}

function findAbilityBySoulBeast(abilityName: string): string[] {
  const soulBeasts: string[] = [];
  
  Object.entries(AllSoulBeast).forEach(([name, soulBeast]) => {
    const hasAbility = soulBeast.abilities.some(ability => ability.name === abilityName);
    if (hasAbility) {
      soulBeasts.push(name);
    }
  });
  
  return soulBeasts;
}

function main() {
  log('🔍 SoulBeast Ability Implementation Verification', 'blue');
  log('=' .repeat(50), 'blue');
  
  const definedAbilities = extractAbilitiesFromSoulBeast();
  const implementedAbilities = getImplementedAbilities();
  
  log(`\n📊 Summary:`, 'bold');
  log(`   Defined abilities: ${definedAbilities.size}`);
  log(`   Implemented abilities: ${implementedAbilities.size}`);
  
  // Find missing implementations
  const missingAbilities = findMissingAbilities(definedAbilities, implementedAbilities);
  
  if (missingAbilities.length > 0) {
    log(`\n❌ Missing Implementations (${missingAbilities.length}):`, 'red');
    missingAbilities.forEach(ability => {
      const soulBeasts = findAbilityBySoulBeast(ability);
      log(`   • ${ability} (used by: ${soulBeasts.join(', ')})`, 'red');
    });
  } else {
    log(`\n✅ All defined abilities have implementations!`, 'green');
  }
  
  // Find orphaned implementations
  const orphanedImplementations = findOrphanedImplementations(definedAbilities, implementedAbilities);
  
  if (orphanedImplementations.length > 0) {
    log(`\n⚠️  Orphaned Implementations (${orphanedImplementations.length}):`, 'yellow');
    orphanedImplementations.forEach(ability => {
      log(`   • ${ability} (implemented but not defined in SoulBeast.ts)`, 'yellow');
    });
  } else {
    log(`\n✅ No orphaned implementations found!`, 'green');
  }
  
  // Overall status
  const hasIssues = missingAbilities.length > 0 || orphanedImplementations.length > 0;
  
  log(`\n${'='.repeat(50)}`, 'blue');
  if (hasIssues) {
    log(`❌ Verification FAILED - Issues found!`, 'red');
    process.exit(1);
  } else {
    log(`✅ Verification PASSED - All abilities are properly implemented!`, 'green');
    process.exit(0);
  }
}

if (import.meta.main) {
  main();
}