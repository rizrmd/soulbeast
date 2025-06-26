# Battle System Architecture Plan

## Current State Analysis

The current SoulBeast battle system operates entirely on the client-side with the following architecture:

### Current Implementation

- **Client-Only Battle Engine**: All battle logic runs in `BattleEngine.ts` on the frontend
- **Local State Management**: Battle state is managed via Valtio proxy in `GameStore.ts`
- **Game Loop**: 100ms tick rate running locally with `setTimeout`
- **AI Simulation**: Simple AI runs locally to simulate Player 2
- **No Server Synchronization**: Battles are purely local experiences
- **API Usage**: Only for authentication, inventory, and battle history storage

### Problems with Current Approach

1. **No Real PvP**: Players cannot battle each other in real-time
2. **Client Authority**: All game logic is client-side, making it vulnerable to cheating
3. **No Lag Handling**: No network synchronization or lag compensation
4. **Inconsistent State**: No authoritative server state
5. **Limited Scalability**: Cannot support tournaments or spectating

## Proposed Architecture

### Server-Side Battle Engine

#### 1. Battle Server Implementation

```typescript
// backend/src/battle/BattleServer.ts
class BattleServer {
  private battles: Map<string, ServerBattleEngine>;
  private playerConnections: Map<string, WebSocket>;

  // Handle battle creation, player matching, state synchronization
}

class ServerBattleEngine extends BattleEngine {
  // Authoritative battle logic
  // Input validation
  // Anti-cheat measures
  // State broadcasting
}
```

#### 2. WebSocket Integration

- **Real-time Communication**: Use Bun's built-in WebSocket support
- **Message Types**:
  - `BATTLE_STATE_UPDATE`
  - `PLAYER_ACTION`
  - `ABILITY_CAST`
  - `BATTLE_EVENT`
  - `PLAYER_JOIN/LEAVE`

#### 3. Battle Modes

- **PvP (Player vs Player)**: Real-time battles between human players
- **PvE (Player vs AI)**: Player battles against server-controlled AI
- **Tournament**: Multi-player bracket system
- **Spectator**: Watch ongoing battles

### Client-Side Synchronization

#### 1. Predictive Client

```typescript
// frontend/src/engine/ClientBattleEngine.ts
class ClientBattleEngine {
  private serverState: BattleState;
  private predictedState: BattleState;
  private pendingActions: PlayerAction[];

  // Client-side prediction
  // Server reconciliation
  // Lag compensation
}
```

#### 2. State Synchronization Strategy

- **Server Authority**: Server maintains authoritative game state
- **Client Prediction**: Client predicts actions for responsiveness
- **State Reconciliation**: Client corrects predictions when server updates arrive
- **Rollback**: Handle mispredictions by rolling back and replaying

#### 3. Lag Compensation Techniques

- **Input Buffering**: Buffer player inputs during network delays
- **Interpolation**: Smooth visual updates between server states
- **Extrapolation**: Predict entity positions during lag spikes
- **Rollback Netcode**: Rewind and replay game state for fair hit detection

### Implementation Plan

#### Phase 1: WebSocket Infrastructure

1. **Backend WebSocket Server**

   - Implement WebSocket handlers in Bun server
   - Create message routing system
   - Add connection management
   - Implement basic authentication over WebSocket

2. **Frontend WebSocket Client**
   - Create WebSocket connection manager
   - Implement message serialization/deserialization
   - Add connection state management (connecting, connected, disconnected)
   - Handle reconnection logic

#### Phase 2: Server-Side Battle Engine

1. **Port Battle Logic**

   - Move `BattleEngine.ts` to backend
   - Implement server-side ability system
   - Add input validation and anti-cheat measures
   - Create battle room management

2. **Battle Matchmaking**
   - Implement player queue system
   - Add battle room creation/joining
   - Support for private battles (friend codes)
   - AI opponent assignment for PvE

#### Phase 3: Client Prediction & Synchronization

1. **Predictive Client**

   - Implement client-side prediction for responsiveness
   - Add server state reconciliation
   - Handle action confirmation/rejection
   - Implement visual smoothing for network updates

2. **Lag Compensation**
   - Add input buffering for high-latency connections
   - Implement interpolation for smooth animations
   - Add rollback for mispredicted actions
   - Create lag indicator UI

#### Phase 4: Advanced Features

1. **Spectator Mode**

   - Allow players to watch ongoing battles
   - Implement spectator-specific UI
   - Add replay system

2. **Tournament System**
   - Multi-player bracket tournaments
   - Automated tournament progression
   - Leaderboards and rankings

### Technical Specifications

#### WebSocket Message Protocol

