import type { ServerWebSocket } from "bun";
import { wsManager, type WebSocketMessage } from "./WebSocketManager";
import { matchmakingService } from "../battle/Matchmaking";
import { battleServer } from "../battle/BattleServer";

export interface PlayerAction {
  type: "CAST_ABILITY" | "MOVE" | "CANCEL_CAST";
  entityId: string;
  abilityName?: string;
  targetId?: string;
  timestamp: number;
}

export interface MatchmakingRequest {
  type: "PVP" | "PVE";
  playerCards: {
    cardName: string;
    configuration: { name: string; abilities: readonly string[] };
  }[];
}

export class MessageHandler {
  handleMessage(connectionId: string, message: string) {
    try {
      const data = JSON.parse(message) as WebSocketMessage;
      const connection = wsManager.getConnection(connectionId);
      
      if (!connection) {
        console.error(`Connection not found: ${connectionId}`);
        return;
      }

      switch (data.type) {
        case "JOIN_MATCHMAKING":
          this.handleJoinMatchmaking(connection.playerId, data.data as MatchmakingRequest);
          break;
        case "LEAVE_MATCHMAKING":
          this.handleLeaveMatchmaking(connection.playerId);
          break;
        case "READY_CONFIRM":
          this.handleReadyConfirm(connection.playerId);
          break;
        case "PLAYER_ACTION":
          this.handlePlayerAction(connection.playerId, data.data as PlayerAction);
          break;
        case "PING":
          this.handlePing(connectionId);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Error handling message: ${error}`);
    }
  }

  private handleJoinMatchmaking(playerId: string, request: MatchmakingRequest) {
    matchmakingService.addPlayer(playerId, request);
  }

  private handleLeaveMatchmaking(playerId: string) {
    matchmakingService.removePlayer(playerId);
  }

  private handleReadyConfirm(playerId: string) {
    matchmakingService.confirmReady(playerId);
  }

  private handlePlayerAction(playerId: string, action: PlayerAction) {
    const connection = wsManager.getConnectionByPlayerId(playerId);
    if (connection?.battleId) {
      battleServer.handlePlayerAction(connection.battleId, playerId, action);
    }
  }

  private handlePing(connectionId: string) {
    const connection = wsManager.getConnection(connectionId);
    if (connection) {
      connection.ws.send(JSON.stringify({
        type: "PONG",
        data: {},
        timestamp: Date.now()
      }));
    }
  }
}

export const messageHandler = new MessageHandler();