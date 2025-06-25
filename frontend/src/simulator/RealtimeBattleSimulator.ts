import { BattleEngine } from "../engine/BattleEngine";
import { ActionInput, SimulatorTimingConfig, BattleConfig } from "../types";
import { AllSoulBeast, SoulBeastName } from "../engine/SoulBeast";

export class RealtimeBattleSimulator {
  private engine: BattleEngine;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private lastUpdateTime: number = 0;
  private timingConfig: SimulatorTimingConfig;

  constructor(
    battleConfig?: Partial<BattleConfig>,
    timingConfig?: Partial<SimulatorTimingConfig>
  ) {
    this.engine = new BattleEngine({
      maxHp: 200,
      tickRate: 100, // 10 updates per second
      battlefieldSize: { width: 1000, height: 1000 },
      castInterruption: true,
      ...battleConfig,
    });

    this.timingConfig = {
      updateInterval: 100, // 100ms = 10 updates per second
      statusDisplayInterval: 100, // 2 seconds
      aiActionInterval: 100, // 1.5 seconds
      battleCheckInterval: 100, // 0.5 seconds
      ...timingConfig,
    };
  }

  public startBattle(player1Cards: string[], player2Cards: string[]): boolean {
    // Convert card names to CardWithConfiguration objects using first available configuration
    const player1CardsWithConfig = player1Cards.map(cardName => {
      const soulBeast = AllSoulBeast[cardName as SoulBeastName];
      return {
        cardName: cardName as SoulBeastName,
        configuration: soulBeast?.configurations[0] || { name: "Default", abilities: [] }
      };
    });
    
    const player2CardsWithConfig = player2Cards.map(cardName => {
      const soulBeast = AllSoulBeast[cardName as SoulBeastName];
      return {
        cardName: cardName as SoulBeastName,
        configuration: soulBeast?.configurations[0] || { name: "Default", abilities: [] }
      };
    });
    
    const success = this.engine.initializeBattle(player1CardsWithConfig, player2CardsWithConfig);
    if (!success) {
      console.log("Failed to initialize battle - cards not found");
      return false;
    }

    this.isRunning = true;
    this.lastUpdateTime = Date.now();

    // Start the game loop
    this.intervalId = setInterval(() => {
      this.update();
    }, this.timingConfig.updateInterval);

    console.log(
      `🎮 Battle started: Player 1 (${player1Cards.length} ${player1Cards.length === 1 ? 'card' : 'cards'}) vs Player 2 (${player2Cards.length} ${player2Cards.length === 1 ? 'card' : 'cards'})`
    );
    return true;
  }

  private update(): void {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update the battle engine
    this.engine.update(deltaTime);

    // Check if battle is finished
    if (!this.engine.isActive()) {
      this.stopBattle();
    }
  }

  public stopBattle(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    const winner = this.engine.getWinner();
    const duration = this.engine.getBattleDuration();

    if (winner) {
      const winnerEntity = this.engine.getEntity(winner);
      console.log(
        `🏆 Battle finished! Winner: ${
          winnerEntity?.character.name
        } (${duration.toFixed(1)}s)`
      );
    } else {
      console.log(`🤝 Battle finished in a draw! (${duration.toFixed(1)}s)`);
    }
  }

  public attemptAction(action: ActionInput): boolean {
    return this.engine.attemptAction(action);
  }

  public getEngine(): BattleEngine {
    return this.engine;
  }

  public isActive(): boolean {
    return this.isRunning && this.engine.isActive();
  }

  public updateTimingConfig(
    newTimingConfig: Partial<SimulatorTimingConfig>
  ): void {
    this.timingConfig = {
      ...this.timingConfig,
      ...newTimingConfig,
    };
  }

  public getTimingConfig(): SimulatorTimingConfig {
    return { ...this.timingConfig };
  }

