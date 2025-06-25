export interface ElementComposition {
  frost?: number;
  demon?: number;
  water?: number;
  fire?: number;
  beast?: number;
  earth?: number;
  nature?: number;
  wind?: number;
  divine?: number;
}

export interface Character {
  name: string;
  title: string;
  composition: ElementComposition;
  image: string;
}

export interface AbilityCondition {
  type:
    | "on_available"
    | "at_start"
    | "after_damage_taken"
    | "after_heal"
    | "on_own_hp_above"
    | "on_own_hp_below"
    | "on_enemy_hp_above"
    | "on_enemy_hp_below"
    | "after_enemy_dodges"
    | "after_ability_used";
  priority?: number; // For 'on_available' to set order
  value?: number; // For HP thresholds
  abilityName?: string; // For after_ability_used
}

export interface Ability {
  name: string;
  slug: string;
  type: "quick" | "power" | "ultimate" | "passive";
  cooldown: number;
  damage: number;
  effect: string;
  description: string;
  target:
    | "single-enemy"
    | "all-enemy"
    | "single-friend"
    | "all-friend"
    | "self"
    | "ally";
  castTime: number; // in seconds
  initiationTime?: number; // initial delay before first use (in seconds)
  soulshardCost: number; // cost in soulshards
  activationConditions: readonly AbilityCondition[]; // conditions for automatic activation
}

export interface SoulBeast {
  name: string;
  title: string;
  composition: ElementComposition;
  abilities: readonly Ability[];
  image: string;
}

export interface StatusEffect {
  name: string;
  type: "buff" | "debuff" | "dot" | "hot";
  duration: number;
  value: number;
  tickInterval?: number;
  remainingTicks?: number;
  ability?: Ability;
  // Hook functions for custom behavior
  onApply?: (entity: BattleEntity, effect: StatusEffect) => void;
  onRemove?: (entity: BattleEntity, effect: StatusEffect) => void;
  onTick?: (entity: BattleEntity, effect: StatusEffect) => void;
  onDamageDealt?: (attacker: BattleEntity, target: BattleEntity, damage: number, effect: StatusEffect) => number;
  onDamageReceived?: (attacker: BattleEntity, target: BattleEntity, damage: number, effect: StatusEffect) => number;
  onHeal?: (healer: BattleEntity, target: BattleEntity, amount: number, effect: StatusEffect) => number;
  // Behavioral flags to replace hardcoded name checks
  behaviors?: {
    isShield?: boolean;
    isDreamShield?: boolean;
    isFocus?: boolean;
    preventsActions?: boolean;
    damageReduction?: boolean;
    damageBoost?: boolean;
    oneTimeUse?: boolean;
  };
}

export interface BattleEntity {
  id: string;
  character: SoulBeast;
  hp: number;
  maxHp: number;
  armor: number;
  damageMultiplier: number;
  statusEffects: StatusEffect[];
  abilityCooldowns: Map<string, number>;
  abilityInitiationTimes: Map<string, number>; // tracks when abilities become available for first use
  currentCast?: {
    ability: Ability;
    timeRemaining: number;
    target?: string;
  };
  isAlive: boolean;
  position: { x: number; y: number };
  eventListeners: Map<BattleEvent['type'], Array<(event: BattleEvent) => void>>;
  on: (eventType: BattleEvent['type'], callback: (event: BattleEvent) => void) => void;
  off: (eventType: BattleEvent['type'], callback: (event: BattleEvent) => void) => void;
  emit: (event: BattleEvent) => void;
}

export interface BattleEvent {
  timestamp: number;
  type:
    | "damage"
    | "heal"
    | "cast_start"
    | "cast_complete"
    | "cast_interrupted"
    | "ability_used"
    | "status_applied"
    | "status_removed"
    | "death"
    | "system"
    | "before_damage"
    | "after_damage"
    | "before_heal"
    | "after_heal"
    | "turn_start"
    | "turn_end";
  source: string;
  target?: string;
  ability?: Ability;
  value?: number;
  statusEffect?: StatusEffect;
  message: string;
  // Allow events to be modified by listeners
  preventDefault?: boolean;
  modifiedValue?: number;
}

export interface BattleState {
  entities: Map<string, BattleEntity>;
  players: Map<string, PlayerState>;
  events: BattleEvent[];
  startTime: number;
  currentTime: number;
  isActive: boolean;
  winner?: string;
  countdownActive: boolean;
  countdownTimeRemaining: number; // in seconds
}

export interface PlayerState {
  id: string;
  name: string;
  cardIds: string[];
  isAlive: boolean;
}

export interface ActionInput {
  entityId: string;
  abilityName: string;
  targetId?: string;
  targetPosition?: { x: number; y: number };
}

export interface BattleConfig {
  maxHp: number;
  tickRate: number; // milliseconds between updates
  battlefieldSize: { width: number; height: number };
  castInterruption: boolean; // whether damage interrupts casting
}

export interface SimulatorTimingConfig {
  updateInterval: number; // milliseconds between engine updates
  statusDisplayInterval: number; // milliseconds between status displays
  aiActionInterval: number; // milliseconds between AI actions
  battleCheckInterval: number; // milliseconds between battle completion checks
}
