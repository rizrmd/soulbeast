import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'
import { PrismaClient } from '../generated/prisma'
import { auth } from '../auth'
import type { IncomingHttpHeaders } from 'node:http'

const prisma = new PrismaClient()

// Zod schemas for validation
const InventorySchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  itemSlug: z.string().min(1),
  quantity: z.number().int().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const SoulBeastSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  beastSlug: z.string().min(1),
  name: z.string().optional(),
  level: z.number().int().min(1).default(1),
  experience: z.number().int().min(0).default(0),
  health: z.number().int().min(1),
  maxHealth: z.number().int().min(1),
  attack: z.number().int().min(1),
  defense: z.number().int().min(1),
  speed: z.number().int().min(1),
  element: z.string().min(1),
  abilities: z.record(z.any()),
  equipment: z.record(z.any()).optional(),
  isActive: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const BattleHistorySchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  opponentId: z.string().optional(),
  battleType: z.enum(['pve', 'pvp', 'tournament']),
  result: z.enum(['win', 'loss', 'draw']),
  playerTeam: z.record(z.any()),
  opponentTeam: z.record(z.any()).optional(),
  duration: z.number().int().min(0).optional(),
  experience: z.number().int().min(0).default(0),
  rewards: z.record(z.any()).optional(),
  createdAt: z.date(),
})

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
      throw new ORPCError('UNAUTHORIZED')
    }

    return next({ context: { user: session.user } })
  })

// Inventory procedures
const getInventory = authMiddleware
  .input(z.object({
    limit: z.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().optional(),
  }))
  .handler(async ({ input, context }) => {
    const items = await prisma.inventory.findMany({
      where: { userId: context.user.id },
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return {
      items,
      nextCursor: items.length === input.limit ? items[items.length - 1]?.id : null,
    }
  })

const addInventoryItem = authMiddleware
  .input(z.object({
    itemSlug: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
  }))
  .handler(async ({ input, context }) => {
    const existingItem = await prisma.inventory.findUnique({
      where: {
        userId_itemSlug: {
          userId: context.user.id,
          itemSlug: input.itemSlug,
        },
      },
    })

    if (existingItem) {
      return await prisma.inventory.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + input.quantity },
      })
    }

    return await prisma.inventory.create({
      data: {
        userId: context.user.id,
        itemSlug: input.itemSlug,
        quantity: input.quantity,
      },
    })
  })

const updateInventoryItem = authMiddleware
  .input(z.object({
    itemSlug: z.string().min(1),
    quantity: z.number().int().min(0),
  }))
  .handler(async ({ input, context }) => {
    if (input.quantity === 0) {
      await prisma.inventory.delete({
        where: {
          userId_itemSlug: {
            userId: context.user.id,
            itemSlug: input.itemSlug,
          },
        },
      })
      return { deleted: true }
    }

    return await prisma.inventory.update({
      where: {
        userId_itemSlug: {
          userId: context.user.id,
          itemSlug: input.itemSlug,
        },
      },
      data: { quantity: input.quantity },
    })
  })

// SoulBeast procedures
const getSoulBeasts = authMiddleware
  .input(z.object({
    limit: z.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().optional(),
    activeOnly: z.boolean().optional().default(false),
  }))
  .handler(async ({ input, context }) => {
    const beasts = await prisma.soulBeast.findMany({
      where: {
        userId: context.user.id,
        ...(input.activeOnly && { isActive: true }),
      },
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return {
      beasts,
      nextCursor: beasts.length === input.limit ? beasts[beasts.length - 1]?.id : null,
    }
  })

const createSoulBeast = authMiddleware
  .input(SoulBeastSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true }))
  .handler(async ({ input, context }) => {
    return await prisma.soulBeast.create({
      data: {
        ...input,
        userId: context.user.id,
      },
    })
  })

const updateSoulBeast = authMiddleware
  .input(z.object({
    id: z.string().cuid(),
    data: SoulBeastSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true }).partial(),
  }))
  .handler(async ({ input, context }) => {
    // Verify ownership
    const beast = await prisma.soulBeast.findFirst({
      where: { id: input.id, userId: context.user.id },
    })

    if (!beast) {
      throw new ORPCError('NOT_FOUND')
    }

    return await prisma.soulBeast.update({
      where: { id: input.id },
      data: input.data,
    })
  })

const deleteSoulBeast = authMiddleware
  .input(z.object({ id: z.string().cuid() }))
  .handler(async ({ input, context }) => {
    const beast = await prisma.soulBeast.findFirst({
      where: { id: input.id, userId: context.user.id },
    })

    if (!beast) {
      throw new ORPCError('NOT_FOUND')
    }

    await prisma.soulBeast.delete({ where: { id: input.id } })
    return { deleted: true }
  })

const setActiveSoulBeast = authMiddleware
  .input(z.object({ id: z.string().cuid() }))
  .handler(async ({ input, context }) => {
    // Deactivate all current active beasts
    await prisma.soulBeast.updateMany({
      where: { userId: context.user.id, isActive: true },
      data: { isActive: false },
    })

    // Activate the selected beast
    return await prisma.soulBeast.update({
      where: { id: input.id },
      data: { isActive: true },
    })
  })

// Battle History procedures
const getBattleHistory = authMiddleware
  .input(z.object({
    limit: z.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().optional(),
    battleType: z.enum(['pve', 'pvp', 'tournament']).optional(),
  }))
  .handler(async ({ input, context }) => {
    const battles = await prisma.battleHistory.findMany({
      where: {
        userId: context.user.id,
        ...(input.battleType && { battleType: input.battleType }),
      },
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return {
      battles,
      nextCursor: battles.length === input.limit ? battles[battles.length - 1]?.id : null,
    }
  })

const createBattleRecord = authMiddleware
  .input(BattleHistorySchema.omit({ id: true, userId: true, createdAt: true }))
  .handler(async ({ input, context }) => {
    return await prisma.battleHistory.create({
      data: {
        ...input,
        userId: context.user.id,
      },
    })
  })

const getBattleStats = authMiddleware
  .input(z.object({
    battleType: z.enum(['pve', 'pvp', 'tournament']).optional(),
    timeRange: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
  }))
  .handler(async ({ input, context }) => {
    const where: any = { userId: context.user.id }
    
    if (input.battleType) {
      where.battleType = input.battleType
    }

    if (input.timeRange !== 'all') {
      const now = new Date()
      const timeRanges = {
        day: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      }
      where.createdAt = { gte: timeRanges[input.timeRange] }
    }

    const [total, wins, losses, draws] = await Promise.all([
      prisma.battleHistory.count({ where }),
      prisma.battleHistory.count({ where: { ...where, result: 'win' } }),
      prisma.battleHistory.count({ where: { ...where, result: 'loss' } }),
      prisma.battleHistory.count({ where: { ...where, result: 'draw' } }),
    ])

    const winRate = total > 0 ? (wins / total) * 100 : 0

    return {
      total,
      wins,
      losses,
      draws,
      winRate: Math.round(winRate * 100) / 100,
    }
  })

// Export the router
export const router = {
  inventory: {
    get: getInventory,
    add: addInventoryItem,
    update: updateInventoryItem,
  },
  soulbeast: {
    list: getSoulBeasts,
    create: createSoulBeast,
    update: updateSoulBeast,
    delete: deleteSoulBeast,
    setActive: setActiveSoulBeast,
  },
  battle: {
    history: getBattleHistory,
    create: createBattleRecord,
    stats: getBattleStats,
  },
}

export type AppRouter = typeof router