// Server-side battle engine - authoritative version of BattleEngine

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
  priority?: number;
  value?: number;
  abilityName?: string | string[];
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
    | "single-ally"
    | "all-ally"
    | "self";
  castTime: number;
  initiationTime?: number;
  soulshardCost: number;
  activationConditions: readonly AbilityCondition[];
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
  behaviors?: {
    isShield?: boolean;
    isDreamShield?: boolean;
    isFocus?: boolean;
    preventsActions?: boolean;
    damageReduction?: boolean;
    damageBoost?: boolean;
    oneTimeUse?: boolean;
    accuracyReduction?: boolean;
    evasion?: boolean;
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
  abilityInitiationTimes: Map<string, number>;
  currentCast?: {
    ability: Ability;
    timeRemaining: number;
    target?: string;
  };
  lastCast?: {
    ability: Ability;
    timeRemaining: number;
    target?: string;
  };
  isAlive: boolean;
  position: { x: number; y: number };
}

export interface BattleEvent {
  timestamp: number;
  type:
    | "damage"
    | "heal"
    | "cast_start"
    | "cast_complete"
    | "cast_interrupted"
    | "death"
    | "status_applied"
    | "status_removed"
    | "system";
  source: string;
  target?: string;
  message: string;
  value?: number;
  ability?: Ability;
}

export interface PlayerState {
  id: string;
  name: string;
  cardIds: string[];
  isAlive: boolean;
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
  countdownTimeRemaining: number;
}

export interface BattleConfig {
  maxHp: number;
  tickRate: number;
  battlefieldSize: { width: number; height: number };
  castInterruption: boolean;
}

export class ServerBattleEngine {
  private config: BattleConfig;
  private state: BattleState;
  private lastUpdateTime: number;

  constructor(config: Partial<BattleConfig> = {}) {
    this.config = {
      maxHp: 200,
      tickRate: 100,
      battlefieldSize: { width: 1000, height: 1000 },
      castInterruption: true,
      ...config,
    };

    this.state = {
      entities: new Map(),
      players: new Map(),
      events: [],
      startTime: Date.now(),
      currentTime: Date.now(),
      isActive: false,
      winner: undefined,
      countdownActive: false,
      countdownTimeRemaining: 0,
    };

    this.lastUpdateTime = Date.now();
  }

  public initializeBattle(
    player1Cards: {
      cardName: string;
      configuration: { name: string; abilities: readonly string[] };
    }[],
    player2Cards: {
      cardName: string;
      configuration: { name: string; abilities: readonly string[] };
    }[]
  ): boolean {
    if (player1Cards.length === 0 || player2Cards.length === 0) {
      return false;
    }

    // Clear previous state
    this.state.entities.clear();
    this.state.players.clear();
    this.state.events = [];

    // Create player states
    const player1State: PlayerState = {
      id: "player1",
      name: "Player 1",
      cardIds: [],
      isAlive: true,
    };

    const player2State: PlayerState = {
      id: "player2",
      name: "Player 2",
      cardIds: [],
      isAlive: true,
    };

    // Create entities for player 1 cards
    for (let i = 0; i < player1Cards.length; i++) {
      const cardWithConfig = player1Cards[i];
      if (!cardWithConfig) continue;
      const entityId = `player1_card${i}`;
      const entity = this.createEntity(entityId, cardWithConfig);

      // Position cards in formation
      if (player1Cards.length === 1) {
        entity.position = { x: 200, y: 500 };
      } else {
        entity.position = {
          x: 100 + i * 80,
          y: 500 + (i % 2) * 100 - 50,
        };
      }

      this.state.entities.set(entityId, entity);
      player1State.cardIds.push(entityId);
    }

    // Create entities for player 2 cards
    for (let i = 0; i < player2Cards.length; i++) {
      const cardWithConfig = player2Cards[i];
      if (!cardWithConfig) continue;
      const entityId = `player2_card${i}`;
      const entity = this.createEntity(entityId, cardWithConfig);

      // Position cards on opposite side
      if (player2Cards.length === 1) {
        entity.position = { x: 800, y: 500 };
      } else {
        entity.position = {
          x: 900 - i * 80,
          y: 500 + (i % 2) * 100 - 50,
        };
      }

      this.state.entities.set(entityId, entity);
      player2State.cardIds.push(entityId);
    }

    // Add players to state
    this.state.players.set("player1", player1State);
    this.state.players.set("player2", player2State);

    // Start countdown
    this.state.countdownActive = true;
    this.state.countdownTimeRemaining = 5.0;
    this.state.isActive = false;
    this.state.startTime = Date.now();
    this.state.currentTime = Date.now();

    this.addEvent({
      timestamp: Date.now(),
      type: "system",
      source: "system",
      message: `Battle countdown started`,
    });

    return true;
  }

  private createEntity(
    id: string,
    cardWithConfig: {
      cardName: string;
      configuration: { name: string; abilities: readonly string[] };
    }
  ): BattleEntity {
    // For now, create a basic entity structure
    // In a real implementation, you'd load the card data from a registry
    const entity: BattleEntity = {
      id,
      character: {
        name: cardWithConfig.cardName,
        title: cardWithConfig.configuration.name,
        composition: {},
        abilities: [],
        image: "",
      },
      hp: this.config.maxHp,
      maxHp: this.config.maxHp,
      armor: 0,
      damageMultiplier: 1.0,
      statusEffects: [],
      abilityCooldowns: new Map(),
      abilityInitiationTimes: new Map(),
      isAlive: true,
      position: { x: 0, y: 0 },
    };

    return entity;
  }

