'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productsApi, recipesApi, itemsApi } from '@/lib/api-client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { ProductItem, ProductRecipe } from '@/models/product.model'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
}

export function ProductFormDialog({
  open,
  onOpenChange,
  productId,
}: ProductFormDialogProps) {
  const router = useRouter()
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allRecipes, setAllRecipes] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([])

  const [product, setProduct] = useState({
    name: '',
    description: '',
  })

  const [recipes, setRecipes] = useState<ProductRecipe[]>([])
  const [items, setItems] = useState<ProductItem[]>([])

  const [newRecipe, setNewRecipe] = useState({
    recipe_id: '',
    qty_g: '',
  })

  const [newItem, setNewItem] = useState({
    item_id: '',
    qty_g: '',
    price_per_unit: '',
  })

  // Load data when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (!open || !organization) return
      setLoading(true)
      try {
        // Load all recipes and items
        const [recipesData, itemsData] = await Promise.all([
          recipesApi.list(),
          itemsApi.list(),
        ])

        setAllRecipes(recipesData)
        setAllItems(itemsData)
        console.log(itemsData)

        // Load existing product if editing
        if (productId) {
          const productData = await productsApi.get(productId)
          setProduct({
            name: productData.name,
            description: productData.description || '',
          })
          setRecipes(productData.recipes || [])
          setItems(productData.items || [])
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, productId, organization])

  const handleAddRecipe = () => {
    if (!newRecipe.recipe_id || !newRecipe.qty_g) {
      alert('Please select a recipe and enter a quantity')
      return
    }

    const selectedRecipe = allRecipes.find(
      (recipe) => recipe.id === newRecipe.recipe_id
    )
    if (!selectedRecipe) return

    const recipeItem: ProductRecipe = {
      recipe_id: newRecipe.recipe_id,
      name: selectedRecipe.name,
      qty_g: Number(newRecipe.qty_g),
    }

    // Check if already exists
    const existingIndex = recipes.findIndex(
      (r) => r.recipe_id === newRecipe.recipe_id
    )
    if (existingIndex >= 0) {
      const updated = [...recipes]
      updated[existingIndex] = recipeItem
      setRecipes(updated)
    } else {
      setRecipes([...recipes, recipeItem])
    }

    setNewRecipe({ recipe_id: '', qty_g: '' })
  }

  const handleAddItem = () => {
    if (!newItem.item_id || !newItem.qty_g) {
      alert('Please select an item and enter a quantity')
      return
    }

    const selectedItem = allItems.find((item) => item.id === newItem.item_id)
    if (!selectedItem) return

    const productItemObj: ProductItem = {
      item_id: newItem.item_id,
      name: selectedItem.name,
      qty_g: Number(newItem.qty_g),
    }

    // Check if already exists
    const existingIndex = items.findIndex((i) => i.item_id === newItem.item_id)
    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex] = productItemObj
      setItems(updated)
    } else {
      setItems([...items, productItemObj])
    }

    setNewItem({ item_id: '', qty_g: '', price_per_unit: '' })
  }

  const handleRemoveRecipe = (recipeId: string) => {
    setRecipes(recipes.filter((r) => r.recipe_id !== recipeId))
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.item_id !== itemId))
  }

  const handleSaveProduct = async () => {
    if (!organization || !product.name) {
      alert('Please fill in product name')
      return
    }

    if (recipes.length === 0 && items.length === 0) {
      alert('Please add at least one recipe or item')
      return
    }

    setSaving(true)
    try {
      if (productId) {
        await productsApi.update(productId, {
          name: product.name,
          description: product.description,
          recipes: recipes.map((r) => ({
            recipe_id: r.recipe_id,
            qty_g: r.qty_g,
          })),
          items: items.map((i) => ({
            item_id: i.item_id,
            qty_g: i.qty_g,
          })),
        })
      } else {
        await productsApi.create({
          name: product.name,
          description: product.description,
          recipes: recipes.map((r) => ({
            recipe_id: r.recipe_id,
            qty_g: r.qty_g,
          })),
          items: items.map((i) => ({
            item_id: i.item_id,
            qty_g: i.qty_g,
          })),
        })
      }

      // Reset and close
      setProduct({ name: '', description: '' })
      setRecipes([])
      setItems([])
      setNewRecipe({ recipe_id: '', qty_g: '' })
      setNewItem({ item_id: '', qty_g: '', price_per_unit: '' })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setProduct({ name: '', description: '' })
    setRecipes([])
    setItems([])
    setNewRecipe({ recipe_id: '', qty_g: '' })
    setNewItem({ item_id: '', qty_g: '', price_per_unit: '' })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {productId ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {productId
              ? 'Update product details, recipes, and items'
              : 'Add a new finished product with recipes and items'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center py-8'>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Product Details */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  placeholder='e.g., Spaghetti Carbonara'
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  placeholder='Optional description'
                  disabled={saving}
                />
              </div>
            </div>

            {/* Recipes Section */}
            <Card className='p-4 bg-muted/30'>
              <h3 className='font-semibold mb-4'>Recipes ({recipes.length})</h3>

              {recipes.length > 0 && (
                <div className='mb-4 overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-border'>
                        <th className='text-left py-2 px-2 font-medium'>
                          Recipe
                        </th>
                        <th className='text-left py-2 px-2 font-medium'>
                          Qty (g)
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((recipe) => (
                        <tr
                          key={recipe.recipe_id}
                          className='border-b border-border hover:bg-muted/50'
                        >
                          <td className='py-2 px-2'>{recipe.name}</td>
                          <td className='py-2 px-2'>{recipe.qty_g}</td>
                          <td className='py-2 px-2 text-right'>
                            <button
                              onClick={() =>
                                handleRemoveRecipe(recipe.recipe_id)
                              }
                              className='text-destructive hover:underline disabled:opacity-50'
                              disabled={saving}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Recipe Form */}
              <div className='space-y-3 pt-4 border-t border-border'>
                <p className='text-sm font-medium'>Add Recipe</p>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label
                      htmlFor='recipe-select'
                      className='text-xs'
                    >
                      Recipe
                    </Label>
                    <select
                      id='recipe-select'
                      value={newRecipe.recipe_id}
                      onChange={(e) =>
                        setNewRecipe({
                          ...newRecipe,
                          recipe_id: e.target.value,
                        })
                      }
                      className='w-full px-2 py-2 border border-input rounded-md bg-background text-sm disabled:opacity-50'
                      disabled={saving}
                    >
                      <option value=''>Select...</option>
                      {allRecipes.map((recipe) => (
                        <option
                          key={recipe.id}
                          value={recipe.id}
                        >
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor='recipe-qty-input'
                      className='text-xs'
                    >
                      Qty (g)
                    </Label>
                    <Input
                      id='recipe-qty-input'
                      type='number'
                      step='0.01'
                      value={newRecipe.qty_g}
                      onChange={(e) =>
                        setNewRecipe({ ...newRecipe, qty_g: e.target.value })
                      }
                      placeholder='0'
                      className='h-9'
                      disabled={saving}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddRecipe}
                  variant='outline'
                  size='sm'
                  className='w-full gap-2 bg-transparent'
                  disabled={saving}
                >
                  <Plus size={16} />
                  Add Recipe
                </Button>
              </div>
            </Card>

            {/* Items Section */}
            <Card className='p-4 bg-muted/30'>
              <h3 className='font-semibold mb-4'>
                Direct Items ({items.length})
              </h3>

              {items.length > 0 && (
                <div className='mb-4 overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-border'>
                        <th className='text-left py-2 px-2 font-medium'>
                          Item
                        </th>
                        <th className='text-left py-2 px-2 font-medium'>
                          Qty (unit)
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.item_id}
                          className='border-b border-border hover:bg-muted/50'
                        >
                          <td className='py-2 px-2'>{item.name}</td>
                          <td className='py-2 px-2'>
                            {item.qty_g} {item.unit}
                          </td>

                          <td className='py-2 px-2 text-right'>
                            <button
                              onClick={() => handleRemoveItem(item.item_id)}
                              className='text-destructive hover:underline disabled:opacity-50'
                              disabled={saving}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Item Form */}
              <div className='space-y-3 pt-4 border-t border-border'>
                <p className='text-sm font-medium'>Add Direct Item</p>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label
                      htmlFor='item-select'
                      className='text-xs'
                    >
                      Item
                    </Label>
                    <select
                      id='item-select'
                      value={newItem.item_id}
                      onChange={(e) =>
                        setNewItem({ ...newItem, item_id: e.target.value })
                      }
                      className='w-full px-2 py-2 border border-input rounded-md bg-background text-sm disabled:opacity-50'
                      disabled={saving}
                    >
                      <option value=''>Select...</option>
                      {allItems.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor='item-qty-input'
                      className='text-xs'
                    >
                      Qty (g)
                    </Label>
                    <Input
                      id='item-qty-input'
                      type='number'
                      step='0.01'
                      value={newItem.qty_g}
                      onChange={(e) =>
                        setNewItem({ ...newItem, qty_g: e.target.value })
                      }
                      placeholder='0'
                      className='h-9'
                      disabled={saving}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddItem}
                  variant='outline'
                  size='sm'
                  className='w-full gap-2 bg-transparent'
                  disabled={saving}
                >
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            disabled={saving || loading}
          >
            {saving
              ? 'Saving...'
              : productId
              ? 'Update Product'
              : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
