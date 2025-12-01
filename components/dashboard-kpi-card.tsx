'use client'

import type React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function KPICard({
  title,
  value,
  unit = '',
  change,
  changeLabel = 'vs last month',
  icon,
  trend = 'neutral',
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className='w-4 h-4' />
    if (trend === 'down') return <ArrowDown className='w-4 h-4' />
    return <Minus className='w-4 h-4' />
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-muted-foreground'
  }

  return (
    <Card className='border-border/50'>
      <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        {icon && <div className='text-primary'>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className='flex items-baseline gap-2'>
          <div className='text-2xl font-bold text-foreground'>{value}</div>
          {unit && (
            <span className='text-sm text-muted-foreground'>{unit}</span>
          )}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}
          >
            {getTrendIcon()}
            <span>
              {Math.abs(change)}% {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
