# SoulBeast API Setup with oRPC

This document explains the type-safe API setup using oRPC for the SoulBeast card battle game.

## Overview

The SoulBeast API is built with [oRPC](https://github.com/unnoq/orpc), providing:

- 🔗 **End-to-End Type Safety**: Full type safety from client to server
- 📘 **OpenAPI Integration**: Auto-generated API documentation
- 🛡️ **Authentication**: Integrated with Better Auth
- ⚡ **Performance**: Optimized for real-time gaming

## API Structure

### Endpoints

#### Inventory Management
- `inventory.get` - Get player's inventory with pagination
- `inventory.add` - Add items to inventory
- `inventory.update` - Update item quantities

#### SoulBeast Management
- `soulbeast.list` - List player's SoulBeasts
- `soulbeast.create` - Create new SoulBeast
- `soulbeast.update` - Update SoulBeast properties
- `soulbeast.delete` - Remove SoulBeast
- `soulbeast.setActive` - Set active SoulBeast for battle

#### Battle System
- `battle.history` - Get battle history with filters
- `battle.create` - Record new battle result
- `battle.stats` - Get battle statistics

## Backend Setup

### 1. Router Definition

The main router is defined in `/backend/api/router.ts`:

```typescript
import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'

// Authentication middleware
const authMiddleware = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(async ({ context, next }) => {
    const session = await auth.api.getSession({
      headers: new Headers({
        authorization: context.headers.authorization || '',
        cookie: context.headers.cookie || '',
      }),
    })

    if (!session) {
      throw new ORPCError('UNAUTHORIZED', 'Authentication required')
    }

    return next({ context: { user: session.user } })
  })
```

### 2. Server Integration

The oRPC handler is integrated with Hono in `/backend/index.ts`:

```typescript
import { RPCHandler } from '@orpc/server/node'
import { router } from './api/router'

const rpcHandler = new RPCHandler(router)

// oRPC routes
app.all('/api/rpc/*', async (c) => {
  const result = await rpcHandler.handle(c.req.raw, c.res, {
    context: { headers: c.req.header() },
  })

  if (!result.matched) {
    return c.notFound()
  }

  return result.response
})
```

### 3. OpenAPI Documentation

API documentation is auto-generated and available at:
- **JSON Spec**: `http://localhost:3001/api/docs`
- **Swagger UI**: `http://localhost:3001/api/docs/ui`

## Frontend Setup

### 1. Client Configuration

The type-safe client is configured in `/frontend/src/lib/api.ts`:

```typescript
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { AppRouter } from '../../../backend/api/router'

const link = new RPCLink({
  url: 'http://localhost:3001/api/rpc',
  headers: () => ({
    'Content-Type': 'application/json',
    // Auto-include auth cookies
  }),
  credentials: 'include',
})

export const api = createORPCClient<AppRouter>(link)
```

### 2. React Hooks

Custom hooks provide easy API access with loading states:

```typescript
import { useInventory, useSoulBeasts, useBattleHistory } from './lib/hooks/useApi'

function GameDashboard() {
  const { inventory, loading, addItem } = useInventory()
  const { soulbeasts, createBeast } = useSoulBeasts()
  const { battleHistory, recordBattle } = useBattleHistory()

  // All operations are fully type-safe!
}
```

## Usage Examples

### Inventory Operations

```typescript
// Get inventory
const { items } = await api.inventory.get({ limit: 50 })

// Add item
await api.inventory.add({ itemSlug: 'fire-crystal', quantity: 5 })

// Update quantity
await api.inventory.update({ itemSlug: 'fire-crystal', quantity: 10 })

// Remove item
await api.inventory.update({ itemSlug: 'fire-crystal', quantity: 0 })
```

### SoulBeast Management

```typescript
// Create new SoulBeast
const newBeast = await api.soulbeast.create({
  beastSlug: 'fire-dragon',
  name: 'Flameheart',
  health: 100,
  maxHealth: 100,
  attack: 25,
  defense: 15,
  speed: 20,
  element: 'fire',
  abilities: {
    fireball: { level: 1, cooldown: 3 },
    flame_shield: { level: 1, cooldown: 5 }
  }
})

// Set as active
await api.soulbeast.setActive({ id: newBeast.id })

// Update stats
await api.soulbeast.update({
  id: newBeast.id,
  data: { level: 2, attack: 30 }
})
```

### Battle Recording

```typescript
// Record battle result
await api.battle.create({
  battleType: 'pvp',
  result: 'win',
  playerTeam: {
    beast1: { id: 'beast-id', health: 80 },
    // ... team configuration
  },
  opponentTeam: {
    // ... opponent configuration
  },
  duration: 120, // seconds
  experience: 150,
  rewards: {
    items: [{ slug: 'fire-crystal', quantity: 2 }],
    gold: 100
  }
})

// Get battle stats
const stats = await api.battle.stats({
  battleType: 'pvp',
  timeRange: 'week'
})
```

## Error Handling

All API calls include proper error handling:

```typescript
try {
  const result = await api.inventory.add({ itemSlug: 'invalid', quantity: 1 })
} catch (error) {
  if (error instanceof ORPCError) {
    console.error('API Error:', error.message)
    // Handle specific error types
    if (error.code === 'UNAUTHORIZED') {
      // Redirect to login
    }
  }
}
```

## Development Workflow

1. **Define Schema**: Add Zod schemas in `router.ts`
2. **Implement Handler**: Create the procedure handler
3. **Export Type**: Types are automatically inferred
4. **Use in Frontend**: Import and use with full type safety
5. **Test**: Use Swagger UI for manual testing

## Authentication

All API endpoints require authentication via:
- **Cookie**: `better-auth.session_token` (automatic)
- **Bearer Token**: `Authorization: Bearer <token>`

The frontend automatically includes authentication cookies.

## Performance Considerations

- **Pagination**: All list endpoints support cursor-based pagination
- **Caching**: React hooks include optimistic updates
- **Batching**: Multiple operations can be batched for efficiency
- **Real-time**: Consider WebSocket integration for live battles

## Security

- All endpoints require authentication
- User data is isolated by `userId`
- Input validation with Zod schemas
- SQL injection protection via Prisma
- CORS configured for frontend domains

## Deployment

For production deployment:

1. Set environment variables:
   ```bash
   DATABASE_URL=your_production_db
   BETTER_AUTH_URL=https://api.yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

2. Update API URLs in frontend:
   ```typescript
   const link = new RPCLink({
     url: process.env.VITE_API_URL || 'https://api.yourdomain.com/api/rpc'
   })
   ```

3. Generate and push database schema:
   ```bash
   bun run db:generate
   bun run db:push
   ```

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure backend types are properly exported
2. **Auth Errors**: Check cookie/token configuration
3. **CORS Issues**: Verify allowed origins in backend
4. **Database Errors**: Run `bun run db:generate` after schema changes

### Debug Mode

Enable debug logging:

```typescript
// In development
const link = new RPCLink({
  url: 'http://localhost:3001/api/rpc',
  onRequest: (req) => console.log('Request:', req),
  onResponse: (res) => console.log('Response:', res),
})
```

## Next Steps

- [ ] Add WebSocket support for real-time battles
- [ ] Implement rate limiting
- [ ] Add request/response caching
- [ ] Create API client SDK for mobile apps
- [ ] Add GraphQL compatibility layer