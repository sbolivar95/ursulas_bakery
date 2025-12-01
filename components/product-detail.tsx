'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { productsApi } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { ProductDetailResponse } from '@/models/product.model'

interface ProductDetailProps {
  productId: string
}

// money helper
const money = (value: number | null | undefined) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(value)
    : '-'

export function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!productId) return
      setLoading(true)
      setError(null)
      try {
        const data = await productsApi.get(productId)
        setProduct(data)
      } catch (err) {
        console.error('Failed to load product detail:', err)
        setError('Failed to load product details.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [productId])

  if (loading) {
    return (
      <div className='py-12 text-center text-muted-foreground'>
        Loading product details…
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-destructive mb-4'>{error}</p>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      {/* Header + summary */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>{product.name}</h1>
          {product.description && (
            <p className='text-sm text-muted-foreground mt-1'>
              {product.description}
            </p>
          )}
          <p className='text-xs text-muted-foreground mt-2'>
            {product.created_by && <>Created by {product.created_by}</>}
            {product.updated_by && <> • Updated by {product.updated_by}</>}
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      <Card className='p-4 md:p-5'>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='rounded-lg border border-border p-3'>
            <p className='text-xs text-muted-foreground uppercase tracking-wide'>
              Total cost
            </p>
            <p className='text-xl font-semibold'>
              {money(Number(product.total_finished_product_cost))}
            </p>
          </div>
          <div className='rounded-lg border border-border p-3'>
            <p className='text-xs text-muted-foreground uppercase tracking-wide'>
              From recipes
            </p>
            <p className='text-base font-medium'>
              {money(Number(product.total_recipes_cost))}
            </p>
          </div>
          <div className='rounded-lg border border-border p-3'>
            <p className='text-xs text-muted-foreground uppercase tracking-wide'>
              From direct items
            </p>
            <p className='text-base font-medium'>
              {money(Number(product.total_direct_items_cost))}
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Recipes breakdown */}
      <Card className='p-4 md:p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Recipes</h2>
          <p className='text-xs text-muted-foreground'>
            {product.recipes.length} recipe
            {product.recipes.length === 1 ? '' : 's'} used
          </p>
        </div>

        {product.recipes.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No recipes are linked to this product.
          </p>
        ) : (
          <div className='space-y-5'>
            {product.recipes.map((recipe) => (
              <div
                key={recipe.recipe_id}
                className='rounded-lg border border-border p-3 md:p-4 space-y-3'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div>
                    <p className='font-medium'>{recipe.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Uses {recipe.qty_g_in_product} g · Recipe yield:{' '}
                      {recipe.yield_qty_g} g
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-2 text-xs'>
                    <Badge variant='outline'>
                      Total recipe cost:{' '}
                      <span className='ml-1 font-semibold'>
                        {money(recipe.total_recipe_cost)}
                      </span>
                    </Badge>
                    <Badge variant='outline'>
                      Cost per g:{' '}
                      <span className='ml-1 font-semibold'>
                        {money(recipe.recipe_cost_per_g)}
                      </span>
                    </Badge>
                    <Badge>
                      Cost in product:{' '}
                      <span className='ml-1 font-semibold'>
                        {money(recipe.cost_for_recipe_in_product)}
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full text-xs md:text-sm'>
                    <thead>
                      <tr className='border-b border-border text-muted-foreground'>
                        <th className='text-left py-2 pr-2 font-medium'>
                          Item
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Qty in recipe (g)
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Cost / unit
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Cost in full recipe
                        </th>
                        <th className='text-right py-2 pl-2 font-medium'>
                          Cost in this product
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.items.map((item) => (
                        <tr
                          key={item.item_id}
                          className='border-b border-border/60 last:border-0'
                        >
                          <td className='py-2 pr-2'>{item.item_name}</td>
                          <td className='py-2 px-2 text-right'>
                            {item.qty_g_in_recipe}
                          </td>
                          <td className='py-2 px-2 text-right'>
                            {money(item.cost_per_base_unit)}
                          </td>
                          <td className='py-2 px-2 text-right'>
                            {money(item.cost_in_full_recipe)}
                          </td>
                          <td className='py-2 pl-2 text-right font-medium'>
                            {money(item.cost_in_product)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Direct items breakdown */}
      <Card className='p-4 md:p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Direct items</h2>
          <p className='text-xs text-muted-foreground'>
            {product.direct_items.length} direct item
            {product.direct_items.length === 1 ? '' : 's'}
          </p>
        </div>

        {product.direct_items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No direct items are attached to this product.
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-xs md:text-sm'>
              <thead>
                <tr className='border-b border-border text-muted-foreground'>
                  <th className='text-left py-2 pr-2 font-medium'>Item</th>
                  <th className='text-right py-2 px-2 font-medium'>Qty (g)</th>
                  <th className='text-right py-2 px-2 font-medium'>
                    Cost / unit
                  </th>
                  <th className='text-right py-2 pl-2 font-medium'>
                    Cost in product
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.direct_items.map((item) => (
                  <tr
                    key={item.item_id}
                    className='border-b border-border/60 last:border-0'
                  >
                    <td className='py-2 pr-2'>{item.name}</td>
                    <td className='py-2 px-2 text-right'>{item.qty_g}</td>
                    <td className='py-2 px-2 text-right'>
                      {money(item.cost_per_base_unit)}
                    </td>
                    <td className='py-2 pl-2 text-right font-medium'>
                      {money(item.cost_for_item_in_product)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