  public setUpdateInterval(interval: number): void {
    this.timingConfig.updateInterval = interval;

    // If battle is running, restart the interval with new timing
    if (this.isRunning && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.update();
      }, this.timingConfig.updateInterval);
    }
  }

  public printBattleStatus(): void {
    if (!this.engine.isActive()) {
      console.log("Battle is not active");
      return;
    }

    console.log("\n═══════════════════════════════════");
    console.log("🔥 BATTLE STATUS");
    console.log("═══════════════════════════════════");

    const entities = Array.from(this.engine.getState().entities.values());

    entities.forEach((entity) => {
      const hpPercent = Math.round((entity.hp / entity.maxHp) * 100);
      const hpBar =
        "█".repeat(Math.floor(hpPercent / 5)) +
        "░".repeat(20 - Math.floor(hpPercent / 5));

      console.log(`${entity.character.name}`);
      console.log(
        `  HP: ${Math.round(entity.hp)}/${
          entity.maxHp
        } [${hpBar}] ${hpPercent}%`
      );

      if (entity.currentCast) {
        console.log(
          `  🎯 Casting: ${
            entity.currentCast.ability.name
          } (${entity.currentCast.timeRemaining.toFixed(1)}s)`
        );
      }

      if (entity.statusEffects.length > 0) {
        const effects = entity.statusEffects
          .map((e) => `${e.name}(${e.duration.toFixed(1)}s)`)
          .join(", ");
        console.log(`  📛 Effects: ${effects}`);
      }

      const cooldowns = Array.from(entity.abilityCooldowns.entries())
        .map(([name, cd]) => `${name}(${cd.toFixed(1)}s)`)
        .join(", ");

      if (cooldowns) {
        console.log(`  ⏰ Cooldowns: ${cooldowns}`);
      }

      console.log("");
    });

    // Show recent events
    const recentEvents = this.engine.getRecentEvents(3);
    if (recentEvents.length > 0) {
      console.log("📜 Recent Events:");
      recentEvents.forEach((event) => {
        console.log(`  ${event.message}`);
      });
    }

    console.log("═══════════════════════════════════\n");
  }

  public async runAutoBattle(): Promise<void> {
    const statusInterval = setInterval(() => {
      this.printBattleStatus();
    }, this.timingConfig.statusDisplayInterval);

    // Simple AI: randomly use abilities
    const aiInterval = setInterval(() => {
      if (!this.isActive()) {
        clearInterval(aiInterval);
        clearInterval(statusInterval);
        return;
      }

      const state = this.engine.getState();
      const player1 = state.players.get("player1");
      const player2 = state.players.get("player2");

      if (!player1 || !player2) return;

      // Get alive entities for each player
      const player1Entities = player1.cardIds
        .map((id) => state.entities.get(id))
        .filter((entity) => entity && entity.isAlive);

      const player2Entities = player2.cardIds
        .map((id) => state.entities.get(id))
        .filter((entity) => entity && entity.isAlive);

      // Player 1 AI - each alive card has a chance to act
      player1Entities.forEach((entity) => {
        if (entity && !entity.currentCast && Math.random() < 0.3) {
          const availableAbilities = entity.character.abilities.filter(
            (ability) => !entity.abilityCooldowns.has(ability.name)
          );

          if (availableAbilities.length > 0 && player2Entities.length > 0) {
            const randomAbility =
              availableAbilities[
                Math.floor(Math.random() * availableAbilities.length)
              ];
            const randomTarget =
              player2Entities[
                Math.floor(Math.random() * player2Entities.length)
              ];

            if (randomTarget) {
              this.attemptAction({
                entityId: entity.id,
                abilityName: randomAbility.name,
                targetId: randomTarget.id,
              });
            }
          }
        }
      });

      // Player 2 AI - each alive card has a chance to act
      player2Entities.forEach((entity) => {
        if (entity && !entity.currentCast && Math.random() < 0.3) {
          const availableAbilities = entity.character.abilities.filter(
            (ability) => !entity.abilityCooldowns.has(ability.name)
          );

          if (availableAbilities.length > 0 && player1Entities.length > 0) {
            const randomAbility =
              availableAbilities[
                Math.floor(Math.random() * availableAbilities.length)
              ];
            const randomTarget =
              player1Entities[
                Math.floor(Math.random() * player1Entities.length)
              ];

            if (randomTarget) {
              this.attemptAction({
                entityId: entity.id,
                abilityName: randomAbility.name,
                targetId: randomTarget.id,
              });
            }
          }
        }
      });
    }, this.timingConfig.aiActionInterval);

    // Wait for battle to finish
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isActive()) {
          clearInterval(checkInterval);
          clearInterval(aiInterval);
          clearInterval(statusInterval);
          resolve();
        }
      }, this.timingConfig.battleCheckInterval);
    });
  }
}
