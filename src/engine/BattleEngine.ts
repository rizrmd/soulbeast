import {
  Ability,
  ActionInput,
  BattleConfig,
  BattleEntity,
  BattleEvent,
  BattleState,
  PlayerState,
  SoulBeast,
  SoulBeastName,
  StatusEffect,
} from "../types";
import { DataLoader } from "./DataLoader";
import { abilityRegistry } from "../abilities";
import { AbilityContext } from "../abilities/types";

export class BattleEngine {
  private config: BattleConfig;
  private state: BattleState;

  constructor(config: Partial<BattleConfig> = {}) {
    this.config = {
      maxHp: 200,
      tickRate: 100, // 10 updates per second
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
  }

  public initializeBattle(
    player1Cards: SoulBeastName[],
    player2Cards: SoulBeastName[]
  ): boolean {
    if (player1Cards.length === 0 || player2Cards.length === 0) {
      return false;
    }

    // Clear previous state
    this.state.entities.clear();
    this.state.players.clear();

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
      const cardData = DataLoader.getSoulBeast(player1Cards[i]);
      if (!cardData) {
        console.warn(`Card not found: ${player1Cards[i]}`);
        continue;
      }

      const entityId = `player1_card${i}`;
      const entity = this.createEntity(entityId, cardData);

      // Position cards in formation - center single cards
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
      const cardData = DataLoader.getSoulBeast(player2Cards[i]);
      if (!cardData) {
        console.warn(`Card not found: ${player2Cards[i]}`);
        continue;
      }

      const entityId = `player2_card${i}`;
      const entity = this.createEntity(entityId, cardData);

      // Position cards in formation on opposite side - center single cards
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

    // Start countdown instead of battle
    this.state.countdownActive = true;
    this.state.countdownTimeRemaining = 0.0; // 5 seconds countdown
    this.state.isActive = false; // Battle is not active during countdown
    this.state.startTime = Date.now();
    this.state.currentTime = Date.now();

    this.addEvent({
      timestamp: Date.now(),
      type: "system",
      source: "system",
      message: `Battle countdown started: Player 1 (${player1Cards.length} ${player1Cards.length === 1 ? "card" : "cards"}) vs Player 2 (${player2Cards.length} ${player2Cards.length === 1 ? "card" : "cards"})`,
    });

    this.addEvent({
      timestamp: Date.now(),
      type: "system",
      source: "system",
      message: "Battle begins in 5 seconds...",
    });

    return true;
  }

  private createEntity(id: string, character: SoulBeast): BattleEntity {
    const eventListeners = new Map<BattleEvent['type'], Array<(event: BattleEvent) => void>>();
    
    const entity: BattleEntity = {
      id,
      character,
      hp: this.config.maxHp,
      maxHp: this.config.maxHp,
      armor: 0,
      damageMultiplier: 1.0,
      statusEffects: [],
      abilityCooldowns: new Map(),
      abilityInitiationTimes: new Map(),
      isAlive: true,
      position: { x: 0, y: 0 },
      eventListeners,
      on: (eventType: BattleEvent['type'], callback: (event: BattleEvent) => void) => {
        if (!eventListeners.has(eventType)) {
          eventListeners.set(eventType, []);
        }
        eventListeners.get(eventType)!.push(callback);
      },
      off: (eventType: BattleEvent['type'], callback: (event: BattleEvent) => void) => {
        const listeners = eventListeners.get(eventType);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      },
      emit: (event: BattleEvent) => {
        const listeners = eventListeners.get(event.type);
        if (listeners) {
          listeners.forEach(callback => callback(event));
        }
      }
    };

    // Initialize ability initiation times
    character.abilities.forEach(ability => {
      if (ability.initiationTime && ability.initiationTime > 0) {
        entity.abilityInitiationTimes.set(ability.name, ability.initiationTime);
      }
    });

    return entity;
  }

  public update(deltaTime: number): void {
    this.state.currentTime = Date.now();
    const dt = deltaTime / 1000; // Convert to seconds

    // Handle countdown phase
    if (this.state.countdownActive) {
      this.state.countdownTimeRemaining -= dt;
      
      // Check for countdown events (at 4, 3, 2, 1 seconds)
      const remainingSeconds = Math.ceil(this.state.countdownTimeRemaining);
      if (remainingSeconds <= 4 && remainingSeconds >= 1) {
        const lastEvent = this.state.events[this.state.events.length - 1];
        const expectedMessage = `${remainingSeconds}...`;
        
        // Only add countdown event if it's different from the last one
        if (!lastEvent || !lastEvent.message.includes(expectedMessage)) {
          this.addEvent({
            timestamp: Date.now(),
            type: "system",
            source: "system",
            message: expectedMessage,
          });
        }
      }
      
      // Countdown finished, start the actual battle
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
      
      return; // Don't update entities during countdown
    }

    // Normal battle update logic
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
      // Clear any casting for dead entities
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
    for (const [abilityName, initiationTime] of entity.abilityInitiationTimes.entries()) {
      const newInitiationTime = Math.max(0, initiationTime - deltaTime);
      if (newInitiationTime === 0) {
        entity.abilityInitiationTimes.delete(abilityName);
      } else {
        entity.abilityInitiationTimes.set(abilityName, newInitiationTime);
      }
    }

    // Update casting
    if (entity.currentCast) {
      entity.currentCast.timeRemaining -= deltaTime;

      if (entity.currentCast.timeRemaining <= 0) {
        // Cast completed
        this.completeCast(entity);
      }
    }

    // Update status effects
    this.updateStatusEffects(entity, deltaTime);
  }

  private completeCast(entity: BattleEntity): void {
    if (!entity.currentCast) return;

    const ability = entity.currentCast.ability;
    const targetId = entity.currentCast.target;

    this.addEvent({
      timestamp: Date.now(),
      type: "cast_complete",
      source: entity.id,
      target: targetId,
      ability: ability,
      message: `${entity.character.name} completed casting ${ability.name}`,
    });

    // Execute ability effect
    this.executeAbility(entity, ability, targetId);

    // Start cooldown
    entity.abilityCooldowns.set(ability.name, ability.cooldown);
    
    // Clear current cast
    entity.currentCast = undefined;
  }

  private executeAbility(
    caster: BattleEntity,
    ability: Ability,
    targetId?: string
  ): void {
    let targets: BattleEntity[] = [];

    // Determine targets based on ability target type
    if (ability.target === "self") {
      targets = [caster];
    } else if (ability.target === "single-enemy") {
      const target = targetId ? this.state.entities.get(targetId) : null;
      if (target && target.isAlive) {
        targets = [target];
      }
    } else if (ability.target === "all-enemy") {
      // Get all living enemies
      const casterTeam = caster.id.startsWith("player1_") ? "player1" : "player2";
      const enemyTeam = casterTeam === "player1" ? "player2" : "player1";
      
      targets = Array.from(this.state.entities.values()).filter(
        entity => entity.id.startsWith(enemyTeam + "_") && entity.isAlive
      );
    } else if (ability.target === "single-friend") {
      const target = targetId ? this.state.entities.get(targetId) : null;
      if (target && target.isAlive) {
        targets = [target];
      }
    } else if (ability.target === "all-friend") {
      // Get all living allies
      const casterTeam = caster.id.startsWith("player1_") ? "player1" : "player2";
      
      targets = Array.from(this.state.entities.values()).filter(
        entity => entity.id.startsWith(casterTeam + "_") && entity.isAlive && entity.id !== caster.id
      );
    }

    // Check if we have a custom implementation for this ability
    const abilityImplementation = abilityRegistry[ability.name];
    
    if (abilityImplementation) {
      // Use the custom ability implementation
      const context: AbilityContext = {
        caster,
        targets,
        allEntities: this.state.entities,
        getCurrentTime: () => Date.now(),
        addEvent: (event) => this.addEvent(event),
        applyStatusEffect: (entity, effect) => this.applyStatusEffect(entity, { ...effect, ability }),
        dealDamage: (attacker, target, damage) => this.dealDamageAmount(attacker, target, damage, ability),
        heal: (entity, amount) => this.heal(entity, amount, ability),
      };
      
      abilityImplementation.execute(context);
    } else {
      // No custom implementation found - log a warning
      console.warn(`No custom implementation found for ability: ${ability.name}. This ability will have no effect.`);
      
      this.addEvent({
        timestamp: Date.now(),
        type: "system",
        source: caster.id,
        message: `${ability.name} has no implementation - no effect`,
      });
    }
  }

  private dealDamageAmount(
    attacker: BattleEntity,
    target: BattleEntity,
    damage: number,
    ability?: Ability
  ): void {
    let finalDamage = damage * attacker.damageMultiplier;

    // Apply damage multiplier buffs (consumed on use)
    const damageBoostEffects = attacker.statusEffects.filter(
      effect => effect.type === "buff" && effect.value > 1.0
    );
    
    for (const effect of damageBoostEffects) {
      if (effect.name.includes("Focus")) {
        finalDamage *= effect.value; // Multiplicative for focus effects
      } else {
        finalDamage += damage * (effect.value - 1.0); // Additive for other boosts
      }
      
      // Remove consumed buffs (those with duration 999 are one-time use)
      if (effect.duration >= 999) {
        attacker.statusEffects = attacker.statusEffects.filter(e => e !== effect);
      }
    }

    // Apply damage reduction effects on target
    let shieldAbsorbed = 0;
    const shieldEffects = target.statusEffects.filter(
      effect => effect.type === "buff" && effect.name.includes("Shield")
    );
    
    for (const shield of shieldEffects) {
      const absorbed = Math.min(finalDamage, shield.value);
      finalDamage = Math.max(0, finalDamage - absorbed);
      shieldAbsorbed += absorbed;
      shield.value -= absorbed;
      
      if (shield.value <= 0) {
        // Shield broken - convert absorbed damage to healing for Dream Shield
        if (shield.name.includes("Dream")) {
          this.heal(target, shieldAbsorbed);
        }
        target.statusEffects = target.statusEffects.filter(e => e !== shield);
      }
    }
    
    // Apply damage reduction multipliers
    const damageReductionEffects = target.statusEffects.filter(
      effect => effect.type === "buff" && effect.value < 1.0 && effect.value > 0 && !effect.name.includes("Shield")
    );
    
    for (const effect of damageReductionEffects) {
      finalDamage *= effect.value; // Apply damage reduction multiplier
    }

    // Apply debuff effects on attacker that reduce damage output
    const attackDebuffs = attacker.statusEffects.filter(
      effect => effect.type === "debuff" && effect.name === "Fear"
    );
    
    for (const effect of attackDebuffs) {
      finalDamage *= effect.value; // Apply damage reduction from debuffs
    }

    finalDamage = Math.max(0, finalDamage - target.armor);
    target.hp = Math.max(0, target.hp - finalDamage);

    this.addEvent({
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      value: finalDamage,
      ability: ability,
      message: `${attacker.character.name} deals ${Math.round(finalDamage)} damage to ${target.character.name}`,
    });

    // Check if target died
    if (target.hp <= 0 && target.isAlive) {
      target.isAlive = false;
      target.currentCast = undefined; // Clear any ongoing cast when entity dies
      this.addEvent({
        timestamp: Date.now(),
        type: "death",
        source: attacker.id,
        target: target.id,
        message: `${target.character.name} has been defeated!`,
      });
    }

    // Interrupt casting if damage interrupts
    if (this.config.castInterruption && target.currentCast) {
      target.currentCast = undefined;
      this.addEvent({
        timestamp: Date.now(),
        type: "cast_start",
        source: target.id,
        message: `${target.character.name}'s cast was interrupted by damage`,
      });
    }
  }

  private heal(entity: BattleEntity, amount: number, ability?: Ability): void {
    const healAmount = Math.min(amount, entity.maxHp - entity.hp);
    entity.hp += healAmount;

    this.addEvent({
      timestamp: Date.now(),
      type: "heal",
      source: entity.id,
      target: entity.id,
      value: healAmount,
      ability: ability,
      message: `${entity.character.name} heals for ${healAmount} HP`,
    });
  }

  private applyStatusEffect(entity: BattleEntity, effect: StatusEffect): void {
    // Remove existing effect of same name
    entity.statusEffects = entity.statusEffects.filter(
      (e) => e.name !== effect.name
    );

    // Add new effect
    entity.statusEffects.push({ ...effect });

    this.addEvent({
      timestamp: Date.now(),
      type: "status_applied",
      source: entity.id,
      target: entity.id,
      statusEffect: effect,
      message: `${entity.character.name} is affected by ${effect.name}`,
    });
  }

  private updateStatusEffects(entity: BattleEntity, deltaTime: number): void {
    for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
      const effect = entity.statusEffects[i];
      effect.duration -= deltaTime;

      // Handle DOT/HOT effects
      if (
        (effect.type === "dot" || effect.type === "hot") &&
        effect.tickInterval
      ) {
        effect.remainingTicks = (effect.remainingTicks || 0) - deltaTime;

        if (effect.remainingTicks <= 0) {
          if (effect.type === "dot") {
            entity.hp = Math.max(0, entity.hp - effect.value);
            this.addEvent({
              timestamp: Date.now(),
              type: "damage",
              source: entity.id,
              target: entity.id,
              value: effect.value,
              ability: effect.ability,
              message: `${entity.character.name} takes ${effect.value} damage from ${effect.name}`,
            });
          } else if (effect.type === "hot") {
            this.heal(entity, effect.value, effect.ability);
          }

          effect.remainingTicks = effect.tickInterval;
        }
      }

      // Remove expired effects
      if (effect.duration <= 0) {
        entity.statusEffects.splice(i, 1);
        this.addEvent({
          timestamp: Date.now(),
          type: "status_removed",
          source: entity.id,
          target: entity.id,
          statusEffect: effect,
          message: `${effect.name} effect expired on ${entity.character.name}`,
        });
      }
    }
  }

