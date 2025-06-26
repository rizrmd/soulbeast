#!/usr/bin/env bun

import { WebSocket } from "ws";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

class QuickBattleTest {
  private ws: WebSocket | null = null;
  private playerId = "test_player";
  private isConnected = false;
  private battleStarted = false;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("🔌 Connecting to WebSocket server...");
      this.ws = new WebSocket("ws://localhost:3001");

      this.ws.on("open", () => {
        this.isConnected = true;
        console.log("✅ Connected to server");
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

      this.ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      });

      this.ws.on("close", () => {
        console.log("🔌 Connection closed");
        this.isConnected = false;
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "MATCHMAKING_JOINED":
        console.log("🎮 Joined matchmaking queue");
        break;

      case "MATCH_FOUND":
        console.log("🎯 Match found! Auto-confirming ready...");
        setTimeout(() => this.confirmReady(), 500);
        break;

      case "BATTLE_STARTED":
        console.log("⚔️  Battle started!");
        console.log("📊 Initial state:", JSON.stringify(message.data.initialState, null, 2));
        this.battleStarted = true;
        
        // Start performing actions
        this.startBattleActions();
        break;

      case "BATTLE_STATE_UPDATE":
        console.log("📈 Battle state updated");
        if (message.data.entities) {
          // Handle both Map and Object formats
          let entities: any[];
          if (message.data.entities instanceof Map) {
            entities = Array.from(message.data.entities.values());
          } else if (typeof message.data.entities === 'object') {
            entities = Object.values(message.data.entities);
          } else {
            entities = [];
          }
          const alive = entities.filter((e: any) => e.isAlive);
          console.log(`   Alive entities: ${alive.length}/${entities.length}`);
        }
        break;

      case "BATTLE_ENDED":
        const isWinner = message.data.winner === this.playerId;
        console.log(`🏁 Battle ended! Result: ${isWinner ? '🎉 VICTORY' : '💀 DEFEAT'}`);
        console.log(`   Winner: ${message.data.winner}`);
        this.battleStarted = false;
        
        // Exit after battle
        setTimeout(() => {
          console.log("✅ Test completed successfully!");
          process.exit(0);
        }, 2000);
        break;

      case "ACTION_REJECTED":
        console.log("❌ Action rejected:", message.data.reason);
        break;

      case "PLAYER_ACTION":
        console.log("🎯 Player action:", message.data.action.type);
        break;

      case "PONG":
        // Silent
        break;

      default:
        console.log(`📨 Received: ${message.type}`);
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

  joinPvEBattle() {
    console.log("🎮 Joining PvE battle...");
    const playerCards = [
      {
        cardName: "TestBeast",
        configuration: {
          name: "Test Beast",
          abilities: ["basic_attack", "defend"] as const
        }
      }
    ];

    this.send("JOIN_MATCHMAKING", {
      type: "PVE",
      playerCards,
    });
  }

  confirmReady() {
    console.log("✅ Confirming ready...");
    this.send("READY_CONFIRM", {});
  }

  startBattleActions() {
    console.log("⚡ Starting battle actions...");
    
    // Perform actions every 2 seconds
    const actionInterval = setInterval(() => {
      if (!this.battleStarted) {
        clearInterval(actionInterval);
        return;
      }

      // Simple test action
      const action = {
        type: "CAST_ABILITY",
        entityId: `${this.playerId}_TestBeast`,
        abilityName: "basic_attack",
        targetId: "ai_target", // This might need to be dynamic
        timestamp: Date.now()
      };

      console.log("🔥 Casting basic_attack...");
      this.send("PLAYER_ACTION", action);
    }, 2000);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runQuickTest() {
  console.log("🚀 Quick Battle Test");
  console.log("📋 Testing basic battle functionality...\n");

  const tester = new QuickBattleTest();

  try {
    await tester.connect();
    
    // Wait a moment then join battle
    setTimeout(() => {
      tester.joinPvEBattle();
    }, 1000);

    // Timeout after 30 seconds
    setTimeout(() => {
      console.log("⏰ Test timeout - ending test");
      tester.disconnect();
      process.exit(1);
    }, 30000);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log("\n🛑 Test interrupted");
      tester.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Test failed:", error);
    tester.disconnect();
    process.exit(1);
  }
}

// Run the test
runQuickTest();