export type ItemDetail = {
  id: string
  name: string
  sku: string
  purchase_unit: string
  base_unit: string
  purchase_cost: number
  cost_per_base_unit: number
  category_name: string
  active: boolean
  qty_g: number
}

export type CreateItem = {
  name: string
  sku: string
  purchase_unit_id: string
  purchase_qty: number
  purchase_cost: number
  base_unit_id: string
  base_qty_per_purchase: number
  category_id: string
  active: boolean
}

export type Unit = {
  id: string
  name: string
  symbol: string
  unit_type: string
}

export type Category = {
  id: string
  name: string
}
