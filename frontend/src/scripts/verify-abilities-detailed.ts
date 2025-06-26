#!/usr/bin/env bun

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AllSoulBeast } from '../engine/SoulBeast';
import { abilityRegistry } from '../abilities/AbilityRegistry';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

interface AbilityInfo {
  name: string;
  slug: string;
  soulBeasts: string[];
  type: string;
  damage: number;
  effect: string;
  description: string;
}

function extractAbilitiesFromSoulBeast(): Map<string, AbilityInfo> {
  const abilities = new Map<string, AbilityInfo>();
  
  Object.entries(AllSoulBeast).forEach(([soulBeastName, soulBeast]) => {
    soulBeast.abilities.forEach(ability => {
      if (abilities.has(ability.name)) {
        // Add this soul beast to the existing ability
        abilities.get(ability.name)!.soulBeasts.push(soulBeastName);
      } else {
        // Create new ability info
        abilities.set(ability.name, {
          name: ability.name,
          slug: ability.slug,
          soulBeasts: [soulBeastName],
          type: ability.type,
          damage: ability.damage,
          effect: ability.effect,
          description: ability.description
        });
      }
    });
  });
  
  return abilities;
}

function getImplementedAbilities(): Set<string> {
  return new Set(Object.keys(abilityRegistry));
}

function getSoulBeastFileName(soulBeastName: string): string {
  // Convert "Keth Stalker" to "KethStalker"
  return soulBeastName.replace(/\s+/g, '');
}

function checkFileExists(soulBeastName: string): boolean {
  const fileName = getSoulBeastFileName(soulBeastName);
  const filePath = join('./src/abilities/cards', `${fileName}.ts`);
  return existsSync(filePath);
}

function generateClassNameFromAbility(abilityName: string): string {
  // Convert "Nightmare Frost" to "NightmareFrost"
  return abilityName.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '');
}

function main() {
  const args = process.argv.slice(2);
  const showDetails = args.includes('--details') || args.includes('-d');
  const showSuggestions = args.includes('--suggestions') || args.includes('-s');
  
  log('🔍 SoulBeast Ability Implementation Verification (Detailed)', 'blue');
  log('=' .repeat(60), 'blue');
  
  const definedAbilities = extractAbilitiesFromSoulBeast();
  const implementedAbilities = getImplementedAbilities();
  
  log(`\n📊 Summary:`, 'bold');
  log(`   Defined abilities: ${definedAbilities.size}`);
  log(`   Implemented abilities: ${implementedAbilities.size}`);
  
  // Find missing implementations
  const missingAbilities: AbilityInfo[] = [];
  definedAbilities.forEach((abilityInfo, abilityName) => {
    if (!implementedAbilities.has(abilityName)) {
      missingAbilities.push(abilityInfo);
    }
  });
  
  if (missingAbilities.length > 0) {
    log(`\n❌ Missing Implementations (${missingAbilities.length}):`, 'red');
    
    // Group by soul beast for better organization
    const groupedBySoulBeast = new Map<string, AbilityInfo[]>();
    missingAbilities.forEach(ability => {
      ability.soulBeasts.forEach(soulBeast => {
        if (!groupedBySoulBeast.has(soulBeast)) {
          groupedBySoulBeast.set(soulBeast, []);
        }
        groupedBySoulBeast.get(soulBeast)!.push(ability);
      });
    });
    
    groupedBySoulBeast.forEach((abilities, soulBeast) => {
      const fileExists = checkFileExists(soulBeast);
      const fileName = getSoulBeastFileName(soulBeast);
      
      log(`\n   📁 ${soulBeast} (${fileName}.ts) ${fileExists ? '✅' : '❌ FILE MISSING'}:`, 'cyan');
      
      abilities.forEach(ability => {
        log(`      • ${ability.name}`, 'red');
        if (showDetails) {
          log(`        Type: ${ability.type} | Damage: ${ability.damage} | Effect: ${ability.effect}`, 'dim');
          log(`        Description: ${ability.description}`, 'dim');
        }
      });
      
      if (showSuggestions && abilities.length > 0) {
        log(`\n      💡 Suggested class names:`, 'yellow');
        abilities.forEach(ability => {
          const className = generateClassNameFromAbility(ability.name);
          log(`         ${ability.name} → class ${className}`, 'yellow');
        });
      }
    });
  } else {
    log(`\n✅ All defined abilities have implementations!`, 'green');
  }
  
  // Find orphaned implementations
  const orphanedImplementations: string[] = [];
  implementedAbilities.forEach(ability => {
    if (!definedAbilities.has(ability)) {
      orphanedImplementations.push(ability);
    }
  });
  
  if (orphanedImplementations.length > 0) {
    log(`\n⚠️  Orphaned Implementations (${orphanedImplementations.length}):`, 'yellow');
    orphanedImplementations.sort().forEach(ability => {
      log(`   • ${ability} (implemented but not defined in SoulBeast.ts)`, 'yellow');
    });
  } else {
    log(`\n✅ No orphaned implementations found!`, 'green');
  }
  
  // Show usage help
  if (!showDetails && !showSuggestions && missingAbilities.length > 0) {
    log(`\n💡 Use --details (-d) to see ability details`, 'cyan');
    log(`💡 Use --suggestions (-s) to see suggested class names`, 'cyan');
  }
  
  // Overall status
  const hasIssues = missingAbilities.length > 0 || orphanedImplementations.length > 0;
  
  log(`\n${'='.repeat(60)}`, 'blue');
  if (hasIssues) {
    log(`❌ Verification FAILED - ${missingAbilities.length} missing, ${orphanedImplementations.length} orphaned`, 'red');
    process.exit(1);
  } else {
    log(`✅ Verification PASSED - All abilities are properly implemented!`, 'green');
    process.exit(0);
  }
}

if ((import.meta as any).main) {
  main();
}