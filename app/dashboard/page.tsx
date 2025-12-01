'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'

import { itemsApi, recipesApi, productsApi } from '@/lib/api-client'
import { TrendingUp, UtensilsCrossed, Package, Leaf } from 'lucide-react'
import { KPICard } from '@/components/dashboard-kpi-card'
import { DashboardChartSection } from '@/components/dashboard-chart-section'
import { DashboardActivity } from '@/components/dashboard-activity'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalRecipes: 0,
    totalProducts: 0,
    averageCost: 0,
  })
  const [loading, setLoading] = useState(true)
  const [costTrend, setCostTrend] = useState<
    Array<{ name: string; cost: number; waste: number }>
  >([])
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [itemsResponse, recipesResponse, productsResponse] =
          await Promise.all([
            itemsApi.list(),
            recipesApi.list(),
            productsApi.list(),
          ])

        const items = itemsResponse || []
        const recipes = recipesResponse || []
        const products = productsResponse || []

        // Calculate stats
        setStats({
          totalItems: items.length,
          totalRecipes: recipes.length,
          totalProducts: products.length,
          averageCost:
            items.length > 0
              ? items.reduce(
                  (sum: number, item: any) => sum + (item.cost || 0),
                  0
                ) / items.length
              : 0,
        })

        // Generate cost trend data
        const trendData = [
          { name: 'Week 1', cost: 1200, waste: 120 },
          { name: 'Week 2', cost: 1400, waste: 140 },
          { name: 'Week 3', cost: 1100, waste: 110 },
          { name: 'Week 4', cost: 1500, waste: 150 },
        ]
        setCostTrend(trendData)

        // Generate recent activities
        const recentActivities = [
          ...recipes.slice(0, 2).map((r: any) => ({
            id: r.id,
            type: 'recipe',
            name: r.name,
            action: 'Recipe created',
            timestamp: '2h ago',
          })),
          ...products.slice(0, 2).map((p: any) => ({
            id: p.id,
            type: 'product',
            name: p.name,
            action: 'Product added',
            timestamp: '4h ago',
          })),
          ...items.slice(0, 1).map((i: any) => ({
            id: i.id,
            type: 'item',
            name: i.name,
            action: 'Item updated',
            timestamp: '1d ago',
          })),
        ]
        setActivities(recentActivities)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <ProtectedRoute>
      <DashboardLayout title='Dashboard'>
        {loading ? (
          <div className='flex items-center justify-center h-96'>
            <div className='text-muted-foreground'>Loading dashboard...</div>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* KPI Cards Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <KPICard
                title='Total Items'
                value={stats.totalItems}
                icon={<Leaf className='w-5 h-5' />}
                trend='up'
                change={12}
              />
              <KPICard
                title='Recipes'
                value={stats.totalRecipes}
                icon={<UtensilsCrossed className='w-5 h-5' />}
                trend='up'
                change={8}
              />
              <KPICard
                title='Products'
                value={stats.totalProducts}
                icon={<Package className='w-5 h-5' />}
                trend='up'
                change={5}
              />
              <KPICard
                title='Avg Item Cost'
                value={`$${stats.averageCost.toFixed(2)}`}
                icon={<TrendingUp className='w-5 h-5' />}
                trend='down'
                change={3}
                changeLabel='vs last month'
              />
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <DashboardChartSection
                title='Cost Trend'
                description='Weekly cost and waste analysis'
                data={costTrend}
                type='line'
                dataKeys={[
                  { key: 'cost', color: 'var(--color-primary)', name: 'Cost' },
                  { key: 'waste', color: 'var(--color-accent)', name: 'Waste' },
                ]}
                height={300}
              />
              <DashboardChartSection
                title='Inventory Distribution'
                description='Cost breakdown by category'
                data={[
                  { name: 'Produce', value: 35 },
                  { name: 'Proteins', value: 45 },
                  { name: 'Dairy', value: 20 },
                ]}
                type='bar'
                dataKeys={[
                  {
                    key: 'value',
                    color: 'var(--color-chart-1)',
                    name: 'Cost %',
                  },
                ]}
                height={300}
              />
            </div>

            {/* Recent Activity */}
            <DashboardActivity activities={activities} />
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
