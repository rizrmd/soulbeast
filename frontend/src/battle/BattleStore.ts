import { proxy } from "valtio";
import { SoulBeastName } from "core/SoulBeast";

// Types for battle system
export interface PlayerCard {
  cardName: SoulBeastName;
  configuration: {
    name: string;
    abilities: readonly string[];
  };
}

export interface BattlePlayer {
  id: string;
  name: string;
  cards: PlayerCard[];
  isReady: boolean;
}

export interface BattleEntity {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  statusEffects: any[];
  abilities: string[];
  playerId: string;
}

export interface BattleState {
  id: string;
  phase: "countdown" | "battle" | "ended";
  currentTurn: number;
  timeRemaining: number;
  players: BattlePlayer[];
  entities: BattleEntity[] | Record<string, BattleEntity>; // Can be array or object (from Map serialization)
  events: any[];
  winner?: string;
}

export interface BattleUIState {
  selectedEntity: string | null;
  targetEntity: string | null;
  selectedAbility: string | null;
  isPlayerTurn: boolean;
  showAbilities: boolean;
  actionInProgress: boolean;
}

export interface BattleStore {
  // Battle state from server
  battleState: BattleState | null;
  
  // Local UI state
  uiState: BattleUIState;
  
  // Player info
  playerId: string;
  
  // Connection state
  isConnected: boolean;
  latency: number;
  
  // Battle flow
  isInBattle: boolean;
  battleId: string | null;
  
  // Events and notifications
  recentEvents: any[];
  notifications: string[];
}

// Create the battle store
export const battleStore = proxy<BattleStore>({
  battleState: null,
  
  uiState: {
    selectedEntity: null,
    targetEntity: null,
    selectedAbility: null,
    isPlayerTurn: false,
    showAbilities: false,
    actionInProgress: false,
  },
  
  playerId: localStorage.getItem("playerId") || `player_${Date.now()}`,
  
  isConnected: false,
  latency: 0,
  
  isInBattle: false,
  battleId: null,
  
  recentEvents: [],
  notifications: [],
});

// Battle store actions
export const battleActions = {
  // Update battle state from server
  updateBattleState(newState: BattleState) {
    battleStore.battleState = newState;
    
    // Update UI state based on battle state
    if (newState.phase === "ended") {
      battleStore.uiState.isPlayerTurn = false;
      battleStore.uiState.actionInProgress = false;
    }
    
    // Add new events to recent events
    if (newState.events && newState.events.length > 0) {
      const newEvents = newState.events.slice(battleStore.recentEvents.length);
      battleStore.recentEvents.push(...newEvents);
      
      // Keep only last 20 events
      if (battleStore.recentEvents.length > 20) {
        battleStore.recentEvents = battleStore.recentEvents.slice(-20);
      }
    }
  },
  
  // UI actions
  selectEntity(entityId: string | null) {
    battleStore.uiState.selectedEntity = entityId;
    battleStore.uiState.targetEntity = null;
    battleStore.uiState.selectedAbility = null;
  },
  
  selectTarget(entityId: string | null) {
    battleStore.uiState.targetEntity = entityId;
  },
  
  selectAbility(abilityName: string | null) {
    battleStore.uiState.selectedAbility = abilityName;
    battleStore.uiState.targetEntity = null;
  },
  
  toggleAbilities() {
    battleStore.uiState.showAbilities = !battleStore.uiState.showAbilities;
  },
  
  setActionInProgress(inProgress: boolean) {
    battleStore.uiState.actionInProgress = inProgress;
  },
  
  // Battle flow actions
  startBattle(battleId: string, initialState: BattleState) {
    battleStore.isInBattle = true;
    battleStore.battleId = battleId;
    battleStore.battleState = initialState;
    
    // Reset UI state
    battleStore.uiState.selectedEntity = null;
    battleStore.uiState.targetEntity = null;
    battleStore.uiState.selectedAbility = null;
    battleStore.uiState.isPlayerTurn = false;
    battleStore.uiState.showAbilities = false;
    battleStore.uiState.actionInProgress = false;
    
    // Clear previous events
    battleStore.recentEvents = [];
    battleStore.notifications = [];
  },
  
  endBattle() {
    battleStore.isInBattle = false;
    battleStore.battleId = null;
    battleStore.battleState = null;
    
    // Reset UI state
    battleStore.uiState.selectedEntity = null;
    battleStore.uiState.targetEntity = null;
    battleStore.uiState.selectedAbility = null;
    battleStore.uiState.isPlayerTurn = false;
    battleStore.uiState.showAbilities = false;
    battleStore.uiState.actionInProgress = false;
  },
  
  // Connection state
  setConnectionState(connected: boolean, latency: number = 0) {
    battleStore.isConnected = connected;
    battleStore.latency = latency;
  },
  
  // Notifications
  addNotification(message: string) {
    battleStore.notifications.push(message);
    
    // Keep only last 10 notifications
    if (battleStore.notifications.length > 10) {
      battleStore.notifications = battleStore.notifications.slice(-10);
    }
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      const index = battleStore.notifications.indexOf(message);
      if (index > -1) {
        battleStore.notifications.splice(index, 1);
      }
    }, 5000);
  },
  
  clearNotifications() {
    battleStore.notifications = [];
  },
  
  // Helper functions
  getPlayerEntities(): BattleEntity[] {
    if (!battleStore.battleState) return [];
    // Handle entities as either array or object (from Map serialization)
    const entities = Array.isArray(battleStore.battleState.entities) 
      ? battleStore.battleState.entities
      : Object.values(battleStore.battleState.entities);
      
    return entities.filter(
      entity => entity.playerId === battleStore.playerId
    );
  },
  
  getOpponentEntities(): BattleEntity[] {
    if (!battleStore.battleState) return [];
    // Handle entities as either array or object (from Map serialization)
    const entities = Array.isArray(battleStore.battleState.entities) 
      ? battleStore.battleState.entities
      : Object.values(battleStore.battleState.entities);
    return entities.filter(
      entity => entity.playerId !== battleStore.playerId
    );
  },
  
  getCurrentPlayer(): BattlePlayer | null {
    if (!battleStore.battleState) return null;
    return battleStore.battleState.players.find(
      player => player.id === battleStore.playerId
    ) || null;
  },
  
  getOpponentPlayer(): BattlePlayer | null {
    if (!battleStore.battleState) return null;
    return battleStore.battleState.players.find(
      player => player.id !== battleStore.playerId
    ) || null;
  },
  
  isEntitySelectable(entityId: string): boolean {
    if (!battleStore.battleState || !battleStore.uiState.isPlayerTurn) return false;
    
    // Handle entities as either array or object (from Map serialization)
    const entities = Array.isArray(battleStore.battleState.entities) 
      ? battleStore.battleState.entities
      : Object.values(battleStore.battleState.entities);
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return false;
    
    // Can select own entities
    return entity.playerId === battleStore.playerId;
  },
  
  isEntityTargetable(entityId: string): boolean {
    if (!battleStore.battleState || !battleStore.uiState.selectedAbility) return false;
    
    // Handle entities as either array or object (from Map serialization)
    const entities = Array.isArray(battleStore.battleState.entities) 
      ? battleStore.battleState.entities
      : Object.values(battleStore.battleState.entities);
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return false;
    
    // For now, can target any entity (abilities will determine valid targets)
    return true;
  },
};