'use client'

import { useParams } from 'next/navigation'
import { ProductDetail } from '@/components/products/product-detail'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <DashboardLayout title='Product Detail'>
      <ProductDetail productId={id} />
    </DashboardLayout>
  )
}
