import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

// Generic hook for API calls with loading state
export function useApiCall<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (...args: P) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, dependencies)

  return { data, loading, error, execute }
}

// Inventory hooks
export function useInventory() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = useCallback(async (params?: { limit?: number; cursor?: string }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.inventory.get(params || {})
      setInventory(result?.items || [])
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (itemSlug: string, quantity: number = 1) => {
    try {
      await api.inventory.add({ itemSlug, quantity })
      // Optimistic update
      setInventory(prev => {
        const existingIndex = prev.findIndex((item: any) => item.itemSlug === itemSlug)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          }
          return updated
        } else {
          return [...prev, { itemSlug, quantity }]
        }
      })
    } catch (err) {
      // Refresh on error
      await fetchInventory()
      throw err
    }
  }, [fetchInventory])

  const updateItem = useCallback(async (itemSlug: string, quantity: number) => {
    try {
      await api.inventory.update({ itemSlug, quantity })
      // Optimistic update
      setInventory(prev => {
        return prev.filter((item: any) => item.itemSlug !== itemSlug || quantity > 0)
          .map((item: any) => item.itemSlug === itemSlug ? { ...item, quantity } : item)
      })
    } catch (err) {
      // Refresh on error
      await fetchInventory()
      throw err
    }
  }, [fetchInventory])

  useEffect(() => {
    fetchInventory()
  }, [])

  return {
    inventory,
    loading,
    error,
    addItem,
    updateItem,
    refresh: fetchInventory
  }
}

// SoulBeast hooks
export function useSoulBeasts() {
  const [soulbeasts, setSoulbeasts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSoulBeasts = useCallback(async (params?: { limit?: number; cursor?: string; activeOnly?: boolean }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.soulbeast.list(params || {})
      setSoulbeasts(result?.soulbeasts || [])
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SoulBeasts'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createBeast = useCallback(async (beastData: any) => {
    try {
      const result = await api.soulbeast.create(beastData)
      // Optimistic update
      setSoulbeasts(prev => [...prev, result])
      return result
    } catch (err) {
      // Refresh on error
      await fetchSoulBeasts()
      throw err
    }
  }, [fetchSoulBeasts])

  const updateBeast = useCallback(async (id: string, data: any) => {
    try {
      await api.soulbeast.update({ id, ...data })
      // Optimistic update
      setSoulbeasts(prev => prev.map((beast: any) => beast.id === id ? { ...beast, ...data } : beast))
    } catch (err) {
      // Refresh on error
      await fetchSoulBeasts()
      throw err
    }
  }, [fetchSoulBeasts])

  const deleteBeast = useCallback(async (id: string) => {
    try {
      await api.soulbeast.delete({ id })
      // Optimistic update
      setSoulbeasts(prev => prev.filter((beast: any) => beast.id !== id))
    } catch (err) {
      // Refresh on error
      await fetchSoulBeasts()
      throw err
    }
  }, [fetchSoulBeasts])

  const setActiveBeast = useCallback(async (id: string) => {
    try {
      await api.soulbeast.setActive({ id })
      // Optimistic update
      setSoulbeasts(prev => prev.map((beast: any) => ({ ...beast, isActive: beast.id === id })))
    } catch (err) {
      // Refresh on error
      await fetchSoulBeasts()
      throw err
    }
  }, [fetchSoulBeasts])

  useEffect(() => {
    fetchSoulBeasts()
  }, [])

  return {
    soulbeasts,
    loading,
    error,
    createBeast,
    updateBeast,
    deleteBeast,
    setActiveBeast,
    refresh: fetchSoulBeasts
  }
}

// Battle History hooks
export function useBattleHistory() {
  const [battleHistory, setBattleHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBattleHistory = useCallback(async (params?: {
    limit?: number
    cursor?: string
    battleType?: string
    result?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.battle.history(params || {})
      setBattleHistory(result?.battles || [])
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch battle history'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const recordBattle = useCallback(async (battleData: any) => {
    try {
      const result = await api.battle.create(battleData)
      // Optimistic update
      setBattleHistory(prev => [result, ...prev])
      return result
    } catch (err) {
      // Refresh on error
      await fetchBattleHistory()
      throw err
    }
  }, [fetchBattleHistory])

  const getStats = useCallback(async (params?: { battleType?: string; timeRange?: string }) => {
    return await api.battle.stats(params || {})
  }, [])

  useEffect(() => {
    fetchBattleHistory()
  }, [])

  return {
    battleHistory,
    loading,
    error,
    recordBattle,
    getStats,
    refresh: fetchBattleHistory
  }
}

// Battle Stats hooks
export function useBattleStats(
  battleType?: 'pve' | 'pvp' | 'tournament',
  timeRange: 'day' | 'week' | 'month' | 'all' = 'all'
) {
  const { data, loading, error, execute } = useApiCall(
    () => api.battle.stats({ battleType, timeRange }),
    [battleType, timeRange]
  )

  useEffect(() => {
    execute()
  }, [execute])

  return {
    stats: data,
    loading,
    error,
    refreshStats: execute
  }
}

// Combined hook for dashboard data
export function useDashboardData() {
  const inventory = useInventory()
  const soulbeasts = useSoulBeasts()
  const battleStats = useBattleStats()

  const loading = inventory.loading || soulbeasts.loading || battleStats.loading
  const error = inventory.error || soulbeasts.error || battleStats.error

  const refreshAll = useCallback(async () => {
    await Promise.all([
      inventory.refresh(),
      soulbeasts.refresh(),
      battleStats.refreshStats()
    ])
  }, [inventory.refresh, soulbeasts.refresh, battleStats.refreshStats])

  return {
    inventory: inventory.inventory,
    soulbeasts: soulbeasts.soulbeasts,
    stats: battleStats.stats,
    loading,
    error,
    refreshAll,
    // Individual refresh functions
    refreshInventory: inventory.refresh,
    refreshSoulBeasts: soulbeasts.refresh,
    refreshStats: battleStats.refreshStats,
    // Individual action functions
    addItem: inventory.addItem,
    updateItem: inventory.updateItem,
    createBeast: soulbeasts.createBeast,
    updateBeast: soulbeasts.updateBeast,
    deleteBeast: soulbeasts.deleteBeast,
    setActiveBeast: soulbeasts.setActiveBeast
  }
}