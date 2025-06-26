// Simple API client using fetch since oRPC is not yet implemented
const API_BASE_URL = 'http://localhost:3001/api'

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  inventory = {
    get: async (params: { limit?: number; cursor?: string } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.cursor) searchParams.set('cursor', params.cursor)
      return this.request(`/inventory?${searchParams}`)
    },
    add: async (params: { itemSlug: string; quantity: number }) => {
      return this.request('/inventory', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
    update: async (params: { itemSlug: string; quantity: number }) => {
      return this.request('/inventory', {
        method: 'PUT',
        body: JSON.stringify(params),
      })
    },
  }

  soulbeast = {
    list: async (params: { limit?: number; cursor?: string; activeOnly?: boolean } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.cursor) searchParams.set('cursor', params.cursor)
      if (params.activeOnly) searchParams.set('activeOnly', 'true')
      return this.request(`/soulbeast?${searchParams}`)
    },
    create: async (params: any) => {
      return this.request('/soulbeast', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
    update: async (params: any) => {
      return this.request('/soulbeast', {
        method: 'PUT',
        body: JSON.stringify(params),
      })
    },
    delete: async (params: { id: string }) => {
      return this.request(`/soulbeast/${params.id}`, {
        method: 'DELETE',
      })
    },
    setActive: async (params: { id: string }) => {
      return this.request(`/soulbeast/${params.id}/active`, {
        method: 'POST',
      })
    },
  }

  battle = {
    history: async (params: {
      limit?: number
      cursor?: string
      battleType?: string
      result?: string
    } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.cursor) searchParams.set('cursor', params.cursor)
      if (params.battleType) searchParams.set('battleType', params.battleType)
      if (params.result) searchParams.set('result', params.result)
      return this.request(`/battle/history?${searchParams}`)
    },
    create: async (params: any) => {
      return this.request('/battle', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
    stats: async (params: { battleType?: string; timeRange?: string } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.battleType) searchParams.set('battleType', params.battleType)
      if (params.timeRange) searchParams.set('timeRange', params.timeRange)
      return this.request(`/battle/stats?${searchParams}`)
    },
  }
}

export const api = new ApiClient()

// Type definitions for API responses
export interface InventoryItem {
  id: string
  userId: string
  itemSlug: string
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface SoulBeast {
  id: string
  userId: string
  beastSlug: string
  name?: string
  level: number
  experience: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  speed: number
  element: string
  abilities: Record<string, any>
  equipment?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BattleHistory {
  id: string
  userId: string
  opponentId?: string
  battleType: 'pve' | 'pvp' | 'tournament'
  result: 'win' | 'loss' | 'draw'
  playerTeam: Record<string, any>
  opponentTeam?: Record<string, any>
  duration?: number
  experience: number
  rewards?: Record<string, any>
  createdAt: string
  updatedAt: string
}