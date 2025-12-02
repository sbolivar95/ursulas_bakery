'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { recipesApi, itemsApi } from '@/lib/api-client'

interface RecipeIngredient {
  item_id: string
  item_name: string
  qty_g: number
  waste_pct: number
}

interface RecipeDetailProps {
  recipeId: string
}

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const router = useRouter()
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recipe, setRecipe] = useState<any>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [allItems, setAllItems] = useState<any[]>([])
  const [newIngredient, setNewIngredient] = useState({
    item_id: '',
    qty_g: '',
    waste_pct: '',
  })

  useEffect(() => {
    const loadData = async () => {
      if (!organization) return
      setLoading(true)
      try {
        const recipeData = await recipesApi.get(organization.id, recipeId)
        setRecipe(recipeData)

        const ingredientsData = await recipesApi.getItems(
          organization.id,
          recipeId
        )
        setIngredients(ingredientsData)

        const itemsData = await itemsApi.list(organization.id)
        setAllItems(itemsData)
      } catch (error) {
        console.error('Failed to load recipe:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [recipeId, organization])

  const handleAddIngredient = async () => {
    if (!organization || !newIngredient.item_id || !newIngredient.qty_g) return

    try {
      await recipesApi.upsertItem(
        organization.id,
        recipeId,
        newIngredient.item_id,
        {
          qty_g: Number(newIngredient.qty_g),
          waste_pct: Number(newIngredient.waste_pct) || 0,
        }
      )

      const ingredientsData = await recipesApi.getItems(
        organization.id,
        recipeId
      )
      setIngredients(ingredientsData)
      setNewIngredient({ item_id: '', qty_g: '', waste_pct: '' })
    } catch (error) {
      console.error('Failed to add ingredient:', error)
    }
  }

  const handleRemoveIngredient = async (itemId: string) => {
    if (!organization) return
    try {
      await recipesApi.deleteItem(organization.id, recipeId, itemId)
      setIngredients(ingredients.filter((ing) => ing.item_id !== itemId))
    } catch (error) {
      console.error('Failed to remove ingredient:', error)
    }
  }

  const handleSaveRecipe = async () => {
    if (!organization || !recipe) return
    setSaving(true)
    try {
      await recipesApi.update(organization.id, recipeId, {
        name: recipe.name,
        description: recipe.description,
        yield_qty_g: recipe.yield_qty_g,
      })
      router.push('/recipes')
    } catch (error) {
      console.error('Failed to save recipe:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !recipe) {
    return <div>Loading...</div>
  }

  return (
    <div className='space-y-6 max-w-4xl'>
      <Card className='p-6'>
        <div className='grid grid-cols-2 gap-6'>
          <div>
            <Label className='text-muted-foreground'>Recipe Name</Label>
            <p className='text-2xl font-bold mt-2'>{recipe.name}</p>
          </div>
          <div>
            <Label className='text-muted-foreground'>Yield</Label>
            <p className='text-2xl font-bold mt-2'>{recipe.yield_qty_g}g</p>
          </div>
        </div>
        <p className='text-sm text-muted-foreground mt-4'>
          {recipe.description}
        </p>
      </Card>

      <Card className='p-6'>
        <h2 className='text-lg font-bold mb-4'>Ingredients</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border'>
                <th className='text-left py-3 px-4 font-medium'>Item</th>
                <th className='text-left py-3 px-4 font-medium'>Qty (g)</th>
                <th className='text-left py-3 px-4 font-medium'>Waste %</th>
                <th className='text-right py-3 px-4 font-medium'>Action</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  key={ingredient.item_id}
                  className='border-b border-border hover:bg-muted/30'
                >
                  <td className='py-4 px-4'>{ingredient.item_name}</td>
                  <td className='py-4 px-4'>{ingredient.qty_g}</td>
                  <td className='py-4 px-4'>{ingredient.waste_pct}%</td>
                  <td className='py-4 px-4 text-right'>
                    <button
                      onClick={() => handleRemoveIngredient(ingredient.item_id)}
                      className='text-destructive hover:underline'
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-6 pt-6 border-t border-border'>
          <h3 className='font-medium mb-4'>Add Ingredient</h3>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='item'>Item</Label>
              <select
                id='item'
                value={newIngredient.item_id}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    item_id: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm'
              >
                <option value=''>Select item...</option>
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
              <Label htmlFor='qty_g'>Qty (g)</Label>
              <Input
                id='qty_g'
                type='number'
                step='0.01'
                value={newIngredient.qty_g}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, qty_g: e.target.value })
                }
                placeholder='0'
              />
            </div>
            <div>
              <Label htmlFor='waste_pct'>Waste %</Label>
              <Input
                id='waste_pct'
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
              />
            </div>
          </div>
          <Button
            onClick={handleAddIngredient}
            className='mt-4 gap-2'
          >
            <Plus size={16} />
            Add Ingredient
          </Button>
        </div>
      </Card>

      <div className='flex gap-3'>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveRecipe}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </div>
  )
}
