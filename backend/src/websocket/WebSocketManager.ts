import type { ServerWebSocket } from "bun";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PlayerConnection {
  id: string;
  ws: ServerWebSocket<any>;
  playerId: string;
  battleId?: string;
  isAuthenticated: boolean;
}

export class WebSocketManager {
  private connections = new Map<string, PlayerConnection>();
  private playerToBattle = new Map<string, string>();

  addConnection(connectionId: string, ws: ServerWebSocket<any>, playerId: string) {
    const connection: PlayerConnection = {
      id: connectionId,
      ws,
      playerId,
      isAuthenticated: true,
    };
    this.connections.set(connectionId, connection);
    console.log(`Player ${playerId} connected`);
  }

  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      if (connection.battleId) {
        this.playerToBattle.delete(connection.playerId);
      }
      this.connections.delete(connectionId);
      console.log(`Player ${connection.playerId} disconnected`);
    }
  }

  getConnection(connectionId: string): PlayerConnection | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionByPlayerId(playerId: string): PlayerConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.playerId === playerId) {
        return connection;
      }
    }
    return undefined;
  }

  sendToPlayer(playerId: string, message: WebSocketMessage) {
    const connection = this.getConnectionByPlayerId(playerId);
    if (connection) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  sendToBattle(battleId: string, message: WebSocketMessage) {
    for (const connection of this.connections.values()) {
      if (connection.battleId === battleId) {
        connection.ws.send(JSON.stringify(message));
      }
    }
  }

  setBattleForPlayer(playerId: string, battleId: string) {
    const connection = this.getConnectionByPlayerId(playerId);
    if (connection) {
      connection.battleId = battleId;
      this.playerToBattle.set(playerId, battleId);
    }
  }

  removeBattleForPlayer(playerId: string) {
    const connection = this.getConnectionByPlayerId(playerId);
    if (connection) {
      connection.battleId = undefined;
      this.playerToBattle.delete(playerId);
    }
  }

  getPlayersInBattle(battleId: string): string[] {
    const players: string[] = [];
    for (const connection of this.connections.values()) {
      if (connection.battleId === battleId) {
        players.push(connection.playerId);
      }
    }
    return players;
  }
}

export const wsManager = new WebSocketManager();