'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { recipesApi, itemsApi } from '@/lib/api-client'
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
import { RecipeItemDetail } from '@/models/recipe.model'

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipeId?: string
}

interface RecipeIngredient {
  item_id: string
  item_name: string
  qty_g: number
  waste_pct: number
  cost_per_base_unit?: number
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipeId,
}: RecipeFormDialogProps) {
  const router = useRouter()
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allItems, setAllItems] = useState<any[]>([])

  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    yield_qty_g: '',
  })

  const [ingredients, setIngredients] = useState<RecipeItemDetail[]>([])
  const [newIngredient, setNewIngredient] = useState({
    item_id: '',
    qty_g: '',
    waste_pct: '0',
  })

  // Load items and recipe data when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (!open || !organization) return
      setLoading(true)
      try {
        // Load all items
        const items = await itemsApi.list()
        setAllItems(items)

        // Load existing recipe if editing
        if (recipeId) {
          const recipeData = await recipesApi.get(recipeId)
          setRecipe({
            name: recipeData.name,
            description: recipeData.description || '',
            yield_qty_g: recipeData.yield_qty_g.toString(),
          })

          const ingredientsData = await recipesApi.getItems(recipeId)
          setIngredients(ingredientsData)
          console.log(ingredientsData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, recipeId, organization])

  const handleAddIngredient = async () => {
    if (!newIngredient.item_id || !newIngredient.qty_g) {
      alert('Please select an item and enter a quantity')
      return
    }

    const selectedItem = allItems.find(
      (item) => item.id === newIngredient.item_id
    )
    if (!selectedItem) return

    // Add to local state
    const ingredient: RecipeIngredient = {
      item_id: newIngredient.item_id,
      item_name: selectedItem.name,
      qty_g: Number(newIngredient.qty_g),
      waste_pct: Number(newIngredient.waste_pct) || 0,
      cost_per_base_unit: selectedItem.cost_per_base_unit,
    }

    // Check if already exists
    const existingIndex = ingredients.findIndex(
      (ing) => ing.item_id === newIngredient.item_id
    )
    if (existingIndex >= 0) {
      const updated = [...ingredients]
      updated[existingIndex] = ingredient
      setIngredients(updated)
    } else {
      setIngredients([...ingredients, ingredient])
    }

    setNewIngredient({ item_id: '', qty_g: '', waste_pct: '0' })
  }

  const handleRemoveIngredient = (itemId: string) => {
    setIngredients(ingredients.filter((ing) => ing.item_id !== itemId))
  }

  const handleSaveRecipe = async () => {
    if (!organization || !recipe.name || !recipe.yield_qty_g) {
      alert('Please fill in recipe name and yield')
      return
    }

    if (ingredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }

    const total_recipe_cost = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.cost_per_base_unit || 0) * ingredient.qty_g
    }, 0)

    console.log('Total Recipe Cost:', total_recipe_cost)

    setSaving(true)
    try {
      if (recipeId) {
        await recipesApi.update(recipeId, {
          name: recipe.name,
          description: recipe.description,
          yield_qty_g: Number(recipe.yield_qty_g),
          total_recipe_cost: Number(total_recipe_cost),
          recipe_cost_per_gram: Number(
            total_recipe_cost / Number(recipe.yield_qty_g)
          ),
        })

        // Update recipe items
        for (const ingredient of ingredients) {
          await recipesApi.upsertItem(recipeId, ingredient.item_id, {
            qty_g: ingredient.qty_g,
            waste_pct: ingredient.waste_pct,
          })
        }
      } else {
        await recipesApi.create({
          name: recipe.name,
          description: recipe.description,
          yield_qty_g: Number(recipe.yield_qty_g),
          total_recipe_cost: Number(total_recipe_cost),
          recipe_cost_per_gram: Number(
            total_recipe_cost / Number(recipe.yield_qty_g)
          ),
          items: ingredients.map((ing) => ({
            item_id: ing.item_id,
            qty_g: ing.qty_g,
            waste_pct: ing.waste_pct,
          })),
        })
      }

      // Reset and close
      setRecipe({ name: '', description: '', yield_qty_g: '' })
      setIngredients([])
      setNewIngredient({ item_id: '', qty_g: '', waste_pct: '0' })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to save recipe:', error)
      alert('Failed to save recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setRecipe({ name: '', description: '', yield_qty_g: '' })
    setIngredients([])
    setNewIngredient({ item_id: '', qty_g: '', waste_pct: '0' })
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
            {recipeId ? 'Edit Recipe' : 'Create New Recipe'}
          </DialogTitle>
          <DialogDescription>
            {recipeId
              ? 'Update recipe details and ingredients'
              : 'Add a new recipe with ingredients'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center py-8'>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Recipe Details */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='name'>Recipe Name *</Label>
                <Input
                  id='name'
                  value={recipe.name}
                  onChange={(e) =>
                    setRecipe({ ...recipe, name: e.target.value })
                  }
                  placeholder='e.g., Tomato Sauce'
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={recipe.description}
                  onChange={(e) =>
                    setRecipe({ ...recipe, description: e.target.value })
                  }
                  placeholder='Optional description'
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor='yield'>Yield (grams) *</Label>
                <Input
                  id='yield'
                  type='number'
                  step='0.01'
                  value={recipe.yield_qty_g}
                  onChange={(e) =>
                    setRecipe({ ...recipe, yield_qty_g: e.target.value })
                  }
                  placeholder='e.g., 1000'
                  disabled={saving}
                />
              </div>
            </div>

            {/* Ingredients Section */}
            <Card className='p-4 bg-muted/30'>
              <h3 className='font-semibold mb-4'>
                Ingredients ({ingredients.length})
              </h3>

              {ingredients.length > 0 && (
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
                        <th className='text-left py-2 px-2 font-medium'>
                          Waste %
                        </th>
                        <th className='text-right py-2 px-2 font-medium'>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ingredient) => (
                        <tr
                          key={ingredient.item_id}
                          className='border-b border-border hover:bg-muted/50'
                        >
                          <td className='py-2 px-2'>{ingredient.item_name}</td>
                          <td className='py-2 px-2'>{ingredient.qty_g}</td>
                          <td className='py-2 px-2'>{ingredient.waste_pct}%</td>
                          <td className='py-2 px-2 text-right'>
                            <button
                              onClick={() =>
                                handleRemoveIngredient(ingredient.item_id)
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

              {/* Add Ingredient Form */}
              <div className='space-y-3 pt-4 border-t border-border'>
                <p className='text-sm font-medium'>Add Ingredient</p>
                <div className='grid grid-cols-3 gap-2'>
                  <div>
                    <Label
                      htmlFor='item-select'
                      className='text-xs'
                    >
                      Item
                    </Label>
                    <select
                      id='item-select'
                      value={newIngredient.item_id}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          item_id: e.target.value,
                        })
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
                      htmlFor='qty-input'
                      className='text-xs'
                    >
                      Qty (g)
                    </Label>
                    <Input
                      id='qty-input'
                      type='number'
                      step='0.01'
                      value={newIngredient.qty_g}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          qty_g: e.target.value,
                        })
                      }
                      placeholder='0'
                      className='h-9'
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='waste-input'
                      className='text-xs'
                    >
                      Waste %
                    </Label>
                    <Input
                      id='waste-input'
                      type='number'
                      step='0.01'
                      value={newIngredient.waste_pct}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          waste_pct: e.target.value,
                        })
                      }
                      placeholder='0'
                      className='h-9'
                      disabled={saving}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddIngredient}
                  variant='outline'
                  size='sm'
                  className='w-full gap-2 bg-transparent'
                  disabled={saving}
                >
                  <Plus size={16} />
                  Add Ingredient
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
            onClick={handleSaveRecipe}
            disabled={saving || loading}
          >
            {saving
              ? 'Saving...'
              : recipeId
              ? 'Update Recipe'
              : 'Create Recipe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