  public attemptAction(action: ActionInput): boolean {
    const entity = this.state.entities.get(action.entityId);
    if (!entity || !entity.isAlive || !this.state.isActive) {
      return false;
    }

    // Check if entity is stunned
    if (entity.statusEffects.some((e) => e.name === "Stun")) {
      return false;
    }

    // Find the ability
    const ability = entity.character.abilities.find(
      (a) => a.name === action.abilityName
    );
    if (!ability) {
      return false;
    }

    // Check cooldown
    if (entity.abilityCooldowns.has(ability.name)) {
      return false;
    }

    // Check initiation time
    if (entity.abilityInitiationTimes.has(ability.name)) {
      return false;
    }

    // Check if already casting
    if (entity.currentCast) {
      return false;
    }

    // Start casting - all abilities require casting, even instant ones
    const castTime = ability.castTime || 0;

    entity.currentCast = {
      ability,
      timeRemaining: castTime,
      target: action.targetId,
    };

    this.addEvent({
      timestamp: Date.now(),
      type: "cast_start",
      source: entity.id,
      target: action.targetId,
      ability: ability,
      message: castTime > 0 
        ? `${entity.character.name} begins casting ${ability.name} (${castTime}s)`
        : `${entity.character.name} begins casting ${ability.name} (instant)`,
    });

    return true;
  }

