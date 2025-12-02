'use client'

import { useCallback, useEffect, useState } from 'react'
import { ProductsList } from '@/components/products/products-list'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { productsApi } from '@/lib/api-client'
import { Product } from '@/models/product.model'
import { useAuth } from '@/lib/auth-context'

export default function ProductsPage() {
  const { organization, isLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!organization) return

    setLoading(true)
    try {
      const data = await productsApi.list(organization!.id)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }, [organization])

  useEffect(() => {
    if (isLoading) return
    if (!organization) return

    if (!dialogOpen) {
      loadProducts()
    }
  }, [dialogOpen])

  return (
    <ProtectedRoute>
      <DashboardLayout title='Finished Products'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div></div>
            <Button onClick={() => setDialogOpen(true)}>New Product</Button>
          </div>
          <ProductsList
            products={products}
            loading={loading}
            reloadProducts={loadProducts}
          />
        </div>
      </DashboardLayout>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </ProtectedRoute>
  )
}
