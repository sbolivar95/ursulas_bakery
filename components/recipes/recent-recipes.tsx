"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"

const recentRecipes = [
  { id: "1", name: "Tomato Sauce", yield: 1000, lastModified: "2 hours ago" },
  { id: "2", name: "Pasta Dough", yield: 800, lastModified: "1 day ago" },
  { id: "3", name: "Pesto", yield: 500, lastModified: "3 days ago" },
]

export function RecentRecipes() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">Recent Recipes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 font-medium">Name</th>
              <th className="text-left py-2 px-4 font-medium">Yield (g)</th>
              <th className="text-left py-2 px-4 font-medium">Last Modified</th>
              <th className="text-right py-2 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentRecipes.map((recipe) => (
              <tr key={recipe.id} className="border-b border-border hover:bg-muted/30">
                <td className="py-3 px-4">{recipe.name}</td>
                <td className="py-3 px-4">{recipe.yield}</td>
                <td className="py-3 px-4 text-muted-foreground">{recipe.lastModified}</td>
                <td className="py-3 px-4 text-right">
                  <Link href={`/recipes/${recipe.id}`} className="text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
