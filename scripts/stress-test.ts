#!/usr/bin/env bun

import { WebSocket } from "ws";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

class StressTestClient {
  private ws: WebSocket | null = null;
  private playerId: string;
  private isConnected = false;
  private battleCount = 0;
  private actionCount = 0;
  private startTime = Date.now();

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket("ws://localhost:3001");

      this.ws.on("open", () => {
        this.isConnected = true;
        resolve();
      });

      this.ws.on("message", (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          // Silent error handling for stress test
        }
      });

      this.ws.on("error", (error) => {
        reject(error);
      });

      this.ws.on("close", () => {
        this.isConnected = false;
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "MATCH_FOUND":
        setTimeout(() => this.confirmReady(), 100);
        break;

      case "BATTLE_STARTED":
        this.battleCount++;
        this.startRandomActions();
        break;

      case "BATTLE_ENDED":
        // Immediately rejoin queue
        setTimeout(() => this.joinMatchmaking(), 500);
        break;
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

  joinMatchmaking() {
    const playerCards = [
      {
        cardName: "StressBeast",
        configuration: {
          name: `${this.playerId}_Beast`,
          abilities: ["basic_attack"] as const
        }
      }
    ];

    this.send("JOIN_MATCHMAKING", {
      type: "PVE",
      playerCards,
    });
  }

  confirmReady() {
    this.send("READY_CONFIRM", {});
  }

  startRandomActions() {
    const actionInterval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(actionInterval);
        return;
      }

      const action = {
        type: "CAST_ABILITY",
        entityId: `${this.playerId}_StressBeast`,
        abilityName: "basic_attack",
        targetId: "ai_target",
        timestamp: Date.now()
      };

      this.send("PLAYER_ACTION", action);
      this.actionCount++;
    }, 500 + Math.random() * 1000); // Random interval between 0.5-1.5s

    // Stop actions after 10 seconds (battle should end by then)
    setTimeout(() => {
      clearInterval(actionInterval);
    }, 10000);
  }

  getStats() {
    const runtime = (Date.now() - this.startTime) / 1000;
    return {
      playerId: this.playerId,
      battles: this.battleCount,
      actions: this.actionCount,
      runtime: runtime.toFixed(1),
      battlesPerMinute: ((this.battleCount / runtime) * 60).toFixed(1),
      actionsPerMinute: ((this.actionCount / runtime) * 60).toFixed(1)
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runStressTest() {
  const CLIENT_COUNT = 10;
  const TEST_DURATION = 60000; // 1 minute

  console.log("🔥 SoulBeast Stress Test");
  console.log(`📊 Spawning ${CLIENT_COUNT} concurrent clients for ${TEST_DURATION/1000}s\n`);

  const clients: StressTestClient[] = [];
  const connectionPromises: Promise<void>[] = [];

  // Create and connect clients
  for (let i = 0; i < CLIENT_COUNT; i++) {
    const client = new StressTestClient(`stress_${i}`);
    clients.push(client);
    connectionPromises.push(client.connect());
  }

  try {
    // Wait for all connections
    console.log("🔌 Connecting clients...");
    await Promise.all(connectionPromises);
    console.log(`✅ ${CLIENT_COUNT} clients connected\n`);

    // Start matchmaking for all clients
    console.log("🎮 Starting matchmaking...");
    clients.forEach((client, index) => {
      setTimeout(() => {
        client.joinMatchmaking();
      }, index * 100); // Stagger joins by 100ms
    });

    // Run test for specified duration
    console.log(`⏱️  Running stress test for ${TEST_DURATION/1000} seconds...\n`);
    
    // Print stats every 10 seconds
    const statsInterval = setInterval(() => {
      console.log("📈 Current Stats:");
      let totalBattles = 0;
      let totalActions = 0;
      
      clients.forEach(client => {
        const stats = client.getStats();
        totalBattles += stats.battles;
        totalActions += stats.actions;
      });
      
      console.log(`   Total Battles: ${totalBattles}`);
      console.log(`   Total Actions: ${totalActions}`);
      console.log(`   Avg Battles/Client: ${(totalBattles / CLIENT_COUNT).toFixed(1)}`);
      console.log(`   Avg Actions/Client: ${(totalActions / CLIENT_COUNT).toFixed(1)}\n`);
    }, 10000);

    // End test after duration
    setTimeout(() => {
      clearInterval(statsInterval);
      
      console.log("🏁 Stress Test Complete!\n");
      console.log("📊 Final Results:");
      console.log("=".repeat(50));
      
      let totalBattles = 0;
      let totalActions = 0;
      
      clients.forEach(client => {
        const stats = client.getStats();
        totalBattles += stats.battles;
        totalActions += stats.actions;
        console.log(`${stats.playerId}: ${stats.battles} battles, ${stats.actions} actions (${stats.battlesPerMinute} battles/min)`);
      });
      
      console.log("=".repeat(50));
      console.log(`📈 TOTALS:`);
      console.log(`   Battles: ${totalBattles}`);
      console.log(`   Actions: ${totalActions}`);
      console.log(`   Avg Battles/Client: ${(totalBattles / CLIENT_COUNT).toFixed(1)}`);
      console.log(`   Avg Actions/Client: ${(totalActions / CLIENT_COUNT).toFixed(1)}`);
      console.log(`   Server Load: ${((totalBattles + totalActions) / (TEST_DURATION/1000)).toFixed(1)} events/sec`);
      
      // Disconnect all clients
      clients.forEach(client => client.disconnect());
      process.exit(0);
    }, TEST_DURATION);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log("\n🛑 Stress test interrupted");
      clearInterval(statsInterval);
      clients.forEach(client => client.disconnect());
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Stress test failed:", error);
    clients.forEach(client => client.disconnect());
    process.exit(1);
  }
}

// Run the stress test
runStressTest();