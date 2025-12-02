'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChefHat, Package, Leaf } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'recipe' | 'product' | 'item'
  name: string
  action: string
  timestamp: string
  user?: string
}

interface DashboardActivityProps {
  activities: ActivityItem[]
}

export function DashboardActivity({ activities }: DashboardActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'recipe':
        return <ChefHat className='w-4 h-4' />
      case 'product':
        return <Package className='w-4 h-4' />
      case 'item':
        return <Leaf className='w-4 h-4' />
      default:
        return null
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'recipe':
        return 'bg-blue-500/10 text-blue-600'
      case 'product':
        return 'bg-purple-500/10 text-purple-600'
      case 'item':
        return 'bg-green-500/10 text-green-600'
      default:
        return 'bg-gray-500/10 text-gray-600'
    }
  }

  return (
    <Card className='border-border/50'>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest changes in your costing system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {activities.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className='flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0'
              >
                <div
                  className={`p-2 rounded-lg ${getIconColor(activity.type)}`}
                >
                  {getIcon(activity.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {activity.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {activity.action}
                  </p>
                </div>
                <div className='text-xs text-muted-foreground flex-shrink-0'>
                  {activity.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
