import { wsManager } from "../websocket/WebSocketManager";
import { battleServer } from "./BattleServer";
import type { MatchmakingRequest } from "../websocket/MessageHandler";

export interface QueuedPlayer {
  playerId: string;
  request: MatchmakingRequest;
  queueTime: number;
}

export interface MatchFound {
  matchId: string;
  players: QueuedPlayer[];
  readyStatus: Map<string, boolean>;
  readyTimeout: NodeJS.Timeout;
}

export class MatchmakingService {
  private pvpQueue: QueuedPlayer[] = [];
  private pveQueue: QueuedPlayer[] = [];
  private pendingMatches = new Map<string, MatchFound>();
  private readonly READY_TIMEOUT = 10000; // 10 seconds

  addPlayer(playerId: string, request: MatchmakingRequest) {
    // Remove player from any existing queue
    this.removePlayer(playerId);

    const queuedPlayer: QueuedPlayer = {
      playerId,
      request,
      queueTime: Date.now()
    };

    if (request.type === "PVP") {
      this.pvpQueue.push(queuedPlayer);
      this.tryMatchPvP();
    } else {
      this.pveQueue.push(queuedPlayer);
      this.tryMatchPvE(queuedPlayer);
    }

    wsManager.sendToPlayer(playerId, {
      type: "MATCHMAKING_JOINED",
      data: { queueType: request.type },
      timestamp: Date.now()
    });
  }

  removePlayer(playerId: string) {
    // Remove from PvP queue
    this.pvpQueue = this.pvpQueue.filter(p => p.playerId !== playerId);
    // Remove from PvE queue
    this.pveQueue = this.pveQueue.filter(p => p.playerId !== playerId);

    // Remove from pending matches
    for (const [matchId, match] of this.pendingMatches.entries()) {
      if (match.players.some(p => p.playerId === playerId)) {
        this.cancelMatch(matchId);
        break;
      }
    }

    wsManager.sendToPlayer(playerId, {
      type: "MATCHMAKING_LEFT",
      data: {},
      timestamp: Date.now()
    });
  }

  confirmReady(playerId: string) {
    for (const [matchId, match] of this.pendingMatches.entries()) {
      if (match.players.some(p => p.playerId === playerId)) {
        match.readyStatus.set(playerId, true);
        
        // Check if all players are ready
        const allReady = match.players.every(p => match.readyStatus.get(p.playerId));
        
        if (allReady) {
          this.startBattle(matchId, match);
        } else {
          // Notify other players about ready status
          match.players.forEach(p => {
            wsManager.sendToPlayer(p.playerId, {
              type: "PLAYER_READY",
              data: { playerId, readyCount: Array.from(match.readyStatus.values()).filter(Boolean).length },
              timestamp: Date.now()
            });
          });
        }
        break;
      }
    }
  }

  private tryMatchPvP() {
    if (this.pvpQueue.length >= 2) {
      const player1 = this.pvpQueue.shift()!;
      const player2 = this.pvpQueue.shift()!;
      
      this.createMatch([player1, player2]);
    }
  }

  private tryMatchPvE(player: QueuedPlayer) {
    // For PvE, immediately create a match with AI
    this.createMatch([player]);
  }

  private createMatch(players: QueuedPlayer[]) {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const readyStatus = new Map<string, boolean>();
    
    players.forEach(p => readyStatus.set(p.playerId, false));

    const readyTimeout = setTimeout(() => {
      this.cancelMatch(matchId);
    }, this.READY_TIMEOUT);

    const match: MatchFound = {
      matchId,
      players,
      readyStatus,
      readyTimeout
    };

    this.pendingMatches.set(matchId, match);

    // Notify players about match found
    players.forEach(p => {
      wsManager.sendToPlayer(p.playerId, {
        type: "MATCH_FOUND",
        data: {
          matchId,
          opponents: players.filter(op => op.playerId !== p.playerId).map(op => op.playerId),
          readyTimeoutMs: this.READY_TIMEOUT
        },
        timestamp: Date.now()
      });
    });
  }

  private cancelMatch(matchId: string) {
    const match = this.pendingMatches.get(matchId);
    if (match) {
      clearTimeout(match.readyTimeout);
      
      // Notify players about cancellation
      match.players.forEach(p => {
        wsManager.sendToPlayer(p.playerId, {
          type: "MATCH_CANCELLED",
          data: { reason: "timeout" },
          timestamp: Date.now()
        });
        
        // Re-add to queue if they want to continue
        if (p.request.type === "PVP") {
          this.pvpQueue.push(p);
        } else {
          this.pveQueue.push(p);
        }
      });
      
      this.pendingMatches.delete(matchId);
    }
  }

  private startBattle(matchId: string, match: MatchFound) {
    const match_data = this.pendingMatches.get(matchId);
    if (!match_data) return;

    clearTimeout(match.readyTimeout);
    this.pendingMatches.delete(matchId);

    // Create battle
    const battleId = battleServer.createBattle(match.players);
    
    // Assign players to battle
    match.players.forEach(p => {
      wsManager.setBattleForPlayer(p.playerId, battleId);
    });

    // Notify players about battle start
    match.players.forEach(p => {
      wsManager.sendToPlayer(p.playerId, {
        type: "BATTLE_STARTED",
        data: { battleId },
        timestamp: Date.now()
      });
    });
  }
}

export const matchmakingService = new MatchmakingService();