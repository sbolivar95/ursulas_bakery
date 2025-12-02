'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Trash2, Eye, Pencil } from 'lucide-react'
import { RecipeDetail } from '@/models/recipe.model'
import { useState } from 'react'
import { RecipeFormDialog } from './recipe-form-dialog'
import { recipesApi } from '@/lib/api-client'
import { ConfirmDeleteDialog } from '../dialog/ConfirmDeleteDialog'
import { useAuth } from '@/lib/auth-context'

interface RecipesListProps {
  recipes: RecipeDetail[]
  loading: boolean
  reloadRecipes: () => Promise<void>
}

export function RecipesList({
  recipes,
  loading,
  reloadRecipes,
}: RecipesListProps) {
  const { organization } = useAuth()
  const [dialogFormOpen, setDialogFormOpen] = useState(false)
  const [recipeId, setRecipeId] = useState('')

  async function handleDelete(id: string) {
    try {
      await recipesApi.delete(organization!.id, id)
      await reloadRecipes()
    } catch (err) {
      console.error('Error deleting item:', err)
    } finally {
    }
  }

  if (loading) {
    return <div className='text-center py-12'>Loading recipes...</div>
  }

  return (
    <Card className='p-6'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border'>
              <th className='text-left py-3 px-4 font-medium'>Name</th>
              <th className='text-left py-3 px-4 font-medium'>Total Cost</th>
              <th className='text-left py-3 px-4 font-medium'>Cost per Gram</th>
              <th className='text-left py-3 px-4 font-medium'>Yield (g)</th>
              <th className='text-left py-3 px-4 font-medium'>Ingredients</th>
              <th className='text-left py-3 px-4 font-medium'>Description</th>
              <th className='text-left py-3 px-4 font-medium'>Created By</th>
              <th className='text-left py-3 px-4 font-medium'>Created At</th>
              <th className='text-left py-3 px-4 font-medium'>Updated By</th>
              <th className='text-left py-3 px-4 font-medium'>Updated At</th>
              <th className='text-right py-3 px-4 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr
                key={recipe.id}
                className='border-b border-border hover:bg-muted/30'
              >
                <td className='py-4 px-4 font-medium'>{recipe.name}</td>
                <td className='py-4 px-4 font-medium'>
                  $ {Number(recipe.total_recipe_cost).toFixed(2)}
                </td>
                <td className='py-4 px-4 font-medium'>
                  $ {Number(recipe.recipe_cost_per_gram).toFixed(2)}
                </td>

                <td className='py-4 px-4 text-muted-foreground'>
                  {Number(recipe.yield_qty_g).toFixed(0)}
                </td>

                <td className='py-4 px-4'>
                  <div className='flex gap-1.5'>
                    <Eye
                      size={16}
                      className='text-orange-700'
                    />
                    {recipe.items?.length ?? 0} items
                  </div>
                </td>

                <td className='py-4 px-4'>{recipe.description}</td>
                <td className='py-4 px-4'>{recipe.created_by}</td>
                <td className='py-4 px-4'>{recipe.created_at}</td>
                <td className='py-4 px-4'>{recipe.updated_by}</td>
                <td className='py-4 px-4'>{recipe.updated_at}</td>

                <td className='py-4 px-4 text-right space-x-2 flex justify-end'>
                  <div className='flex'>
                    <Pencil
                      size={16}
                      className='text-orange-700 cursor-pointer'
                      onClick={() => {
                        setDialogFormOpen(true)
                        setRecipeId(recipe.id)
                      }}
                    />
                  </div>
                  <ConfirmDeleteDialog
                    itemId={recipe.id!}
                    type='recipe'
                    onConfirm={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <RecipeFormDialog
          open={dialogFormOpen}
          onOpenChange={setDialogFormOpen}
          recipeId={recipeId}
        />
      </div>
    </Card>
  )
}