  private checkWinConditions(): void {
    // Check which players have alive cards
    const player1 = this.state.players.get("player1");
    const player2 = this.state.players.get("player2");

    if (!player1 || !player2) return;

    const player1AliveCards = player1.cardIds.filter((cardId) => {
      const entity = this.state.entities.get(cardId);
      return entity && entity.isAlive;
    });

    const player2AliveCards = player2.cardIds.filter((cardId) => {
      const entity = this.state.entities.get(cardId);
      return entity && entity.isAlive;
    });

    // Update player alive status
    player1.isAlive = player1AliveCards.length > 0;
    player2.isAlive = player2AliveCards.length > 0;

    // Check for win conditions
    if (!player1.isAlive || !player2.isAlive) {
      this.state.isActive = false;

      if (player1.isAlive && !player2.isAlive) {
        this.state.winner = "player1";
        this.addEvent({
          timestamp: Date.now(),
          type: "system",
          source: "system",
          message: `Player 1 wins the battle! (${player1AliveCards.length} ${player1AliveCards.length === 1 ? "card" : "cards"} remaining)`,
        });
      } else if (player2.isAlive && !player1.isAlive) {
        this.state.winner = "player2";
        this.addEvent({
          timestamp: Date.now(),
          type: "system",
          source: "system",
          message: `Player 2 wins the battle! (${player2AliveCards.length} ${player2AliveCards.length === 1 ? "card" : "cards"} remaining)`,
        });
      } else {
        this.addEvent({
          timestamp: Date.now(),
          type: "system",
          source: "system",
          message: "Battle ended in a draw!",
        });
      }
    }
  }

