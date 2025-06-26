import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { AppRouter } from '../../../backend/api/router'

// Create the RPC link with configuration
const link = new RPCLink({
  url: 'http://localhost:3001/api/rpc',
  headers: () => ({
    'Content-Type': 'application/json',
    // You can add authentication token here if available
    // Authorization: `Bearer ${getAuthToken()}`,
  }),
})

// Create the oRPC client with type safety
const orpcClient: RouterClient<AppRouter> = createORPCClient(link)

// Export the client for use in components
export const orpc = orpcClient

// Export the client directly for use
export const orpcApi = orpcClient

// Example usage functions
export const inventoryService = {
  async getInventory(params?: { limit?: number; cursor?: string }) {
    try {
      const result = await orpcApi.inventory.get(params || {})
      return result
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      throw error
    }
  },

  async addItem(itemSlug: string, quantity: number = 1) {
    try {
      const result = await orpcApi.inventory.add({ itemSlug, quantity })
      return result
    } catch (error) {
      console.error('Failed to add inventory item:', error)
      throw error
    }
  },

  async updateItem(itemSlug: string, quantity: number) {
    try {
      const result = await orpcApi.inventory.update({ itemSlug, quantity })
      return result
    } catch (error) {
      console.error('Failed to update inventory item:', error)
      throw error
    }
  },
}

export const soulbeastService = {
  async listSoulBeasts(params?: { limit?: number; cursor?: string; activeOnly?: boolean }) {
    try {
      const result = await orpcApi.soulbeast.list(params || {})
      return result
    } catch (error) {
      console.error('Failed to fetch soulbeasts:', error)
      throw error
    }
  },

  async createSoulBeast(data: any) {
    try {
      const result = await orpcApi.soulbeast.create(data)
      return result
    } catch (error) {
      console.error('Failed to create soulbeast:', error)
      throw error
    }
  },

  async updateSoulBeast(data: any) {
    try {
      const result = await orpcApi.soulbeast.update(data)
      return result
    } catch (error) {
      console.error('Failed to update soulbeast:', error)
      throw error
    }
  },

  async deleteSoulBeast(id: string) {
    try {
      const result = await orpcApi.soulbeast.delete({ id })
      return result
    } catch (error) {
      console.error('Failed to delete soulbeast:', error)
      throw error
    }
  },

  async setActiveSoulBeast(id: string) {
    try {
      const result = await orpcApi.soulbeast.setActive({ id })
      return result
    } catch (error) {
      console.error('Failed to set active soulbeast:', error)
      throw error
    }
  },
}

export const battleService = {
  async getBattleHistory(params?: {
    limit?: number
    cursor?: string
    battleType?: 'pve' | 'pvp' | 'tournament'
    result?: 'win' | 'loss' | 'draw'
  }) {
    try {
      const result = await orpcApi.battle.history(params || {})
      return result
    } catch (error) {
      console.error('Failed to fetch battle history:', error)
      throw error
    }
  },

  async createBattleRecord(data: any) {
    try {
      const result = await orpcApi.battle.create(data)
      return result
    } catch (error) {
      console.error('Failed to create battle record:', error)
      throw error
    }
  },

  async getBattleStats(params?: { 
    battleType?: 'pve' | 'pvp' | 'tournament'
    timeRange?: 'all' | 'month' | 'week' | 'day'
  }) {
    try {
      const result = await orpcApi.battle.stats(params || {})
      return result
    } catch (error) {
      console.error('Failed to fetch battle stats:', error)
      throw error
    }
  },
}