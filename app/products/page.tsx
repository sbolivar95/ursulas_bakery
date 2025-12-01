'use client'

import { useEffect, useState } from 'react'
import { ProductsList } from '@/components/products-list'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProductFormDialog } from '@/components/product-form-dialog'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { productsApi } from '@/lib/api-client'
import { Product } from '@/models/product.model'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productsApi.list()
      setProducts(data)
      console.log(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
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