  private addEvent(event: BattleEvent): void {
    this.state.events.push(event);
    // Keep only last 100 events to prevent memory issues
    if (this.state.events.length > 100) {
      this.state.events.shift();
    }

    // Emit event to relevant entities
    const sourceEntity = this.state.entities.get(event.source);
    if (sourceEntity) {
      sourceEntity.emit(event);
    }

    if (event.target && event.target !== event.source) {
      const targetEntity = this.state.entities.get(event.target);
      if (targetEntity) {
        targetEntity.emit(event);
      }
    }

    // For system events or events that affect all entities, emit to all
    if (event.type === "system" || event.source === "system") {
      this.state.entities.forEach(entity => {
        entity.emit(event);
      });
    }
  }

  public getState(): BattleState {
    return { ...this.state };
  }

  public getEntity(id: string): BattleEntity | undefined {
    return this.state.entities.get(id);
  }

  public getRecentEvents(count: number = 10): BattleEvent[] {
    return this.state.events.slice(-count);
  }

  public isActive(): boolean {
    return this.state.isActive || this.state.countdownActive;
  }

  public isBattleRunning(): boolean {
    return this.state.isActive && !this.state.countdownActive;
  }

  public isCountdownActive(): boolean {
    return this.state.countdownActive;
  }

  public getCountdownTimeRemaining(): number {
    return this.state.countdownTimeRemaining;
  }

  public getWinner(): string | undefined {
    return this.state.winner;
  }

  public getBattleDuration(): number {
    return (this.state.currentTime - this.state.startTime) / 1000;
  }
}
