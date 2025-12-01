export interface Product {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
  total_finished_product_cost?: number
  recipes: ProductRecipe[]
  items: ProductItem[]
}

export interface ProductRecipe {
  recipe_id: string
  qty_g: number
  name: string
}

export interface ProductItem {
  item_id: string
  qty_g: number
  name: string
  unit?: string
  cost_per_base_unit?: number
}

export interface RecipeItemInProduct {
  item_id: string
  item_name: string
  qty_g_in_recipe: number
  cost_per_base_unit: number
  cost_in_full_recipe: number
  cost_in_product: number
}

export interface RecipeInProduct {
  recipe_id: string
  name: string
  qty_g_in_product: number
  yield_qty_g: number
  total_recipe_cost: number
  recipe_cost_per_g: number
  cost_for_recipe_in_product: number
  items: RecipeItemInProduct[]
}

export interface DirectItemInProduct {
  item_id: string
  name: string
  qty_g: number
  cost_per_base_unit: number
  cost_for_item_in_product: number
}

export interface ProductDetailResponse {
  id: string
  org_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  total_direct_items_cost: number
  total_recipes_cost: number
  total_finished_product_cost: number
  recipes: RecipeInProduct[]
  direct_items: DirectItemInProduct[]
}
