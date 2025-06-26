// Server-side battle engine - authoritative version of BattleEngine

import type {
  Ability,
  ActionInput,
  BattleConfig,
  BattleEntity,
  BattleEvent,
  BattleState,
  PlayerState,
  StatusEffect,
} from "../../../core/types";
import { AllSoulBeast } from "../../../core/SoulBeast";
import type { SoulBeast, SoulBeastName } from "../../../core/SoulBeast";
import { abilityRegistry } from "../../../core/abilities";
import type { AbilityContext } from "../../../core/abilities/types";

export class ServerBattleEngine {
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
    player1Cards: {
      cardName: SoulBeastName;
      configuration: { name: string; abilities: readonly string[] };
    }[],
    player2Cards: {
      cardName: SoulBeastName;
      configuration: { name: string; abilities: readonly string[] };
    }[]
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
      const cardWithConfig = player1Cards[i];
      if (!cardWithConfig) continue;
      
      const cardData = AllSoulBeast[cardWithConfig.cardName];
      if (!cardData) {
        console.error(`Card not found: ${cardWithConfig.cardName}`);
        continue;
      }

      const entityId = `player1_${i}`;
      const entity = this.createEntity(
        entityId,
        "player1",
        cardData,
        cardWithConfig.configuration,
        { x: 100 + i * 150, y: 400 }
      );
      this.state.entities.set(entityId, entity);
      player1State.cardIds.push(entityId);
    }

    // Create entities for player 2 cards
    for (let i = 0; i < player2Cards.length; i++) {
      const cardWithConfig = player2Cards[i];
      if (!cardWithConfig) continue;
      
      const cardData = AllSoulBeast[cardWithConfig.cardName];
      if (!cardData) {
        console.error(`Card not found: ${cardWithConfig.cardName}`);
        continue;
      }

      const entityId = `player2_${i}`;
      const entity = this.createEntity(
        entityId,
        "player2",
        cardData,
        cardWithConfig.configuration,
        { x: 800 + i * 150, y: 400 }
      );
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

  private createEntity(
    id: string,
    playerId: string,
    character: SoulBeast,
    configuration: { name: string; abilities: readonly string[] },
    position: { x: number; y: number }
  ): BattleEntity {
    const eventListeners = new Map<
      BattleEvent["type"],
      Array<(event: BattleEvent) => void>
    >();

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
      lastCast: undefined,
      isAlive: true,
      position,
      eventListeners,
      on: (
        eventType: BattleEvent["type"],
        callback: (event: BattleEvent) => void
      ) => {
        if (!eventListeners.has(eventType)) {
          eventListeners.set(eventType, []);
        }
        eventListeners.get(eventType)!.push(callback);
      },
      off: (
        eventType: BattleEvent["type"],
        callback: (event: BattleEvent) => void
      ) => {
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
          listeners.forEach((callback) => callback(event));
        }
      },
    };

    // Filter abilities based on configuration
    const allowedAbilities = character.abilities.filter((ability) =>
      configuration.abilities.includes(ability.name)
    );

    // Initialize ability initiation times for allowed abilities only
    allowedAbilities.forEach((ability) => {
      if (ability.initiationTime && ability.initiationTime > 0) {
        entity.abilityInitiationTimes.set(ability.name, ability.initiationTime);
      }
    });

    // Create a modified character with only the allowed abilities
    entity.character = {
      ...character,
      abilities: allowedAbilities,
    };

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

        // Trigger "at_start" abilities
        this.triggerAtStartAbilities();
      }

      return; // Don't update entities during countdown
    }

    // Normal battle update logic
    if (!this.state.isActive) return;

    // Update all entities
    for (const entity of Array.from(this.state.entities.values())) {
      this.updateEntity(entity, dt);
    }

    // Check for automatic ability activations
    this.checkAutomaticAbilityActivations();

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
    for (const [abilityName, cooldown] of Array.from(entity.abilityCooldowns.entries())) {
      const newCooldown = Math.max(0, cooldown - deltaTime);
      if (newCooldown === 0) {
        entity.abilityCooldowns.delete(abilityName);
      } else {
        entity.abilityCooldowns.set(abilityName, newCooldown);
      }
    }

    // Update ability initiation times
    for (const [
      abilityName,
      initiationTime,
    ] of Array.from(entity.abilityInitiationTimes.entries())) {
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

    // Trigger after_ability_used abilities
    this.triggerAfterAbilityUsedAbilities(entity, ability);

    // Store last cast information
    entity.lastCast = {
      ability: ability,
      timeRemaining: 0, // Cast is complete
      target: targetId,
    };

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
      const casterTeam = caster.id.startsWith("player1_")
        ? "player1"
        : "player2";
      const enemyTeam = casterTeam === "player1" ? "player2" : "player1";

      targets = Array.from(this.state.entities.values()).filter(
        (entity) => entity.id.startsWith(enemyTeam + "_") && entity.isAlive
      );
    } else if (ability.target === "single-ally") {
      const target = targetId ? this.state.entities.get(targetId) : null;
      if (target && target.isAlive) {
        targets = [target];
      }
    } else if (ability.target === "all-ally") {
      // Get all living allies
      const casterTeam = caster.id.startsWith("player1_")
        ? "player1"
        : "player2";

      targets = Array.from(this.state.entities.values()).filter(
        (entity) =>
          entity.id.startsWith(casterTeam + "_") &&
          entity.isAlive &&
          entity.id !== caster.id
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
          applyStatusEffect: (target: BattleEntity, effect: StatusEffect) => {
            this.applyStatusEffect(target, effect);
          },
          dealDamage: (attacker: BattleEntity, target: BattleEntity, damage: number) => {
            return this.dealDamageAmount(attacker, target, damage, ability);
          },
          heal: (entity: BattleEntity, amount: number) => {
            this.heal(caster, entity, amount);
          },
        };

      abilityImplementation.execute(context);
    } else {
      // No custom implementation found - log a warning
      console.warn(
        `No custom implementation found for ability: ${ability.name}. This ability will have no effect.`
      );

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
  ): number {
    // Emit before_damage event
    const beforeDamageEvent: BattleEvent = {
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      value: damage,
      message: `${attacker.character.name} attacks ${target.character.name}`,
    };

    // Allow entities to modify damage through event listeners
    attacker.emit(beforeDamageEvent);
    target.emit(beforeDamageEvent);

    // Check for miss/evasion mechanics
    let hitChance = 1.0; // Start with 100% hit chance

    // Check for accuracy reduction debuffs on attacker
    const accuracyDebuffs = attacker.statusEffects.filter(
      (effect) =>
        effect.behaviors?.accuracyReduction && effect.type === "debuff"
    );

    for (const debuff of accuracyDebuffs) {
      hitChance *= 1 - debuff.value; // Reduce hit chance by debuff value
    }

    // Check for evasion buffs on target
    const evasionBuffs = target.statusEffects.filter(
      (effect) => effect.behaviors?.evasion && effect.type === "buff"
    );

    for (const buff of evasionBuffs) {
      hitChance *= 1 - buff.value; // Reduce hit chance by evasion value
    }

    // Roll for hit/miss
    const hitRoll = Math.random();
    if (hitRoll > hitChance) {
      // Attack missed!
      this.addEvent({
        timestamp: Date.now(),
        type: "system",
        source: attacker.id,
        target: target.id,
        ability: ability,
        message: `${attacker.character.name}'s attack missed ${target.character.name}!`,
      });

      // Trigger after_enemy_dodges abilities
      this.triggerAfterEnemyDodgesAbilities(attacker);

      return 0; // No damage dealt
    }

    let finalDamage =
      ((beforeDamageEvent as any).modifiedValue ?? damage) * attacker.damageMultiplier;

    // Apply damage boost effects on attacker
    const damageBoostEffects = attacker.statusEffects.filter(
      (effect) => effect.behaviors?.damageBoost
    );

    for (const effect of damageBoostEffects) {
      // Call onDamageDealt hook if present
      if ((effect as any).onDamageDealt) {
        finalDamage = (effect as any).onDamageDealt(
          attacker,
          target,
          finalDamage,
          effect
        );
      } else {
        // Default behavior
        if (effect.behaviors?.isFocus) {
          finalDamage = damage * effect.value; // Apply focus multiplier to base damage only
        } else {
          finalDamage += damage * (effect.value - 1.0); // Additive for other boosts
        }
      }

      // Remove consumed buffs (one-time use)
      if (effect.behaviors?.oneTimeUse) {
        attacker.statusEffects = attacker.statusEffects.filter(
          (e) => e !== effect
        );
      }
    }

    // Apply shield effects on target
    let shieldAbsorbed = 0;
    const shieldEffects = target.statusEffects.filter(
      (effect) => effect.behaviors?.isShield
    );

    for (const shield of shieldEffects) {
      const absorbed = Math.min(finalDamage, shield.value);
      finalDamage = Math.max(0, finalDamage - absorbed);
      shieldAbsorbed += absorbed;
      shield.value -= absorbed;

      // Track absorbed damage for dream shields
      if (shield.behaviors?.isDreamShield) {
        (shield as any).absorbedDamage =
          ((shield as any).absorbedDamage || 0) + absorbed;
      }

      if (shield.value <= 0) {
        // Call onRemove hook if present (handles dream shield healing)
        if ((shield as any).onRemove) {
          (shield as any).onRemove(target, shield);
        }
        target.statusEffects = target.statusEffects.filter((e) => e !== shield);
      }
    }

    // Apply damage reduction multipliers on target
    const damageReductionEffects = target.statusEffects.filter(
      (effect) => effect.behaviors?.damageReduction && effect.type === "buff"
    );

    for (const effect of damageReductionEffects) {
      // Call onDamageReceived hook if present
      if ((effect as any).onDamageReceived) {
        finalDamage = (effect as any).onDamageReceived(
          attacker,
          target,
          finalDamage,
          effect
        );
      } else {
        finalDamage *= effect.value; // Apply damage reduction multiplier
      }
    }

    // Apply debuff effects on attacker that reduce damage output
    const attackDebuffs = attacker.statusEffects.filter(
      (effect) => effect.behaviors?.damageReduction && effect.type === "debuff"
    );

    for (const effect of attackDebuffs) {
      // Call onDamageDealt hook if present
      if ((effect as any).onDamageDealt) {
        finalDamage = (effect as any).onDamageDealt(
          attacker,
          target,
          finalDamage,
          effect
        );
      } else {
        finalDamage *= effect.value; // Apply damage reduction from debuffs
      }
    }

    finalDamage = Math.max(0, finalDamage - target.armor);
    target.hp = Math.max(0, target.hp - finalDamage);

    // Emit after_damage event
    const afterDamageEvent: BattleEvent = {
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      value: finalDamage,
      message: `${target.character.name} takes ${finalDamage.toFixed(1)} damage`,
    };

    attacker.emit(afterDamageEvent);
    target.emit(afterDamageEvent);

    this.addEvent({
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      value: finalDamage,
      ability: ability,
      message: `${attacker.character.name} deals ${Math.round(finalDamage)} damage to ${target.character.name}`,
    });

    // Trigger after_damage_taken abilities on the target
    if (finalDamage > 0) {
      this.triggerAfterDamageAbilities(target);
    }

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

      // Check win conditions immediately after entity death
      this.checkWinConditions();
    }

    // Interrupt casting if damage interrupts (but not if self-inflicted or passive skill)
    if (
      this.config.castInterruption &&
      target.currentCast &&
      attacker.id !== target.id &&
      target.currentCast.ability.type !== "passive"
    ) {
      const interruptedAbility = target.currentCast.ability;

      // Emit cast_interrupted event before clearing the cast
      const castInterruptedEvent: BattleEvent = {
        timestamp: Date.now(),
        type: "system",
        source: attacker.id,
        target: target.id,
        message: `${target.character.name}'s ${interruptedAbility.name} was interrupted by ${attacker.character.name}`,
      };

      // Allow entities to listen for cast interruption
      target.emit(castInterruptedEvent);
      attacker.emit(castInterruptedEvent);

      // Add 1 second delay before the same ability can be used again
      target.abilityCooldowns.set(interruptedAbility.name, 1.0);

      // Clear the current cast
      target.currentCast = undefined;

      this.addEvent(castInterruptedEvent);
    }

    return finalDamage;
  }

  private triggerAfterEnemyDodgesAbilities(attacker: BattleEntity): void {
    // Find abilities that trigger after enemy dodges
    const afterDodgeAbilities = attacker.character.abilities.filter(
      (ability) => (ability as any).condition?.trigger === "after_enemy_dodges"
    );

    for (const ability of afterDodgeAbilities) {
      // Check if ability is on cooldown
      const cooldown = attacker.abilityCooldowns.get(ability.name) || 0;
      if (cooldown > 0) continue;

      // Execute the ability
      this.executeAbility(attacker, ability);
    }
  }

  private triggerAfterDamageAbilities(target: BattleEntity): void {
    // Find abilities that trigger after taking damage
    const afterDamageAbilities = target.character.abilities.filter(
      (ability) => (ability as any).condition?.trigger === "after_damage_taken"
    );

    for (const ability of afterDamageAbilities) {
      // Check if ability is on cooldown
      const cooldown = target.abilityCooldowns.get(ability.name) || 0;
      if (cooldown > 0) continue;

      // Execute the ability
      this.executeAbility(target, ability);
    }
  }

  private heal(healer: BattleEntity, target: BattleEntity, amount: number): number {
    const healingMultiplier = (healer as any).healingMultiplier || 1.0;
    const finalHeal = amount * healingMultiplier;
    
    const oldHp = target.hp;
    target.hp = Math.min((target.character as any).maxHp, target.hp + finalHeal);
    const actualHeal = target.hp - oldHp;

    this.addEvent({
      timestamp: Date.now(),
      type: "heal",
      source: healer.id,
      target: target.id,
      value: actualHeal,
      message: `${healer.character.name} heals ${target.character.name} for ${Math.round(actualHeal)} HP`,
    });

    return actualHeal;
  }

  private applyStatusEffect(target: BattleEntity, effect: StatusEffect): void {
    // Ensure effect has required properties
    const completeEffect = {
      ...effect,
      source: (effect as any).source || "unknown",
      stackable: (effect as any).stackable || false,
      stackDuration: (effect as any).stackDuration || false,
    } as any;

    // Check if this is a stackable effect
    const existingEffect = target.statusEffects.find(
      (e) => e.name === completeEffect.name && (e as any).source === (completeEffect as any).source
    );

    if (existingEffect && (completeEffect as any).stackable) {
      // Stack the effect (increase duration or value based on type)
      if ((completeEffect as any).stackDuration) {
        existingEffect.duration = Math.max(existingEffect.duration, completeEffect.duration);
      } else {
        existingEffect.value += completeEffect.value;
      }
      
      this.addEvent({
        timestamp: Date.now(),
        type: "status_applied",
        source: (completeEffect as any).source,
        target: target.id,
        message: `${completeEffect.name} stacked on ${target.character.name}`,
      });
    } else if (existingEffect) {
      // Replace existing effect
      const index = target.statusEffects.indexOf(existingEffect);
      target.statusEffects[index] = completeEffect;
      
      this.addEvent({
        timestamp: Date.now(),
        type: "status_applied",
        source: (completeEffect as any).source,
        target: target.id,
        message: `${completeEffect.name} refreshed on ${target.character.name}`,
      });
    } else {
      // Add new effect
      target.statusEffects.push(completeEffect);
      
      this.addEvent({
        timestamp: Date.now(),
        type: "status_applied",
        source: (completeEffect as any).source,
        target: target.id,
        message: `${target.character.name} gains ${completeEffect.name}`,
      });
    }

    // Call onApply hook if present
    if ((completeEffect as any).onApply) {
      (completeEffect as any).onApply(target, completeEffect);
    }
  }

  private triggerAtStartAbilities(): void {
    // Find all entities with abilities that trigger at battle start
    for (const entity of Array.from(this.state.entities.values())) {
      if (!entity.isAlive) continue;

      const atStartAbilities = entity.character.abilities.filter(
        (ability) => (ability as any).condition?.trigger === "at_start"
      );

      for (const ability of atStartAbilities) {
        // Check if ability is on cooldown
        const cooldown = entity.abilityCooldowns.get(ability.name) || 0;
        if (cooldown > 0) continue;

        // Execute the ability
        this.executeAbility(entity, ability);
      }
    }
  }

  private checkAutomaticAbilityActivations(): void {
    for (const entity of Array.from(this.state.entities.values())) {
      if (!entity.isAlive) continue;

      // Check for abilities that trigger automatically based on conditions
      for (const ability of entity.character.abilities) {
        if (!(ability as any).condition) continue;

        // Check if ability is on cooldown
        const cooldown = entity.abilityCooldowns.get(ability.name) || 0;
        if (cooldown > 0) continue;

        // Check various automatic triggers
        let shouldTrigger = false;

        switch ((ability as any).condition.trigger) {
          case "on_low_health":
            const healthPercentage = entity.hp / (entity.character as any).maxHp;
            const threshold = (ability as any).condition.value || 0.3; // Default 30%
            shouldTrigger = healthPercentage <= threshold;
            break;

          case "on_enemy_low_health":
            const enemies = Array.from(this.state.entities.values()).filter(
              (e) => e.isAlive && (e as any).playerId !== (entity as any).playerId
            );
            const enemyThreshold = (ability as any).condition.value || 0.3;
            shouldTrigger = enemies.some(
              (enemy) => enemy.hp / (enemy.character as any).maxHp <= enemyThreshold
            );
            break;

          case "on_ally_low_health":
            const allies = Array.from(this.state.entities.values()).filter(
              (e) => e.isAlive && (e as any).playerId === (entity as any).playerId && e.id !== entity.id
            );
            const allyThreshold = (ability as any).condition.value || 0.3;
            shouldTrigger = allies.some(
              (ally) => ally.hp / (ally.character as any).maxHp <= allyThreshold
            );
            break;

          case "periodic":
            // For periodic abilities, check if enough time has passed
            const period = (ability as any).condition.value || 5.0; // Default 5 seconds
            const lastCast = entity.lastCast?.ability.name === ability.name ? entity.lastCast.timeRemaining : 0;
            const currentTime = Date.now();
            shouldTrigger = (currentTime - lastCast) / 1000 >= period;
            break;

          case "automatic":
            // Check condition
            if (this.checkAbilityCondition(entity, ability)) {
              shouldTrigger = true;
            }
            break;
        }

        if (shouldTrigger) {
          this.executeAbility(entity, ability);
        }
      }
    }
  }

  private checkAbilityCondition(entity: BattleEntity, ability: Ability): boolean {
    // Implement condition checking logic here
    // This is a placeholder that always returns true
    return true;
  }

  private triggerAfterAbilityUsedAbilities(caster: BattleEntity, usedAbility: Ability): void {
    // Find abilities that trigger after any ability is used
    const afterAbilityUsedAbilities = caster.character.abilities.filter(
      (ability) => (ability as any).condition?.trigger === "after_ability_used"
    );

    for (const ability of afterAbilityUsedAbilities) {
      // Skip the ability that was just used
      if (ability.name === usedAbility.name) continue;

      // Check if ability is on cooldown
      const cooldown = caster.abilityCooldowns.get(ability.name) || 0;
      if (cooldown > 0) continue;

      // Execute the ability
      this.executeAbility(caster, ability);
    }
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