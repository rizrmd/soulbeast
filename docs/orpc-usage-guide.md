# oRPC Frontend Usage Guide

This guide explains how to use the oRPC client in the SoulBeast frontend application.

## Overview

The oRPC client provides type-safe RPC calls to the backend API. It's built on top of the `@orpc/client` package and provides full TypeScript support with automatic type inference from the backend router.

## Setup

The oRPC client is already configured in `/src/lib/orpc-client.ts`. It includes:

- Type-safe client creation
- Automatic request/response handling
- Error handling
- Authentication header support (ready for implementation)

## Basic Usage

### 1. Direct Client Usage

```typescript
import { orpcApi } from '../lib/orpc-client'

// Get inventory with type safety
const inventory = await orpcApi.inventory.get({ limit: 10 })

// Add an item
const newItem = await orpcApi.inventory.add({
  itemSlug: 'health-potion',
  quantity: 5
})

// Create a soulbeast
const soulbeast = await orpcApi.soulbeast.create({
  beastSlug: 'fire-dragon',
  name: 'Flameheart'
})
```

### 2. Using Service Functions

```typescript
import { inventoryService, soulbeastService, battleService } from '../lib/orpc-client'

// Inventory operations
const inventory = await inventoryService.getInventory({ limit: 20 })
await inventoryService.addItem('magic-sword', 1)
await inventoryService.updateItem('health-potion', 10)

// SoulBeast operations
const soulbeasts = await soulbeastService.listSoulBeasts({ activeOnly: true })
const newBeast = await soulbeastService.createSoulBeast(beastData)
await soulbeastService.setActiveSoulBeast('beast-id')

// Battle operations
const battleHistory = await battleService.getBattleHistory({ limit: 10 })
const battleStats = await battleService.getBattleStats({ battleType: 'pvp' })
```

### 3. Using React Hooks

```typescript
import { useInventory } from '../hooks/useInventory'

function InventoryComponent() {
  const { data, loading, error, addItem, updateItem, refetch } = useInventory({
    limit: 20,
    autoFetch: true
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data?.items.map(item => (
        <div key={item.id}>
          {item.itemSlug}: {item.quantity}
          <button onClick={() => addItem(item.itemSlug, 1)}>+1</button>
        </div>
      ))}
    </div>
  )
}
```

## Available APIs

### Inventory API

```typescript
// Get inventory with pagination
orpcApi.inventory.get({
  limit?: number,
  cursor?: string
})

// Add inventory item
orpcApi.inventory.add({
  itemSlug: string,
  quantity: number
})

// Update inventory item
orpcApi.inventory.update({
  itemSlug: string,
  quantity: number
})
```

### SoulBeast API

```typescript
// List soulbeasts
orpcApi.soulbeast.list({
  limit?: number,
  cursor?: string,
  activeOnly?: boolean
})

// Create soulbeast
orpcApi.soulbeast.create(data)

// Update soulbeast
orpcApi.soulbeast.update(data)

// Delete soulbeast
orpcApi.soulbeast.delete({ id: string })

// Set active soulbeast
orpcApi.soulbeast.setActive({ id: string })
```

### Battle API

```typescript
// Get battle history
orpcApi.battle.history({
  limit?: number,
  cursor?: string,
  battleType?: string,
  result?: string
})

// Create battle record
orpcApi.battle.create(data)

// Get battle stats
orpcApi.battle.stats({
  battleType?: string,
  timeRange?: string
})
```

## Error Handling

### Automatic Error Handling

The service functions include automatic error handling:

```typescript
try {
  const result = await inventoryService.addItem('sword', 1)
  // Success
} catch (error) {
  // Error is automatically logged
  console.error('Operation failed:', error.message)
}
```

### Custom Error Handling

```typescript
try {
  const result = await orpcApi.inventory.get({ limit: 10 })
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors
  } else {
    // Generic error handling
  }
}
```

## Authentication

To add authentication, modify the fetch function in `orpc-client.ts`:

```typescript
const orpcClient = createORPCClient<AppRouter>({
  baseURL: 'http://localhost:3001/api/rpc',
  fetch: (input, init) => {
    const headers = {
      'Content-Type': 'application/json',
      ...init?.headers,
    }

    // Add authentication token
    const token = localStorage.getItem('authToken') // or from your auth store
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(input, {
      ...init,
      headers,
    })
  },
})
```

## Type Safety

The oRPC client provides full type safety:

```typescript
// TypeScript will infer the correct types
const inventory = await orpcApi.inventory.get({ limit: 10 })
// inventory.items is typed as InventoryItem[]
// inventory.nextCursor is typed as string | null

// TypeScript will catch errors
await orpcApi.inventory.add({
  itemSlug: 'sword',
  // quantity: 'invalid' // ❌ TypeScript error
  quantity: 1 // ✅ Correct
})
```

## Migration from REST API

To migrate from the existing REST API client:

1. Replace imports:
   ```typescript
   // Old
   import { api } from '../lib/api'
   
   // New
   import { orpcApi } from '../lib/orpc-client'
   ```

2. Update method calls:
   ```typescript
   // Old
   const inventory = await api.inventory.get({ limit: 10 })
   
   // New
   const inventory = await orpcApi.inventory.get({ limit: 10 })
   ```

3. The API surface is identical, so most code will work without changes!

## Best Practices

1. **Use service functions** for complex operations with error handling
2. **Use React hooks** for component state management
3. **Handle loading states** appropriately in your UI
4. **Implement proper error boundaries** for error handling
5. **Use TypeScript** to catch errors at compile time
6. **Cache responses** when appropriate to reduce server load

## Example Components

See `/src/components/InventoryExample.tsx` for a complete example of using the oRPC client in a React component.