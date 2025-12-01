'use client'

import { Card } from '@/components/ui/card'
import { Package, Pencil } from 'lucide-react'
import { Product } from '@/models/product.model'
import { useState } from 'react'
import { ProductFormDialog } from './product-form-dialog'
import { ConfirmDeleteDialog } from './dialog/ConfirmDeleteDialog'
import { productsApi } from '@/lib/api-client'
import Link from 'next/link'

interface ProductsListProps {
  products: Product[]
  loading: boolean
  reloadProducts: () => Promise<void>
}

// Simple currency formatter – change currency/locale if needed
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function ProductsList({
  products,
  loading,
  reloadProducts,
}: ProductsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [productId, setProductId] = useState('')

  async function loadOneProduct(id: string) {
    try {
      let result = await productsApi.get(id)
      console.log(result)
    } catch (err) {}
  }

  async function handleDelete(id: string) {
    try {
      await productsApi.delete(id)
      await reloadProducts()
    } catch (err) {
      console.error('Error deleting item:', err)
    } finally {
    }
  }

  if (loading) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        Loading products...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <Package
          className='mx-auto mb-4 text-muted-foreground'
          size={40}
        />
        <p className='text-muted-foreground'>
          No products yet. Create one to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {products.map((product) => (
          <Card
            key={product.id}
            className='p-4 hover:shadow-lg transition-shadow flex flex-col h-full'
          >
            {/* Product Header */}
            <div
              className='flex-1'
              onClick={() => loadOneProduct(product.id)}
            >
              <h3 className='font-semibold text-lg mb-2 line-clamp-2'>
                {product.name}
              </h3>
              {product.description && (
                <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
                  {product.description}
                </p>
              )}
            </div>
            {/* Product Details */}
            <div className='space-y-3 mb-4 text-sm'>
              {/* Total cost */}
              {
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Total cost
                  </span>
                  <span className='font-semibold'>
                    {currencyFormatter.format(
                      Number(product.total_finished_product_cost)
                    )}
                  </span>
                </div>
              }
              {/* Recipes */}
              {product.recipes && product.recipes.length > 0 && (
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Recipes ({product.recipes.length})
                  </p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {product.recipes.slice(0, 2).map((recipe) => (
                      <span
                        key={recipe.recipe_id}
                        className='inline-block bg-secondary px-2 py-1 rounded text-xs'
                      >
                        {recipe.name}
                      </span>
                    ))}
                    {product.recipes.length > 2 && (
                      <span className='inline-block text-xs text-muted-foreground'>
                        +{product.recipes.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Items */}
              {product.items && product.items.length > 0 && (
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Items ({product.items.length})
                  </p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {product.items.slice(0, 2).map((item) => (
                      <span
                        key={item.item_id}
                        className='inline-block bg-secondary px-2 py-1 rounded text-xs'
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Actions */}
            <div className='flex gap-2 pt-3 border-t border-border justify-between'>
              <Link
                href={`/products/${product.id}`}
                className='flex-1 flex'
              >
                <button className='flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity text-center cursor-pointer'>
                  View Details
                </button>
              </Link>
              <div className='flex align-middle gap-1'>
                <button
                  onClick={() => {
                    setDialogOpen(true)
                    setProductId(product.id)
                  }}
                >
                  <Pencil
                    size={16}
                    className='cursor-pointer'
                  />
                </button>
                <ConfirmDeleteDialog
                  itemId={product.id!}
                  onConfirm={handleDelete}
                  type='product'
                />
              </div>
            </div>
            <ProductFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              productId={productId}
            />
          </Card>
        ))}
      </div>
    </>
  )
}
