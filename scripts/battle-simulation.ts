#!/usr/bin/env bun

import { WebSocket } from "ws";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface PlayerAction {
  type: "CAST_ABILITY" | "MOVE" | "CANCEL_CAST";
  entityId: string;
  abilityName?: string;
  targetId?: string;
  timestamp: number;
}

class BattleSimulationClient {
  private ws: WebSocket | null = null;
  private playerId: string;
  private battleId: string | null = null;
  private isConnected = false;
  private battleState: any = null;
  private playerEntities: any[] = [];
  private opponentEntities: any[] = [];

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = "ws://localhost:3001";
      console.log(`🔌 Connecting to ${wsUrl} as ${this.playerId}...`);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        this.isConnected = true;
        console.log(`✅ Connected as ${this.playerId}`);
        resolve();
      });

      this.ws.on("message", (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error("❌ Failed to parse message:", error);
        }
      });

      this.ws.on("close", () => {
        this.isConnected = false;
        console.log(`🔌 Disconnected: ${this.playerId}`);
      });

      this.ws.on("error", (error) => {
        console.error(`❌ WebSocket error for ${this.playerId}:`, error);
        reject(error);
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "MATCHMAKING_JOINED":
        console.log(`🎮 ${this.playerId} joined matchmaking`);
        break;

      case "MATCH_FOUND":
        console.log(`🎯 Match found for ${this.playerId}! Match ID: ${message.data.matchId}`);
        // Auto-confirm ready
        setTimeout(() => {
          this.confirmReady();
        }, 1000);
        break;

      case "BATTLE_STARTED":
        this.battleId = message.data.battleId;
        console.log(`⚔️  Battle started! Battle ID: ${this.battleId}`);
        if (message.data.initialState) {
          this.updateBattleState(message.data.initialState);
        }
        break;

      case "BATTLE_STATE_UPDATE":
        this.updateBattleState(message.data);
        break;

      case "BATTLE_ENDED":
        const isWinner = message.data.winner === this.playerId;
        console.log(`🏁 Battle ended! ${this.playerId} ${isWinner ? 'WON' : 'LOST'}`);
        this.battleId = null;
        break;

      case "PLAYER_ACTION":
        console.log(`🎯 Player action from ${message.data.playerId}:`, message.data.action.type);
        break;

      case "ACTION_REJECTED":
        console.log(`❌ Action rejected for ${this.playerId}:`, message.data.reason);
        break;

      case "PONG":
        // Silent ping response
        break;

      default:
        console.log(`📨 ${this.playerId} received:`, message.type, message.data);
    }
  }

  private updateBattleState(state: any) {
    this.battleState = state;
    
    if (state.entities) {
      this.playerEntities = Array.from(state.entities.values()).filter((e: any) => 
        e.id.startsWith(`${this.playerId}_`) && e.isAlive
      );
      this.opponentEntities = Array.from(state.entities.values()).filter((e: any) => 
        !e.id.startsWith(`${this.playerId}_`) && e.isAlive
      );

      console.log(`📊 ${this.playerId} - Player entities: ${this.playerEntities.length}, Opponent entities: ${this.opponentEntities.length}`);
    }
  }

  private send(type: string, data: any) {
    if (this.ws && this.isConnected) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  joinMatchmaking(type: "PVP" | "PVE" = "PVE") {
    const playerCards = [
      {
        cardName: "TestBeast",
        configuration: {
          name: `${this.playerId}_Beast`,
          abilities: ["basic_attack", "defend"] as const
        }
      }
    ];

    console.log(`🎮 ${this.playerId} joining ${type} matchmaking...`);
    this.send("JOIN_MATCHMAKING", {
      type,
      playerCards,
    });
  }

  confirmReady() {
    console.log(`✅ ${this.playerId} confirming ready...`);
    this.send("READY_CONFIRM", {});
  }

  performRandomAction() {
    if (!this.battleId || this.playerEntities.length === 0 || this.opponentEntities.length === 0) {
      return;
    }

    const entity = this.playerEntities[Math.floor(Math.random() * this.playerEntities.length)];
    const target = this.opponentEntities[Math.floor(Math.random() * this.opponentEntities.length)];

    if (entity && target) {
      const action: PlayerAction = {
        type: "CAST_ABILITY",
        entityId: entity.id,
        abilityName: "basic_attack",
        targetId: target.id,
        timestamp: Date.now()
      };

      console.log(`⚡ ${this.playerId} casting ${action.abilityName} with ${entity.id} -> ${target.id}`);
      this.send("PLAYER_ACTION", action);
    }
  }

  startRandomActions() {
    // Perform random actions every 3-5 seconds
    setInterval(() => {
      if (this.battleId) {
        this.performRandomAction();
      }
    }, 3000 + Math.random() * 2000);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runBattleSimulation() {
  console.log("🚀 Starting Battle Simulation...");
  console.log("📋 This simulation will:");
  console.log("   1. Connect two players to the WebSocket server");
  console.log("   2. Join PVE matchmaking");
  console.log("   3. Simulate battle actions");
  console.log("   4. Test the complete battle flow\n");

  const player1 = new BattleSimulationClient("sim_player_1");
  const player2 = new BattleSimulationClient("sim_player_2");

  try {
    // Connect both players
    await player1.connect();
    await player2.connect();

    // Wait a bit for connections to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start random actions for both players
    player1.startRandomActions();
    player2.startRandomActions();

    // Player 1 joins PVE (will fight AI)
    player1.joinMatchmaking("PVE");
    
    // Wait a bit, then player 2 joins PVP
    setTimeout(() => {
      player2.joinMatchmaking("PVP");
    }, 2000);

    // Keep simulation running
    console.log("\n🎮 Simulation running... Press Ctrl+C to stop\n");
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log("\n🛑 Shutting down simulation...");
      player1.disconnect();
      player2.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Simulation failed:", error);
    player1.disconnect();
    player2.disconnect();
    process.exit(1);
  }
}

// Run the simulation
runBattleSimulation();