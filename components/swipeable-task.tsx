"use client"

import { motion, PanInfo, useAnimation, HTMLMotionProps } from "framer-motion"
import type { HTMLAttributes } from "react"
import { Trash2 } from "lucide-react"
import { useState } from "react"

interface SwipeableTaskProps {
  task: {
    id: number
    title: string
    completed: boolean
    category: string
    categoryColor: string
    subtasks: {
      id: number
      title: string
      completed: boolean
    }[]
  }
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}

export function SwipeableTask({ task, onDelete, onToggle }: SwipeableTaskProps) {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100 // pixels to trigger delete
    
    if (info.offset.x < -threshold) {
      await controls.start({ x: -200, opacity: 0 })
      onDelete(task.id)
    } else {
      controls.start({ x: 0, opacity: 1 })
    }
    
    setIsDragging(false)
  }

  return (
    <div className="relative">
      {/* Delete Background */}
      <div className="absolute inset-0 flex items-center justify-end px-4 bg-red-500/10 rounded-lg">
        <Trash2 className="text-red-500 w-6 h-6" />
      </div>
      
      {/* Task Card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-color)',
          borderRadius: '0.5rem',
          padding: '1rem',
          cursor: 'grab',
          ['--bg-color' as string]: 'white',
          ['--border-color' as string]: 'rgb(229, 231, 235)',
        }}
        className={`dark:bg-gray-800 dark:border-gray-700 border shadow-sm ${
          isDragging ? 'z-10' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {task.title}
            </h3>
            {task.subtasks.length > 0 && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} subtasks
              </div>
            )}
          </div>
          <div className={`w-2 h-2 rounded-full ${task.categoryColor.replace('from-', 'bg-').split(' ')[0]}`} />
        </div>
      </motion.div>
    </div>
  )
}
