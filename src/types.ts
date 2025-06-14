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
  type: 'quick' | 'power' | 'ultimate';
  cooldown: number;
  damage: number;
  effect: string;
  description: string;
  castTime?: number; // in seconds
}

export interface CharacterAbilities {
  name: string;
  title: string;
  composition: ElementComposition;
  abilities: Ability[];
}

export interface StatusEffect {
  name: string;
  type: 'buff' | 'debuff' | 'dot' | 'hot';
  duration: number;
  value: number;
  tickInterval?: number;
  remainingTicks?: number;
}

export interface BattleEntity {
  id: string;
  character: CharacterAbilities;
  hp: number;
  maxHp: number;
  armor: number;
  damageMultiplier: number;
  movementSpeed: number;
  attackSpeed: number;
  statusEffects: StatusEffect[];
  abilityCooldowns: Map<string, number>;
  currentCast?: {
    ability: Ability;
    timeRemaining: number;
    target?: string;
  };
  isAlive: boolean;
  position: { x: number; y: number };
}

export interface BattleEvent {
  timestamp: number;
  type: 'damage' | 'heal' | 'cast_start' | 'cast_complete' | 'ability_used' | 'status_applied' | 'status_removed' | 'death';
  source: string;
  target?: string;
  ability?: string;
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
