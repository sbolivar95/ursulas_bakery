'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RecipesList } from '@/components/recipes-list'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { RecipeFormDialog } from '@/components/recipe-form-dialog'
import { recipesApi } from '@/lib/api-client'
import { RecipeDetail } from '@/models/recipe.model'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await recipesApi.list()
      setRecipes(response)
      console.log(response)
    } catch (error) {
      console.error('Failed to load recipes', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <ProtectedRoute>
      <DashboardLayout title='Recipes'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div></div>
            <Button onClick={() => setDialogOpen(true)}>New Recipe</Button>
          </div>
          <RecipesList
            recipes={recipes}
            loading={loading}
            reloadRecipes={loadItems}
          />
        </div>

        <RecipeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
