import { ItemDetail } from './Item-model'

export type RecipeDetail = {
  id: string
  name: string
  yield_qty_g: number
  ingredients_count: number
  description: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  items: ItemDetail[]
  total_recipe_cost: number
  recipe_cost_per_gram: number
}

export type RecipeCreate = {
  name: string
  description: string
  yield_qty_unit: number
}

export type RecipeItemAggregate = {
  recipe_id: string
  item_id: string
  qty_unit: number
  waste_pct: number
}

export type RecipeItemDetail = {
  item_name: string
  item_id: string
  qty_g: number
  waste_pct: number
  cost_per_base_unit?: number
}
