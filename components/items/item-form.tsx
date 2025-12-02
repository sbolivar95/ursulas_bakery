'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { itemsApi } from '@/lib/api-client'
import { Category, CreateItem, Unit } from '@/models/Item-model'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ItemFormProps {
  mode: 'create' | 'edit'
  itemId?: string
}

interface ItemDialogProps extends ItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after successful create/update */
  onSaved?: () => void
}

export function ItemDialog({
  mode,
  itemId,
  open,
  onOpenChange,
  onSaved,
}: ItemDialogProps) {
  const router = useRouter()
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [itemData, setItemData] = useState<CreateItem>({
    name: '',
    sku: '',
    purchase_unit_id: '',
    purchase_qty: 1,
    purchase_cost: 0,
    base_unit_id: '',
    category_id: '',
    base_qty_per_purchase: 1000,
    active: true,
  })

  useEffect(() => {
    if (!open) return // avoid refetching when dialog is closed

    const loadData = async () => {
      try {
        const unitsData = await itemsApi.getUnits()
        setUnits(unitsData)

        const categoryData = await itemsApi.getCategories(organization!.id)
        setCategories(categoryData)

        if (mode === 'edit' && itemId && organization) {
          const item = await itemsApi.get(organization!.id, itemId)
          setItemData({ ...item, category_id: item.category_id ?? '' })
        }

        if (mode === 'create') {
          // reset form when opening in create mode
          setItemData({
            name: '',
            sku: '',
            purchase_unit_id: '',
            purchase_qty: 1,
            purchase_cost: 0,
            base_unit_id: '',
            category_id: '',
            base_qty_per_purchase: 1000,
            active: true,
          })
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [mode, itemId, organization, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setItemData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setLoading(true)
    try {
      if (mode === 'create') {
        await itemsApi.create(organization!.id, itemData)
      } else if (itemId) {
        await itemsApi.update(organization!.id, itemId, itemData)
      }

      // optional: refresh list behind the dialog
      router.refresh()

      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save item:', error)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'create' ? 'Create Item' : 'Edit Item'
  const description =
    mode === 'create'
      ? 'Add a new item to your inventory.'
      : 'Update the details of this item.'

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Item Name *</Label>
              <Input
                id='name'
                name='name'
                value={itemData.name}
                onChange={handleChange}
                required
                placeholder='e.g., Tomato'
              />
            </div>
            <div>
              <Label htmlFor='sku'>SKU</Label>
              <Input
                id='sku'
                name='sku'
                value={itemData.sku}
                onChange={handleChange}
                placeholder='e.g., TOM-001'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='purchase_unit_id'>Purchase Unit *</Label>
              <select
                id='purchase_unit_id'
                name='purchase_unit_id'
                value={itemData.purchase_unit_id}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-input rounded-md bg-background'
              >
                <option value=''>Select unit...</option>
                {units.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor='purchase_qty'>Purchase Qty *</Label>
              <Input
                id='purchase_qty'
                name='purchase_qty'
                type='number'
                step='0.01'
                value={Number(itemData.purchase_qty).toFixed(0)}
                onChange={handleChange}
                required
                placeholder='1'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='purchase_cost'>Purchase Cost *</Label>
              <Input
                id='purchase_cost'
                name='purchase_cost'
                type='number'
                value={itemData.purchase_cost}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor='base_unit_id'>Base Unit *</Label>
              <select
                id='base_unit_id'
                name='base_unit_id'
                value={itemData.base_unit_id}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-input rounded-md bg-background'
              >
                <option value=''>Select unit...</option>
                {units.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor='category_id'>Category</Label>
            <select
              id='category_id'
              name='category_id'
              value={itemData.category_id}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-input rounded-md bg-background'
            >
              <option value=''>Select category...</option>
              {categories.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor='base_qty_per_purchase'>
              Base Qty per Purchase *
            </Label>
            <Input
              id='base_qty_per_purchase'
              name='base_qty_per_purchase'
              type='number'
              step='0.01'
              value={Number(itemData.base_qty_per_purchase).toFixed(0)}
              onChange={handleChange}
              required
              placeholder='1000'
            />
          </div>

          <div className='flex items-center gap-2'>
            <input
              id='active'
              name='active'
              type='checkbox'
              checked={itemData.active}
              onChange={handleChange}
              className='w-4 h-4'
            />
            <Label htmlFor='active'>Active</Label>
          </div>

          <DialogFooter className='flex gap-3 justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : mode === 'create'
                ? 'Create Item'
                : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
