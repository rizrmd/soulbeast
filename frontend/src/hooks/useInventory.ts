import { useState, useEffect } from 'react'
import { inventoryService } from '../lib/orpc-client'

interface UseInventoryOptions {
  limit?: number
  cursor?: string
  autoFetch?: boolean
}

interface InventoryItem {
  id: string
  userId: string
  itemSlug: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

interface InventoryResponse {
  items: InventoryItem[]
  nextCursor: string | null
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { limit = 10, cursor, autoFetch = true } = options
  
  const [data, setData] = useState<InventoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async (params?: { limit?: number; cursor?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await inventoryService.getInventory(params || { limit, cursor })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (itemSlug: string, quantity: number = 1) => {
    try {
      setError(null)
      await inventoryService.addItem(itemSlug, quantity)
      // Refresh the inventory after adding
      await fetchInventory({ limit, cursor })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
      throw err
    }
  }

  const updateItem = async (itemSlug: string, quantity: number) => {
    try {
      setError(null)
      await inventoryService.updateItem(itemSlug, quantity)
      // Refresh the inventory after updating
      await fetchInventory({ limit, cursor })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      throw err
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchInventory({ limit, cursor })
    }
  }, [limit, cursor, autoFetch])

  return {
    data,
    loading,
    error,
    refetch: fetchInventory,
    addItem,
    updateItem,
  }
}