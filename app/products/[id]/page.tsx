'use client'

import { useParams } from 'next/navigation'
import { ProductDetail } from '@/components/product-detail'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <DashboardLayout title='Product Detail'>
      <ProductDetail productId={id} />
    </DashboardLayout>
  )
}
