# SoulBeast Battle System

A complete real-time battle system for SoulBeast that integrates with the backend WebSocket server.

## Architecture Overview

The battle system consists of several key components:

### Core Components

- **BattleApp**: Main orchestrator component that manages the entire battle flow
- **CardSelectionScreen**: Allows players to select and configure their SoulBeast cards
- **MatchmakingScreen**: Handles PvP/PvE matchmaking with ready confirmation
- **BattleScreen**: Real-time battle interface with entity management and ability usage

### State Management

- **BattleStore**: Valtio-based store for battle-specific state (separate from GameStore)
- **NetworkManager**: WebSocket connection and message handling
- **NetworkStore**: Network connection and matchmaking state

## Usage

### Basic Integration

```tsx
import { BattleApp } from './battle';

function App() {
  return (
    <BattleApp 
      onExit={() => {
        // Handle exit from battle system
        console.log('Exiting battle system');
      }}
    />
  );
}
```

### Using Individual Components

```tsx
import { 
  CardSelectionScreen, 
  MatchmakingScreen, 
  BattleScreen,
  battleStore,
  networkManager 
} from './battle';

// Card Selection
<CardSelectionScreen 
  onSelectionComplete={() => {
    // Move to next step
  }}
/>

// Matchmaking
<MatchmakingScreen 
  onBattleStart={() => {
    // Battle is starting
  }}
/>

// Battle
<BattleScreen 
  onBattleEnd={() => {
    // Battle ended
  }}
/>
```

### State Management

```tsx
import { useSnapshot } from 'valtio';
import { battleStore, battleActions } from './battle';

function BattleComponent() {
  const battleSnap = useSnapshot(battleStore);
  
  // Access battle state
  const entities = battleSnap.battleState?.entities || [];
  const isInBattle = battleSnap.isInBattle;
  
  // Perform actions
  const handleEntitySelect = (entityId: string) => {
    battleActions.selectEntity(entityId);
  };
  
  return (
    <div>
      {entities.map(entity => (
        <div key={entity.id} onClick={() => handleEntitySelect(entity.id)}>
          {entity.name}: {entity.health}/{entity.maxHealth}
        </div>
      ))}
    </div>
  );
}
```

### Network Integration

```tsx
import { networkManager, networkStore } from './battle';
import { useSnapshot } from 'valtio';

function NetworkComponent() {
  const networkSnap = useSnapshot(networkStore);
  
  useEffect(() => {
    // Connect to WebSocket
    networkManager.connect();
    
    return () => {
      networkManager.disconnect();
    };
  }, []);
  
  // Send player action
  const sendAction = () => {
    networkManager.sendPlayerAction({
      type: 'ABILITY_USE',
      entityId: 'entity-1',
      abilityName: 'Fireball',
      targetId: 'entity-2'
    });
  };
  
  return (
    <div>
      Status: {networkSnap.network.isConnected ? 'Connected' : 'Disconnected'}
      Latency: {networkSnap.network.latency}ms
    </div>
  );
}
```

## Battle Flow

1. **Card Selection**: Player selects up to 3 SoulBeast cards and configures their abilities
2. **Matchmaking**: Player chooses PvP or PvE mode and enters matchmaking queue
3. **Ready Confirmation**: When match is found, both players have 10 seconds to confirm readiness
4. **Battle**: Real-time battle with turn-based ability usage
5. **Results**: Battle ends with winner announcement

## WebSocket Messages

The system handles various WebSocket message types:

### Matchmaking
- `JOIN_MATCHMAKING`: Enter matchmaking queue
- `LEAVE_MATCHMAKING`: Leave matchmaking queue
- `MATCH_FOUND`: Match found, ready confirmation required
- `READY_CONFIRM`: Confirm readiness for battle

### Battle
- `BATTLE_STARTED`: Battle begins with initial state
- `BATTLE_STATE_UPDATE`: Real-time battle state updates
- `PLAYER_ACTION`: Send player actions (ability usage)
- `BATTLE_ENDED`: Battle conclusion with results

### System
- `PING`/`PONG`: Connection health monitoring
- `ERROR`: Error messages from server
- `ACTION_RESULT`: Confirmation of action success/failure

## Features

### Real-time Battle
- Live battle state synchronization
- Turn-based ability system
- Health and status effect tracking
- Visual feedback for actions

### Matchmaking
- PvP and PvE support
- Ready confirmation system
- Queue management
- Match cancellation

### UI/UX
- Smooth transitions with Tailwind
- Responsive design
- Real-time notifications
- Connection status indicators
- Latency monitoring

### State Management
- Valtio for reactive state
- Separation of concerns (battle vs network state)
- Automatic cleanup and reconnection
- Event-driven architecture

## Configuration

The system automatically connects to the WebSocket server based on the current environment:

- **Development**: `ws://localhost:3001`
- **Production**: Uses current hostname with appropriate protocol

## Error Handling

- Automatic reconnection on connection loss
- Graceful degradation when server is unavailable
- User-allyly error messages
- Action timeout handling

## Performance

- Efficient state updates with Valtio
- Minimal re-renders with useSnapshot
- Optimized WebSocket message handling
- Lazy loading of battle components