  public update(): void {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    this.state.currentTime = now;
    const dt = deltaTime / 1000;

    // Handle countdown phase
    if (this.state.countdownActive) {
      this.state.countdownTimeRemaining -= dt;

      if (this.state.countdownTimeRemaining <= 0) {
        this.state.countdownActive = false;
        this.state.countdownTimeRemaining = 0;
        this.state.isActive = true;

        this.addEvent({
          timestamp: Date.now(),
          type: "system",
          source: "system",
          message: "FIGHT!",
        });
      }
      return;
    }

    if (!this.state.isActive) return;

    // Update all entities
    for (const entity of this.state.entities.values()) {
      this.updateEntity(entity, dt);
    }

    // Check win conditions
    this.checkWinConditions();
  }

  private updateEntity(entity: BattleEntity, deltaTime: number): void {
    if (!entity.isAlive) {
      if (entity.currentCast) {
        entity.currentCast = undefined;
      }
      return;
    }

    // Update ability cooldowns
    for (const [abilityName, cooldown] of entity.abilityCooldowns.entries()) {
      const newCooldown = Math.max(0, cooldown - deltaTime);
      if (newCooldown === 0) {
        entity.abilityCooldowns.delete(abilityName);
      } else {
        entity.abilityCooldowns.set(abilityName, newCooldown);
      }
    }

    // Update ability initiation times
    for (const [abilityName, initTime] of entity.abilityInitiationTimes.entries()) {
      const newInitTime = Math.max(0, initTime - deltaTime);
      if (newInitTime === 0) {
        entity.abilityInitiationTimes.delete(abilityName);
      } else {
        entity.abilityInitiationTimes.set(abilityName, newInitTime);
      }
    }

    // Update current cast
    if (entity.currentCast) {
      entity.currentCast.timeRemaining -= deltaTime;
      if (entity.currentCast.timeRemaining <= 0) {
        this.completeCast(entity);
      }
    }

    // Update status effects
    this.updateStatusEffects(entity, deltaTime);
  }

  private completeCast(entity: BattleEntity): void {
    if (!entity.currentCast) return;

    const cast = entity.currentCast;
    entity.lastCast = { ...cast };
    entity.currentCast = undefined;

    this.addEvent({
      timestamp: Date.now(),
      type: "cast_complete",
      source: entity.id,
      target: cast.target,
      message: `${entity.character.name} completed ${cast.ability.name}`,
      ability: cast.ability,
    });

    // Apply ability effects here
    this.applyAbilityEffects(entity, cast.ability, cast.target);
  }

  private applyAbilityEffects(caster: BattleEntity, ability: Ability, targetId?: string): void {
    // Basic damage application - extend this for full ability system
    if (targetId && ability.damage > 0) {
      const target = this.state.entities.get(targetId);
      if (target && target.isAlive) {
        this.dealDamage(caster, target, ability.damage);
      }
    }
  }

  private dealDamage(attacker: BattleEntity, target: BattleEntity, damage: number): void {
    const finalDamage = Math.max(0, damage - target.armor);
    target.hp = Math.max(0, target.hp - finalDamage);

    this.addEvent({
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      message: `${target.character.name} takes ${finalDamage} damage`,
      value: finalDamage,
    });

    if (target.hp <= 0) {
      this.killEntity(target);
    }
  }

  private killEntity(entity: BattleEntity): void {
    entity.isAlive = false;
    entity.hp = 0;
    entity.currentCast = undefined;

    this.addEvent({
      timestamp: Date.now(),
      type: "death",
      source: entity.id,
      message: `${entity.character.name} has been defeated`,
    });
  }

  private updateStatusEffects(entity: BattleEntity, deltaTime: number): void {
    entity.statusEffects = entity.statusEffects.filter(effect => {
      effect.duration -= deltaTime;
      return effect.duration > 0;
    });
  }

  private checkWinConditions(): void {
    if (this.state.winner) return;

    const player1Alive = this.state.players.get("player1")?.cardIds.some(id => 
      this.state.entities.get(id)?.isAlive
    );
    const player2Alive = this.state.players.get("player2")?.cardIds.some(id => 
      this.state.entities.get(id)?.isAlive
    );

    if (!player1Alive && !player2Alive) {
      this.state.winner = "draw";
      this.state.isActive = false;
    } else if (!player1Alive) {
      this.state.winner = "player2";
      this.state.isActive = false;
    } else if (!player2Alive) {
      this.state.winner = "player1";
      this.state.isActive = false;
    }

    if (this.state.winner) {
      this.addEvent({
        timestamp: Date.now(),
        type: "system",
        source: "system",
        message: `Battle ended - Winner: ${this.state.winner}`,
      });
    }
  }

  public handlePlayerAction(playerId: string, action: any): boolean {
    if (!this.state.isActive) return false;

    // Validate and process player action
    // This is a simplified version - extend for full action validation
    return true;
  }

  private addEvent(event: BattleEvent): void {
    this.state.events.push(event);
    // Keep only recent events to prevent memory bloat
    if (this.state.events.length > 100) {
      this.state.events = this.state.events.slice(-50);
    }
  }

  public getState(): BattleState {
    return {
      ...this.state,
      entities: new Map(this.state.entities),
      players: new Map(this.state.players),
      events: [...this.state.events],
    };
  }

  public getStateForPlayer(playerId: string): any {
    // Return state filtered for specific player (hide opponent's private info)
    const state = this.getState();
    return {
      ...state,
      entities: Object.fromEntries(state.entities),
      players: Object.fromEntries(state.players),
    };
  }
}