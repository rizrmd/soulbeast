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

    this.state.isActive = true;
    this.state.startTime = Date.now();
    this.state.currentTime = Date.now();

    this.addEvent({
      timestamp: Date.now(),
      type: "ability_used",
      source: "system",
      message: `Battle initialized: Player 1 (${player1Cards.length} ${player1Cards.length === 1 ? "card" : "cards"}) vs Player 2 (${player2Cards.length} ${player2Cards.length === 1 ? "card" : "cards"})`,
    });

    return true;
  }

  private createEntity(id: string, character: SoulBeast): BattleEntity {
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
    if (!this.state.isActive) return;

    this.state.currentTime = Date.now();
    const dt = deltaTime / 1000; // Convert to seconds

    // Update all entities
    for (const entity of this.state.entities.values()) {
      this.updateEntity(entity, dt);
    }

    // Check win conditions
    this.checkWinConditions();
  }

  private updateEntity(entity: BattleEntity, deltaTime: number): void {
    if (!entity.isAlive) return;

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
      ability: ability.name,
      message: `${entity.character.name} completed casting ${ability.name}`,
    });

    // Execute ability effect
    this.executeAbility(entity, ability, targetId);

    // Start cooldown
    entity.abilityCooldowns.set(ability.name, ability.cooldown);
    entity.currentCast = undefined;
  }

  private executeAbility(
    caster: BattleEntity,
    ability: Ability,
    targetId?: string
  ): void {
    const target = targetId ? this.state.entities.get(targetId) : null;

    // Apply damage
    if (ability.damage > 0 && target && target.isAlive) {
      this.dealDamage(caster, target, ability);
    }

    // Apply special effects based on ability description
    this.applyAbilityEffects(caster, ability, target);
  }

  private dealDamage(
    attacker: BattleEntity,
    target: BattleEntity,
    ability: Ability
  ): void {
    let damage = ability.damage * attacker.damageMultiplier;

    // Apply armor reduction
    const armorReduction = target.armor / (target.armor + 100);
    damage = damage * (1 - armorReduction);

    // Apply damage
    target.hp = Math.max(0, target.hp - damage);

    this.addEvent({
      timestamp: Date.now(),
      type: "damage",
      source: attacker.id,
      target: target.id,
      ability: ability.name,
      value: damage,
      message: `${attacker.character.name} deals ${Math.round(damage)} damage to ${target.character.name} with ${ability.name}`,
    });

    // Check if target dies
    if (target.hp <= 0) {
      target.isAlive = false;
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

  private applyAbilityEffects(
    caster: BattleEntity,
    ability: Ability,
    target?: BattleEntity | null
  ): void {
    const effect = ability.effect.toLowerCase();

    // Healing effects
    if (effect.includes("heal")) {
      const healMatch = effect.match(/heals?\s+(?:self\s+for\s+|)(\d+)/);
      if (healMatch) {
        const healAmount = parseInt(healMatch[1]);
        this.heal(caster, healAmount);
      }
    }

    // Status effects
    if (effect.includes("slow") && target) {
      this.applyStatusEffect(target, {
        name: "Slow",
        type: "debuff",
        duration: 2.0,
        value: 0.7, // 30% speed reduction
      });
    }

    if (effect.includes("stun") && target) {
      const stunMatch = effect.match(/stuns?\s+.*?for\s+([\d.]+)/);
      const duration = stunMatch ? parseFloat(stunMatch[1]) : 1.5;
      this.applyStatusEffect(target, {
        name: "Stun",
        type: "debuff",
        duration,
        value: 0,
      });
    }

    // Damage over time effects
    if (effect.includes("burn") && target) {
      const burnMatch = effect.match(
        /burns?\s+for\s+(\d+)\s+damage\s+over\s+(\d+)/
      );
      if (burnMatch) {
        const damage = parseInt(burnMatch[1]);
        const duration = parseInt(burnMatch[2]);
        this.applyStatusEffect(target, {
          name: "Burn",
          type: "dot",
          duration,
          value: damage,
          tickInterval: 1.0,
          remainingTicks: duration,
        });
      }
    }
  }

  private heal(entity: BattleEntity, amount: number): void {
    const healAmount = Math.min(amount, entity.maxHp - entity.hp);
    entity.hp += healAmount;

    this.addEvent({
      timestamp: Date.now(),
      type: "heal",
      source: entity.id,
      target: entity.id,
      value: healAmount,
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
              message: `${entity.character.name} takes ${effect.value} damage from ${effect.name}`,
            });
          } else if (effect.type === "hot") {
            this.heal(entity, effect.value);
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

    // Start casting
    const castTime = ability.castTime || 0;

    if (castTime > 0) {
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
        ability: ability.name,
        message: `${entity.character.name} begins casting ${ability.name} (${castTime}s)`,
      });
    } else {
      // Instant cast
      this.executeAbility(entity, ability, action.targetId);
      entity.abilityCooldowns.set(ability.name, ability.cooldown);

      this.addEvent({
        timestamp: Date.now(),
        type: "ability_used",
        source: entity.id,
        target: action.targetId,
        ability: ability.name,
        message: `${entity.character.name} uses ${ability.name}`,
      });
    }

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
          type: "ability_used",
          source: "system",
          message: `Player 1 wins the battle! (${player1AliveCards.length} ${player1AliveCards.length === 1 ? "card" : "cards"} remaining)`,
        });
      } else if (player2.isAlive && !player1.isAlive) {
        this.state.winner = "player2";
        this.addEvent({
          timestamp: Date.now(),
          type: "ability_used",
          source: "system",
          message: `Player 2 wins the battle! (${player2AliveCards.length} ${player2AliveCards.length === 1 ? "card" : "cards"} remaining)`,
        });
      } else {
        this.addEvent({
          timestamp: Date.now(),
          type: "ability_used",
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
    return this.state.isActive;
  }

  public getWinner(): string | undefined {
    return this.state.winner;
  }

  public getBattleDuration(): number {
    return (this.state.currentTime - this.state.startTime) / 1000;
  }
}
