// Include auth token in headers and use correct endpoint paths

'use client'

import { Category, CreateItem, ItemDetail, Unit } from '@/models/Item-model'
import { Product, ProductDetailResponse } from '@/models/product.model'
import { RecipeDetail, RecipeItemDetail } from '@/models/recipe.model'
import { useAuth } from './auth-context'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function orgId(): string | null {
  return localStorage.getItem('organization')
}

function userCode(): string | null {
  const { user } = useAuth()
  return user!.id
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: Record<string, any>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Items endpoints - matches items.routes.js
export const itemsApi = {
  // GET /orgs/:orgId/get
  list: () => apiCall<ItemDetail[]>('GET', `/items/${orgId()}/items/get`),

  // GET /items/:orgId/items/:itemId/get_by_id
  get: (itemId: string) =>
    apiCall<CreateItem>('GET', `/items/${orgId()}/items/${itemId}/get_by_id`),

  // POST /items/:orgId/create
  create: (item: any) =>
    apiCall('POST', `/items/${orgId()}/items/create`, item),

  // PATCH /items/:orgId/items/:itemId/update
  update: (itemId: string, item: any) =>
    apiCall('PATCH', `/items/${orgId()}/items/${itemId}/update`, item),

  // DELETE /items/:orgId/items/:itemId/delete
  delete: (itemId: string) =>
    apiCall('DELETE', `/items/${orgId()}/items/${itemId}/delete`),

  // GET /units
  getUnits: () => apiCall<Unit[]>('GET', `/items/units`),

  getCategories: () =>
    apiCall<Category[]>('GET', `/items/${orgId()}/categories`),
}

// Recipes endpoints - matches recipes.routes.js
export const recipesApi = {
  // POST /orgs/:orgId/create
  create: (recipe: any) =>
    apiCall('POST', `/recipes/${orgId()}/${userCode()}/recipes/create`, recipe),

  // GET /recipes/:orgId/return_list
  list: () =>
    apiCall<RecipeDetail[]>('GET', `/recipes/${orgId()}/recipes/return_list`),

  // GET /recipes/:orgId/recipes/:recipeId/return_single_recipe
  get: (recipeId: string) =>
    apiCall<RecipeDetail>(
      'GET',
      `/recipes/${orgId()}/recipes/${recipeId}/return_single_recipe`
    ),

  // PATCH /recipes/:orgId/recipes/:recipeId/update_recipe
  update: (recipeId: string, recipe: any) =>
    apiCall(
      'PATCH',
      `/recipes/${orgId()}/${userCode()}/recipes/${recipeId}/update_recipe`,
      recipe
    ),

  // DELETE /recipes/:orgId/recipes/:recipeId/delete_recipe
  delete: (recipeId: string) =>
    apiCall('DELETE', `/recipes/${orgId()}/recipes/${recipeId}/delete_recipe`),

  // Recipe items - GET /recipes/:orgId/recipes/:recipeId/items
  getItems: (recipeId: string) =>
    apiCall<RecipeItemDetail[]>(
      'GET',
      `/recipes/${orgId()}/recipes/${recipeId}/items`
    ),

  // PUT /recipes/:orgId/recipes/:recipeId/items/:itemId/update_recipe_item
  upsertItem: (recipeId: string, itemId: string, data: any) =>
    apiCall(
      'PUT',
      `/recipes/${orgId()}/recipes/${recipeId}/items/${itemId}/update_recipe_item`,
      data
    ),

  // DELETE /recipes/:orgId/recipes/:recipeId/items/:itemId/delete_recipe_item
  deleteItem: (recipeId: string, itemId: string) =>
    apiCall(
      'DELETE',
      `/recipes/${orgId()}/recipes/${recipeId}/items/${itemId}/delete_recipe_item`
    ),
}

// Products endpoints - matches products.routes.js
export const productsApi = {
  // POST /orgs/:orgId/create_product
  create: (product: any) =>
    apiCall(
      'POST',
      `/products/${orgId()}/${userCode()}/create_product`,
      product
    ),

  // GET /products/:orgId/return_product_list
  list: () =>
    apiCall<Product[]>('GET', `/products/${orgId()}/return_product_list`),

  // GET /products/:orgId/products/:productId/return_single_product
  get: (productId: string) =>
    apiCall<ProductDetailResponse>(
      'GET',
      `/products/${orgId()}/products/${productId}/return_single_product`
    ),

  // PATCH /products/:orgId/products/:productId/update_product
  update: (productId: string, product: any) =>
    apiCall(
      'PATCH',
      `/products/${orgId()}/products/${productId}/update_product`,
      product
    ),

  // DELETE /products/:orgId/products/:productId/delete_product
  delete: (productId: string) =>
    apiCall(
      'DELETE',
      `/products/${orgId()}/products/${productId}/delete_product`
    ),

  // Product recipes - GET /products/:orgId/products/:productId/return_product_recipe
  getRecipes: (productId: string) =>
    apiCall(
      'GET',
      `/products/${orgId()}/products/${productId}/return_product_recipe`
    ),

  // PUT /products/:orgId/products/:productId/recipes/:recipeId/update_product_recipe
  upsertRecipe: (productId: string, recipeId: string, data: any) =>
    apiCall(
      'PUT',
      `/products/${orgId()}/products/${productId}/recipes/${recipeId}/update_product_recipe`,
      data
    ),

  // DELETE /products/:orgId/products/:productId/recipes/:recipeId/delete_product_recipe
  deleteRecipe: (productId: string, recipeId: string) =>
    apiCall(
      'DELETE',
      `/products/${orgId()}/products/${productId}/recipes/${recipeId}/delete_product_recipe`
    ),

  // Product items - GET /products/:orgId/products/:productId/items
  getItems: (productId: string) =>
    apiCall('GET', `/products/${orgId()}/products/${productId}/items`),

  // PUT /products/:orgId/products/:productId/items/:itemId/update_product_item
  upsertItem: (productId: string, itemId: string, data: any) =>
    apiCall(
      'PUT',
      `/products/${orgId()}/products/${productId}/items/${itemId}/update_product_item`,
      data
    ),

  // DELETE /products/:orgId/products/:productId/items/:itemId/delete_product_item
  deleteItem: (productId: string, itemId: string) =>
    apiCall(
      'DELETE',
      `/products/${orgId()}/products/${productId}/items/${itemId}/delete_product_item`
    ),
}