```typescript
interface BattleMessage {
  type: "BATTLE_STATE" | "PLAYER_ACTION" | "BATTLE_EVENT" | "ERROR";
  timestamp: number;
  battleId: string;
  data: any;
}

interface PlayerAction {
  type: "CAST_ABILITY" | "MOVE" | "CANCEL_CAST";
  entityId: string;
  abilityName?: string;
  targetId?: string;
  timestamp: number;
}
```

#### State Synchronization

- **Full State**: Send complete battle state every 1000ms
- **Delta Updates**: Send only changes every 100ms
- **Critical Events**: Send immediately (ability casts, deaths, etc.)
- **Client Prediction**: Allow 2-3 frames of prediction before server confirmation

#### Performance Targets

- **Latency**: < 100ms for ability casting
- **Update Rate**: 10Hz for state updates, 60Hz for visual interpolation
- **Bandwidth**: < 10KB/s per player during active battle
- **Concurrent Battles**: Support 100+ simultaneous battles

### Lag Handling Strategies

#### Low Latency (< 50ms)

- **Direct Execution**: Execute actions immediately with server confirmation
- **Minimal Prediction**: Only predict visual effects

#### Medium Latency (50-150ms)

- **Input Buffering**: Buffer 1-2 frames of input
- **State Interpolation**: Smooth between server updates
- **Predictive Casting**: Show ability effects immediately, confirm with server

#### High Latency (150ms+)

- **Extended Buffering**: Buffer up to 5 frames of input
- **Aggressive Prediction**: Predict 3-4 frames ahead
- **Rollback on Misprediction**: Rewind and replay when server disagrees
- **Visual Indicators**: Show lag warnings to player

#### Connection Issues

- **Reconnection**: Automatic reconnection with state resync
- **Pause on Disconnect**: Pause battle for 30 seconds if player disconnects
- **AI Takeover**: Replace disconnected player with AI temporarily
- **Battle Forfeit**: End battle if reconnection fails

### Security Considerations

#### Server Authority

- All damage calculations on server
- Ability cooldowns enforced server-side
- Movement validation and bounds checking
- Resource (mana/energy) validation

#### Anti-Cheat Measures

- Input rate limiting
- Impossible action detection
- Statistical analysis of player performance
- Encrypted communication

#### Data Validation

- Validate all player inputs
- Sanitize ability targets
- Check action prerequisites
- Verify timing constraints

### Migration Strategy

#### Backward Compatibility

- Keep existing local battle mode for offline play
- Add "Online" vs "Offline" battle options
- Maintain current UI/UX for seamless transition

#### Gradual Rollout

1. **Alpha**: Internal testing with WebSocket infrastructure
2. **Beta**: Limited PvP testing with select users
3. **Release**: Full PvP launch with fallback to local mode
4. **Enhancement**: Advanced features (tournaments, spectating)

### Success Metrics

#### Technical Metrics

- Average latency < 100ms
- 99.9% uptime for battle servers
- < 1% packet loss during battles
- Successful reconnection rate > 95%

#### User Experience Metrics

- Battle completion rate > 90%
- Player satisfaction with responsiveness
- Reduced reports of "lag" or "unfairness"
- Increased engagement with PvP modes

### File Structure

```
backend/
├── src/
│   ├── battle/
│   │   ├── BattleServer.ts          # WebSocket battle server
│   │   ├── ServerBattleEngine.ts    # Authoritative battle logic
│   │   ├── BattleRoom.ts           # Battle room management
│   │   ├── Matchmaking.ts          # Player matching system
│   │   └── AntiCheat.ts            # Cheat detection
│   ├── websocket/
│   │   ├── WebSocketManager.ts     # Connection management
│   │   ├── MessageHandler.ts       # Message routing
│   │   └── Authentication.ts       # WebSocket auth
│   └── api/
│       └── battle-endpoints.ts     # REST endpoints for battle history

frontend/
├── src/
│   ├── engine/
│   │   ├── ClientBattleEngine.ts   # Client prediction engine
│   │   ├── NetworkManager.ts       # WebSocket client
│   │   ├── StateSync.ts           # State synchronization
│   │   └── LagCompensation.ts     # Lag handling
│   ├── components/
│   │   ├── BattleArena.tsx        # Updated for network battles
│   │   ├── LagIndicator.tsx       # Network status UI
│   │   └── SpectatorView.tsx      # Spectator mode
│   └── stores/
│       └── NetworkStore.ts        # Network state management
```

This architecture provides a robust foundation for real-time multiplayer battles while maintaining the current game's responsiveness and adding proper lag compensation for various network conditions.
