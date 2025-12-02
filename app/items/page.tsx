'use client'

import { useCallback, useEffect, useState } from 'react'
import { ItemsList } from '@/components/items/items-list'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { itemsApi } from '@/lib/api-client'
import { ItemDialog } from '@/components/items/item-form'
import { ItemDetail } from '@/models/Item-model'
import { useAuth } from '@/lib/auth-context'

export default function ItemsPage() {
  const { organization, isLoading } = useAuth()
  const [items, setItems] = useState<ItemDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)

  const loadItems = useCallback(async () => {
    if (!organization) return // safety

    try {
      setLoading(true)
      const response = await itemsApi.list(organization.id)
      setItems(response)
    } catch (error) {
      console.error('Failed to load items', error)
    } finally {
      setLoading(false)
    }
  }, [organization])

  useEffect(() => {
    if (isLoading) return
    if (!organization) return

    loadItems()
  }, [organization, isLoading, loadItems])

  return (
    <ProtectedRoute>
      <DashboardLayout title='Items'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div></div>
            <Button onClick={() => setOpenCreate(true)}>New Item</Button>
            <ItemDialog
              mode='create'
              open={openCreate}
              onOpenChange={setOpenCreate}
              onSaved={() => {
                loadItems()
              }}
            />
          </div>
          <ItemsList
            items={items}
            loading={loading}
            reloadItems={loadItems}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
