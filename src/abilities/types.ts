import { BattleEntity, StatusEffect } from "../types";

export interface AbilityContext {
  caster: BattleEntity;
  targets: BattleEntity[];
  allEntities: Map<string, BattleEntity>;
  getCurrentTime: () => number;
  addEvent: (event: any) => void;
  applyStatusEffect: (entity: BattleEntity, effect: StatusEffect) => void;
  dealDamage: (attacker: BattleEntity, target: BattleEntity, damage: number) => void;
  heal: (entity: BattleEntity, amount: number) => void;
}

export interface AbilityImplementation {
  execute: (context: AbilityContext) => void;
}

export interface AbilityRegistry {
  [abilityName: string]: AbilityImplementation;
}
