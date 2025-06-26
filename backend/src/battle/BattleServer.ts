import { ServerBattleEngine } from "./ServerBattleEngine";
import { wsManager } from "../websocket/WebSocketManager";
import type { QueuedPlayer } from "./Matchmaking";
import type { PlayerAction } from "../websocket/MessageHandler";

export interface BattleRoom {
  id: string;
  engine: ServerBattleEngine;
  players: string[];
  isActive: boolean;
  lastUpdate: number;
  updateInterval: NodeJS.Timeout;
}

export class BattleServer {
  private battles = new Map<string, BattleRoom>();
  private readonly UPDATE_RATE = 100; // 10 FPS

  createBattle(queuedPlayers: QueuedPlayer[]): string {
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const engine = new ServerBattleEngine();
    
    // Extract player cards from queued players
    const player1Cards = queuedPlayers[0]?.request.playerCards || [];
    const player2Cards = queuedPlayers[1]?.request.playerCards || this.generateAICards();
    
    // Initialize battle
    const success = engine.initializeBattle(player1Cards, player2Cards);
    
    if (!success) {
      throw new Error("Failed to initialize battle");
    }

    const players = queuedPlayers.map(p => p.playerId);
    
    // Create battle room
    const battleRoom: BattleRoom = {
      id: battleId,
      engine,
      players,
      isActive: true,
      lastUpdate: Date.now(),
      updateInterval: setInterval(() => {
        this.updateBattle(battleId);
      }, this.UPDATE_RATE)
    };

    this.battles.set(battleId, battleRoom);
    
    // Send initial state to players
    this.broadcastBattleState(battleId);
    
    console.log(`Battle ${battleId} created with players: ${players.join(", ")}`);
    return battleId;
  }

  private generateAICards() {
    // Generate simple AI cards for PvE battles
    return [
      {
        cardName: "AI_Beast",
        configuration: {
          name: "AI Opponent",
          abilities: ["basic_attack", "defend"] as const
        }
      }
    ];
  }

  private updateBattle(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle || !battle.isActive) return;

    try {
      // Update battle engine
      battle.engine.update();
      battle.lastUpdate = Date.now();

      // Check if battle is finished
      const state = battle.engine.getState();
      if (state.winner) {
        this.endBattle(battleId, state.winner);
        return;
      }

      // Broadcast state updates (throttled)
      if (Date.now() - battle.lastUpdate > 500) { // Every 500ms
        this.broadcastBattleState(battleId);
      }

      // Handle AI actions for PvE battles
      if (battle.players.length === 1) {
        this.handleAIActions(battleId);
      }
    } catch (error) {
      console.error(`Error updating battle ${battleId}:`, error);
      this.endBattle(battleId, "error");
    }
  }

  private handleAIActions(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    // Simple AI logic - randomly cast abilities
    const state = battle.engine.getState();
    const aiEntities = Array.from(state.entities.values()).filter(e => 
      e.id.startsWith("player2_") && e.isAlive
    );

    if (aiEntities.length === 0) return;

    // Random AI action every 2-3 seconds
    if (Math.random() < 0.02) { // 2% chance per update (roughly every 2-3 seconds at 10 FPS)
      const aiEntity = aiEntities[Math.floor(Math.random() * aiEntities.length)];
      const playerEntities = Array.from(state.entities.values()).filter(e => 
        e.id.startsWith("player1_") && e.isAlive
      );
      
      if (playerEntities.length > 0) {
        const target = playerEntities[Math.floor(Math.random() * playerEntities.length)];
        
        if (aiEntity && target) {
          const aiAction: PlayerAction = {
            type: "CAST_ABILITY",
            entityId: aiEntity.id,
            abilityName: "basic_attack",
            targetId: target.id,
            timestamp: Date.now()
          };
          
          battle.engine.handlePlayerAction("ai", aiAction);
         }
      }
    }
  }

  private broadcastBattleState(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    battle.players.forEach(playerId => {
      const state = battle.engine.getStateForPlayer(playerId);
      wsManager.sendToPlayer(playerId, {
        type: "BATTLE_STATE_UPDATE",
        data: state,
        timestamp: Date.now()
      });
    });
  }

  private endBattle(battleId: string, winner: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    // Stop battle updates
    clearInterval(battle.updateInterval);
    battle.isActive = false;

    // Notify players
    battle.players.forEach(playerId => {
      wsManager.sendToPlayer(playerId, {
        type: "BATTLE_ENDED",
        data: { winner, battleId },
        timestamp: Date.now()
      });
      
      // Remove player from battle
      wsManager.removeBattleForPlayer(playerId);
    });

    // Clean up battle room after a delay
    setTimeout(() => {
      this.battles.delete(battleId);
      console.log(`Battle ${battleId} cleaned up`);
    }, 30000); // 30 seconds

    console.log(`Battle ${battleId} ended - Winner: ${winner}`);
  }

  handlePlayerAction(battleId: string, playerId: string, action: PlayerAction): void {
    const battle = this.battles.get(battleId);
    if (!battle || !battle.isActive) {
      console.warn(`Invalid battle action: battle ${battleId} not found or inactive`);
      return;
    }

    // Validate player is in this battle
    if (!battle.players.includes(playerId)) {
      console.warn(`Player ${playerId} not in battle ${battleId}`);
      return;
    }

    // Process action through battle engine
    const success = battle.engine.handlePlayerAction(playerId, action);
    
    if (success) {
      // Broadcast action to other players
      battle.players.forEach(pid => {
        if (pid !== playerId) {
          wsManager.sendToPlayer(pid, {
            type: "PLAYER_ACTION",
            data: { playerId, action },
            timestamp: Date.now()
          });
        }
      });
      
      // Send immediate state update
      this.broadcastBattleState(battleId);
    } else {
      // Send error back to player
      wsManager.sendToPlayer(playerId, {
        type: "ACTION_REJECTED",
        data: { action, reason: "Invalid action" },
        timestamp: Date.now()
      });
    }
  }

  getBattle(battleId: string): BattleRoom | undefined {
    return this.battles.get(battleId);
  }

  getActiveBattlesCount(): number {
    return Array.from(this.battles.values()).filter(b => b.isActive).length;
  }

  // Clean up disconnected battles
  cleanupInactiveBattles(): void {
    const now = Date.now();
    const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    
    for (const [battleId, battle] of this.battles.entries()) {
      if (now - battle.lastUpdate > INACTIVE_TIMEOUT) {
        console.log(`Cleaning up inactive battle: ${battleId}`);
        this.endBattle(battleId, "timeout");
      }
    }
  }
}

export const battleServer = new BattleServer();

// Clean up inactive battles every 5 minutes
setInterval(() => {
  battleServer.cleanupInactiveBattles();
}, 5 * 60 * 1000);