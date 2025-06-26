import { proxy } from "valtio";
import { battleStore, battleActions } from "./BattleStore";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface NetworkState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  latency: number;
  lastPingTime: number;
}

export interface MatchmakingState {
  isInQueue: boolean;
  queueType: "PVP" | "PVE" | null;
  matchFound: boolean;
  matchId: string | null;
  readyTimeoutMs: number;
  isReady: boolean;
  opponentReady: boolean;
}

export interface BattleNetworkState {
  battleId: string | null;
  isInBattle: boolean;
  battleState: any;
  lastStateUpdate: number;
}

export const networkStore = proxy<{
  network: NetworkState;
  matchmaking: MatchmakingState;
  battle: BattleNetworkState;
}>({
  network: {
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    latency: 0,
    lastPingTime: 0,
  },
  matchmaking: {
    isInQueue: false,
    queueType: null,
    matchFound: false,
    matchId: null,
    readyTimeoutMs: 0,
    isReady: false,
    opponentReady: false,
  },
  battle: {
    battleId: null,
    isInBattle: false,
    battleState: null,
    lastStateUpdate: 0,
  },
});

export class NetworkManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor() {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    this.messageHandlers.set("MATCHMAKING_JOINED", (data) => {
      networkStore.matchmaking.isInQueue = true;
      networkStore.matchmaking.queueType = data.queueType;
    });

    this.messageHandlers.set("MATCHMAKING_LEFT", () => {
      networkStore.matchmaking.isInQueue = false;
      networkStore.matchmaking.queueType = null;
      networkStore.matchmaking.matchFound = false;
    });

    this.messageHandlers.set("MATCH_FOUND", (data) => {
      networkStore.matchmaking.matchFound = true;
      networkStore.matchmaking.matchId = data.matchId;
      networkStore.matchmaking.readyTimeoutMs = data.readyTimeoutMs;
      networkStore.matchmaking.isReady = false;
      networkStore.matchmaking.opponentReady = false;
    });

    this.messageHandlers.set("PLAYER_READY", (data) => {
      if (data.playerId !== this.getPlayerId()) {
        networkStore.matchmaking.opponentReady = true;
      }
    });

    this.messageHandlers.set("MATCH_CANCELLED", () => {
      networkStore.matchmaking.matchFound = false;
      networkStore.matchmaking.matchId = null;
      networkStore.matchmaking.isReady = false;
      networkStore.matchmaking.opponentReady = false;
    });

    this.messageHandlers.set("BATTLE_STARTED", (data) => {
      networkStore.battle.battleId = data.battleId;
      networkStore.battle.isInBattle = true;
      networkStore.matchmaking.isInQueue = false;
      networkStore.matchmaking.matchFound = false;

      // Initialize battle in battle store
      if (data.initialState) {
        battleActions.startBattle(data.battleId, data.initialState);
      }
    });

    this.messageHandlers.set("BATTLE_STATE_UPDATE", (data) => {
      networkStore.battle.battleState = data;
      networkStore.battle.lastStateUpdate = Date.now();

      // Update battle store with new state
      battleActions.updateBattleState(data);
    });

    this.messageHandlers.set("BATTLE_ENDED", (data) => {
      networkStore.battle.isInBattle = false;
      networkStore.battle.battleId = null;
      networkStore.battle.battleState = null;

      // End battle in battle store
      battleActions.endBattle();

      // Show battle result notification
      if (data.winner) {
        const isWinner = data.winner === battleStore.playerId;
        battleActions.addNotification(
          isWinner
            ? "Victory! You won the battle!"
            : "Defeat! Better luck next time!"
        );
      }
    });

    this.messageHandlers.set("PONG", () => {
      const now = Date.now();
      networkStore.network.latency = now - networkStore.network.lastPingTime;

      // Update battle store connection state
      battleActions.setConnectionState(true, networkStore.network.latency);
    });

    this.messageHandlers.set("ACTION_RESULT", (data) => {
      // Handle action results (success/failure)
      battleActions.setActionInProgress(false);

      if (data.success) {
        battleActions.addNotification(
          `Action successful: ${data.message || "Action completed"}`
        );
      } else {
        battleActions.addNotification(
          `Action failed: ${data.error || "Unknown error"}`
        );
      }
    });

    this.messageHandlers.set("TURN_CHANGE", (data) => {
      // Handle turn changes
      const isPlayerTurn = data.currentPlayerId === battleStore.playerId;
      battleStore.uiState.isPlayerTurn = isPlayerTurn;

      battleActions.addNotification(
        isPlayerTurn ? "Your turn!" : "Opponent's turn"
      );
    });

    this.messageHandlers.set("BATTLE_EVENT", (data) => {
      // Handle specific battle events (damage, healing, status effects, etc.)
      if (data.message) {
        battleActions.addNotification(data.message);
      }
    });

    this.messageHandlers.set("ERROR", (data) => {
      // Handle server errors
      battleActions.addNotification(
        `Error: ${data.message || "Unknown error occurred"}`
      );

      // Reset action state on error
      battleActions.setActionInProgress(false);
    });
  }

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      networkStore.network.isConnecting = true;
      networkStore.network.connectionError = null;

      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        networkStore.network.isConnected = true;
        networkStore.network.isConnecting = false;
        networkStore.network.connectionError = null;
        this.reconnectAttempts = 0;

        this.startPingInterval();
        console.log("WebSocket connected");
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        networkStore.network.isConnected = false;
        networkStore.network.isConnecting = false;
        this.stopPingInterval();

        console.log(
          `WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`
        );

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(
            `Attempting reconnect ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${delay}ms`
          );
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect().catch(console.error);
          }, delay);
        } else {
          networkStore.network.connectionError =
            "Max reconnection attempts reached";
          console.error("Max reconnection attempts reached");
        }
      };

      this.ws.onerror = (error) => {
        const errorMsg = `WebSocket connection failed to ${wsUrl}`;
        networkStore.network.connectionError = errorMsg;
        networkStore.network.isConnecting = false;
        console.error("WebSocket error:", error);
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPingInterval();
    networkStore.network.isConnected = false;
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port =
      window.location.hostname === "localhost"
        ? "3001"
        : window.location.port || "3001";
    const url = `${protocol}//${host}:${port}`;
    console.log(`Connecting to WebSocket: ${url}`);
    return url;
  }

  private getPlayerId(): string {
    // In a real app, this would come from authentication
    return localStorage.getItem("playerId") || `player_${Date.now()}`;
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      console.warn(`Unhandled message type: ${message.type}`);
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        networkStore.network.lastPingTime = Date.now();
        this.send("PING", {});
      }
    }, 5000); // Ping every 5 seconds
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message: WebSocket not connected");
    }
  }

  // Matchmaking methods
  joinMatchmaking(type: "PVP" | "PVE", playerCards: any[]) {
    this.send("JOIN_MATCHMAKING", {
      type,
      playerCards,
    });
  }

  leaveMatchmaking() {
    this.send("LEAVE_MATCHMAKING", {});
  }

  confirmReady() {
    this.send("READY_CONFIRM", {});
    networkStore.matchmaking.isReady = true;
  }

  // Battle methods
  sendPlayerAction(action: any) {
    this.send("PLAYER_ACTION", action);
  }
}

export const networkManager = new NetworkManager();
