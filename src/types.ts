import { AllSoulBeast } from "./engine/SoulBeast";

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
}

export interface Ability {
  name: string;
  emoji: string;
  type: "quick" | "power" | "ultimate";
  cooldown: number;
  damage: number;
  effect: string;
  description: string;
  target:
    | "single-enemy"
    | "all-enemy"
    | "single-friend"
    | "all-friend"
    | "self";
  castTime?: number; // in seconds
  initiationTime?: number; // initial delay before first use (in seconds)
}
export type SoulBeastName = keyof typeof AllSoulBeast;

export interface SoulBeast {
  name: SoulBeastName;
  title: string;
  composition: ElementComposition;
  abilities: Ability[];
}
export interface SoulBeastUI extends SoulBeast {
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
    | "ability_used"
    | "status_applied"
    | "status_removed"
    | "death"
    | "system";
  source: string;
  target?: string;
  ability?: Ability;
  value?: number;
  statusEffect?: StatusEffect;
  message: string;
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
