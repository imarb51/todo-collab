"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Briefcase, BookOpen, Dumbbell, ShoppingCart, Home, Plane } from "lucide-react"

const categories = [
  { id: 1, name: "Health", icon: Briefcase, color: "bg-indigo-50", iconColor: "text-indigo-400", count: 6 },
  { id: 2, name: "Work", icon: Dumbbell, color: "bg-green-50", iconColor: "text-green-500", count: 5 },
  { id: 3, name: "Mental Health", icon: BookOpen, color: "bg-pink-50", iconColor: "text-pink-400", count: 4 },
  { id: 4, name: "Others", icon: ShoppingCart, color: "bg-gray-100", iconColor: "text-gray-400", count: 13 },
];

export function CategorySection() {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CategoryCard category={category} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface CategoryCardProps {
  category: {
    id: number
    name: string
    icon: React.ElementType
    color: string
  }
}

function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 h-24 sm:h-28 flex flex-col justify-between ${category.color}`}
      style={{ minWidth: '120px' }}
    >
      <div className="flex items-start justify-between">
        <Icon className={`w-6 h-6 ${category.iconColor}`} />
      </div>
      <div className="mt-3">
        <div className="text-base sm:text-lg font-bold text-gray-700">{category.count} <span className="font-normal text-sm sm:text-base text-gray-700">{category.name}</span></div>
      </div>
    </div>
  )
}
