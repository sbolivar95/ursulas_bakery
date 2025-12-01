'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ItemsList } from '@/components/items-list'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { itemsApi } from '@/lib/api-client'
import { ItemDialog } from '@/components/item-form'
import { ItemDetail } from '@/models/Item-model'

export default function ItemsPage() {
  const [items, setItems] = useState<ItemDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await itemsApi.list()
      setItems(response)
    } catch (error) {
      console.error('Failed to load items', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

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
