'use client'

import { Card } from '@/components/ui/card'
import { Edit } from 'lucide-react'
import { itemsApi } from '@/lib/api-client'
import { ConfirmDeleteDialog } from '../dialog/ConfirmDeleteDialog'
import { ItemDialog } from './item-form'
import { useState } from 'react'
import { ItemDetail } from '@/models/Item-model'
import { useAuth } from '@/lib/auth-context'

interface ItemsListProps {
  items: ItemDetail[]
  loading: boolean
  reloadItems: () => Promise<void>
}

export function ItemsList({ items, loading, reloadItems }: ItemsListProps) {
  const { organization } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    try {
      await itemsApi.delete(organization!.id, id)
      await reloadItems()
    } catch (err) {
      console.error('Error deleting item:', err)
    } finally {
    }
  }

  if (loading) {
    return <div className='text-center py-12'>Loading items...</div>
  }

  return (
    <Card className='p-6'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border'>
              <th className='text-left py-3 px-4 font-medium'>Name</th>
              <th className='text-left py-3 px-4 font-medium'>SKU</th>
              <th className='text-left py-3 px-4 font-medium'>$ Unit</th>
              <th className='text-left py-3 px-4 font-medium'>Cost</th>
              <th className='text-left py-3 px-4 font-medium'>$ Per Unit</th>
              <th className='text-left py-3 px-4 font-medium'>Category</th>
              <th className='text-left py-3 px-4 font-medium'>Status</th>
              <th className='text-right py-3 px-4 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className='border-b border-border hover:bg-muted/30'
              >
                <td className='py-4 px-4 font-medium'>{item.name}</td>
                <td className='py-4 px-4 text-muted-foreground'>{item.sku}</td>
                <td className='py-4 px-4'>{item.purchase_unit}</td>
                <td className='py-4 px-4'>
                  ${Number(item.purchase_cost).toFixed(2)}
                </td>
                <td className='py-4 px-4'>
                  ${Number(item.cost_per_base_unit).toFixed(2)} {item.base_unit}
                </td>
                <td className='py-4 px-4'>
                  {item.category_name ? item.category_name : 'No Category'}
                </td>
                <td className='py-4 px-4'>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className='py-4 px-4 text-right space-x-2 flex justify-end'>
                  <Edit
                    size={16}
                    onClick={() => {
                      setEditingItemId(item.id)
                      setEditOpen(true)
                    }}
                  />

                  <ConfirmDeleteDialog
                    itemId={item.id!}
                    onConfirm={handleDelete}
                    type='item'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ItemDialog
          mode='edit'
          itemId={editingItemId || undefined}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) setEditingItemId(null)
          }}
          onSaved={() => {
            reloadItems()
          }}
        />
      </div>
    </Card>
  )
}
