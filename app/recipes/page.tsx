'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RecipesList } from '@/components/recipes/recipes-list'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { RecipeFormDialog } from '@/components/recipes/recipe-form-dialog'
import { recipesApi } from '@/lib/api-client'
import { RecipeDetail } from '@/models/recipe.model'
import { useAuth } from '@/lib/auth-context'

export default function RecipesPage() {
  const { organization, isLoading } = useAuth()
  const [recipes, setRecipes] = useState<RecipeDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await recipesApi.list(organization!.id)
      setRecipes(response)
    } catch (error) {
      console.error('Failed to load recipes', error)
    } finally {
      setLoading(false)
    }
  }, [organization])

  useEffect(() => {
    if (isLoading) return
    if (!organization) return
    loadRecipes()
  }, [organization, isLoading, loadRecipes])

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
            reloadRecipes={loadRecipes}
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
