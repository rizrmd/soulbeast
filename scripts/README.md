# SoulBeast Battle Simulation Scripts

This directory contains CLI testing scripts to validate the SoulBeast battle system by connecting to the local WebSocket server and simulating real battle scenarios.

## 🎯 Purpose

These scripts help ensure the battle system is working correctly by:
- Testing WebSocket connections and message handling
- Validating matchmaking functionality
- Simulating player actions and battle flow
- Stress testing server performance
- Debugging battle mechanics

## 📋 Prerequisites

1. **Backend server running**: Start the SoulBeast backend server
   ```bash
   cd ../backend
   bun dev
   ```

2. **Install dependencies**: Install script dependencies
   ```bash
   bun install
   ```

## 🚀 Available Scripts

### 1. Quick Battle Test
**File**: `quick-battle-test.ts`  
**Purpose**: Simple single-player PvE battle test

```bash
bun quick-test
# or
bun quick-battle-test.ts
```

**What it does**:
- Connects to WebSocket server
- Joins PvE matchmaking
- Simulates basic battle actions
- Reports battle outcome
- Exits automatically

**Use when**: You want to quickly verify the battle system is working

### 2. Battle Simulation
**File**: `battle-simulation.ts`  
**Purpose**: Advanced multi-player battle simulation

```bash
bun battle-sim
# or
bun battle-simulation.ts
```

**What it does**:
- Connects two simulated players
- One joins PvE, one joins PvP
- Performs random actions during battles
- Runs continuously until stopped
- Detailed logging of all events

**Use when**: You want to test complex battle scenarios and player interactions

### 3. Stress Test
**File**: `stress-test.ts`  
**Purpose**: Server performance and load testing

```bash
bun stress-test
# or
bun stress-test.ts
```

**What it does**:
- Spawns 10 concurrent clients
- Runs for 60 seconds
- Each client continuously battles
- Reports performance metrics
- Tests server stability under load

**Use when**: You want to validate server performance and find bottlenecks

## 📊 Understanding the Output

### Status Icons
- 🔌 Connection events
- ✅ Success events
- ❌ Error events
- 🎮 Matchmaking events
- ⚔️ Battle events
- 🎯 Action events
- 📊 State updates
- 🏁 Battle completion
- 📈 Statistics

### Example Output
```
🚀 Quick Battle Test
📋 Testing basic battle functionality...

🔌 Connecting to WebSocket server...
✅ Connected to server
🎮 Joining PvE battle...
🎮 Joined matchmaking queue
🎯 Match found! Auto-confirming ready...
✅ Confirming ready...
⚔️ Battle started!
📊 Initial state: {...}
⚡ Starting battle actions...
🔥 Casting basic_attack...
📈 Battle state updated
   Alive entities: 3/4
🏁 Battle ended! Result: 🎉 VICTORY
   Winner: test_player
✅ Test completed successfully!
```

## 🔧 Customization

### Modifying Player Cards
Edit the `playerCards` array in any script:
```typescript
const playerCards = [
  {
    cardName: "CustomBeast",
    configuration: {
      name: "My Custom Beast",
      abilities: ["basic_attack", "special_ability"] as const
    }
  }
];
```

### Adjusting Action Frequency
Modify the interval in `startRandomActions()` or `startBattleActions()`:
```typescript
// Faster actions (every 1-2 seconds)
setInterval(() => {
  this.performRandomAction();
}, 1000 + Math.random() * 1000);
```

### Changing Test Duration
For stress test, modify the `TEST_DURATION` constant:
```typescript
const TEST_DURATION = 120000; // 2 minutes
```

## 🐛 Troubleshooting

### Connection Failed
```
❌ WebSocket error: Error: connect ECONNREFUSED ::1:3001
```
**Solution**: Ensure the backend server is running on port 3001

### Battle Not Starting
```
🎮 Joined matchmaking queue
(no further progress)
```
**Solution**: Check backend logs for matchmaking errors

### Actions Rejected
```
❌ Action rejected: Invalid action
```
**Solution**: Verify entity IDs and ability names match server expectations

### Import Errors
```
Error: Cannot resolve "ws"
```
**Solution**: Run `bun install` in the scripts directory

## 📝 Adding New Tests

1. Create a new `.ts` file in the scripts directory
2. Import the WebSocket types:
   ```typescript
   import { WebSocket } from "ws";
   ```
3. Follow the pattern from existing scripts
4. Add a script entry to `package.json`
5. Update this README

## 🔍 Monitoring Server Performance

While running tests, monitor the backend server:

```bash
# In backend directory
bun dev

# Watch for:
# - Connection logs
# - Battle creation/cleanup
# - Error messages
# - Performance warnings
```

## 📈 Performance Metrics

The stress test provides these metrics:
- **Battles/minute**: Rate of battle completion
- **Actions/minute**: Rate of player actions
- **Server Load**: Total events processed per second
- **Connection Stability**: Success rate of WebSocket connections

## 🎯 Best Practices

1. **Start Simple**: Use quick-test first, then move to more complex scenarios
2. **Monitor Logs**: Always watch backend logs while testing
3. **Clean Shutdown**: Use Ctrl+C to properly close connections
4. **Incremental Testing**: Test one feature at a time
5. **Performance Baseline**: Run stress tests regularly to catch regressions

## 🤝 Contributing

When adding new test scenarios:
1. Follow the existing code patterns
2. Add comprehensive logging
3. Handle errors gracefully
4. Update this documentation
5. Test with the backend server