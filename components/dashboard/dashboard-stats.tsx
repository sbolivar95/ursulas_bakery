"use client"

import { Card } from "@/components/ui/card"

const stats = [
  { label: "Total Items", value: "47", change: "+2" },
  { label: "Total Recipes", value: "12", change: "+1" },
  { label: "Finished Products", value: "18", change: "0" },
  { label: "Avg Product Cost", value: "$8.50", change: "+0.25" },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
          <p className="text-xs text-accent mt-2">{stat.change}</p>
        </Card>
      ))}
    </div>
  )
}
