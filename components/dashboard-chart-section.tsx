'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

interface DashboardChartSectionProps {
  title: string
  description?: string
  data: ChartDataPoint[]
  type?: 'bar' | 'line'
  dataKeys: Array<{ key: string; color: string; name: string }>
  height?: number
}

export function DashboardChartSection({
  title,
  description,
  data,
  type = 'line',
  dataKeys,
  height = 300,
}: DashboardChartSectionProps) {
  return (
    <Card className='border-border/50'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width='100%'
          height={height}
        >
          {type === 'bar' ? (
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='var(--color-border)'
              />
              <XAxis
                dataKey='name'
                stroke='var(--color-muted-foreground)'
              />
              <YAxis stroke='var(--color-muted-foreground)' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
              <Legend />
              {dataKeys.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  fill={item.color}
                  name={item.name}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='var(--color-border)'
              />
              <XAxis
                dataKey='name'
                stroke='var(--color-muted-foreground)'
              />
              <YAxis stroke='var(--color-muted-foreground)' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
              <Legend />
              {dataKeys.map((item) => (
                <Line
                  key={item.key}
                  type='monotone'
                  dataKey={item.key}
                  stroke={item.color}
                  name={item.name}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
