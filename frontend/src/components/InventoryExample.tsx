import React, { useState } from 'react'
import { useInventory } from '../hooks/useInventory'

export function InventoryExample() {
  const { data, loading, error, addItem, updateItem, refetch } = useInventory({
    limit: 20,
    autoFetch: true,
  })
  
  const [newItemSlug, setNewItemSlug] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemSlug.trim()) return
    
    try {
      setIsAdding(true)
      await addItem(newItemSlug, newItemQuantity)
      setNewItemSlug('')
      setNewItemQuantity(1)
    } catch (err) {
      // Error is already handled by the hook
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateItem = async (itemSlug: string, newQuantity: number) => {
    try {
      await updateItem(itemSlug, newQuantity)
    } catch (err) {
      // Error is already handled by the hook
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Add new item form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Add New Item</h2>
        <form onSubmit={handleAddItem} className="flex gap-3">
          <input
            type="text"
            placeholder="Item slug (e.g., 'health-potion')"
            value={newItemSlug}
            onChange={(e) => setNewItemSlug(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isAdding || !newItemSlug.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      {/* Inventory items list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Current Inventory</h2>
        {data?.items && data.items.length > 0 ? (
          <div className="grid gap-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.itemSlug}</h3>
                  <p className="text-sm text-gray-500">
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{item.quantity}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateItem(item.itemSlug, item.quantity + 1)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateItem(item.itemSlug, Math.max(0, item.quantity - 1))}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      disabled={item.quantity <= 0}
                    >
                      -1
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No items in inventory. Add some items to get started!
          </div>
        )}
      </div>

      {/* Pagination info */}
      {data?.nextCursor && (
        <div className="mt-6 text-center">
          <button
            onClick={() => refetch({ cursor: data.nextCursor! })}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}