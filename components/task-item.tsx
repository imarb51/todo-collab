"use client"

import { motion } from "framer-motion"
import { Trash2, ChevronDown } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface Subtask {
  id: number
  title: string
  completed: boolean
}

interface TaskItemProps {
  task: {
    id: string | number
    title: string
    completed: boolean
    category: string | null
    categoryColor: string | null
    subtasks: Subtask[] | string | null // Allow string for JSON representation
  }
  onDelete: (id: string | number) => void
  onToggle: (id: string | number) => void
  onToggleSubtask?: (taskId: string | number, subtaskId: number) => void
  onExpandTask?: (taskId: string | number) => void
  isExpanded?: boolean
}

export function TaskItem({ 
  task, 
  onDelete, 
  onToggle, 
  onToggleSubtask,
  onExpandTask,
  isExpanded = false
}: TaskItemProps) {
  // State for long-press detection
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [shouldDelete, setShouldDelete] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const pressStartTime = useRef<number>(0)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Long-press threshold in milliseconds (e.g., 500ms = 0.5 seconds)
  const longPressThreshold = 500
  
  // Mouse/Touch event handlers for long-press detection
  const handlePressStart = () => {
    pressStartTime.current = Date.now()
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
      // Trigger delete confirmation
      onDelete(task.id)
    }, longPressThreshold)
  }

  const handlePressEnd = () => {
    // If the press duration was less than the threshold, it wasn't a long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    // Allow click events only for short presses (not long presses)
    setIsLongPressing(false)
  }
  
  // Handle normal click events (preventing them if we're in a long-press state)
  const handleClick = (e: React.MouseEvent) => {
    // Prevent the default action if we're in the middle of a long press
    if (isLongPressing) {
      e.preventDefault()
      return
    }
    
    // Normal click behavior can go here if needed
  }
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])
  
  // Parse subtasks if it's a string (JSON format) and ensure each has a valid ID
  const subtasksArray = (() => {
    if (!task.subtasks) return []
    if (typeof task.subtasks === 'string') {
      try {
        const parsed = JSON.parse(task.subtasks) as Subtask[]
        return parsed.map((subtask, index) => ({
          ...subtask,
          id: subtask.id || index + 1
        }))
      } catch (error: unknown) {
        console.error('Error parsing subtasks:', error)
        return []
      }
    }
    return Array.isArray(task.subtasks) ? task.subtasks.map((subtask, index) => ({
      ...subtask,
      id: subtask.id || index + 1
    })) : []
  })()
  
  const subtasksCompleted = subtasksArray.filter((st: Subtask) => st.completed).length
  const subtasksTotal = subtasksArray.length

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg">
      {/* Task Card with long-press functionality */}
      <motion.div
        ref={cardRef}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg relative z-10"
        initial={{ scale: 1 }}
        animate={{ 
          scale: isLongPressing ? 0.98 : 1,
          backgroundColor: isLongPressing ? 'rgba(239, 68, 68, 0.05)' : undefined  // Subtle red background during long press
        }}
        transition={{ duration: 0.2 }}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onClick={handleClick}
      >
        <div className="p-4">
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
              {subtasksArray.length > 0 && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {subtasksCompleted} of {subtasksTotal} subtasks
                </div>
              )}
            </div>
            
            {/* Only show expand button if there are subtasks */}
            {subtasksArray.length > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onExpandTask && onExpandTask(task.id)
                }}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            
            <div className={`w-2 h-10 rounded-full ${
              task.categoryColor ? 
                task.categoryColor.replace('from-', 'bg-').split(' ')[0] : 
                'bg-gray-300'
            }`} />
          </div>
          
          {/* Subtasks section */}
          {isExpanded && subtasksArray.length > 0 && (
            <div className="mt-3 pl-8 space-y-2">
              {subtasksArray.map((subtask: Subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onToggleSubtask && onToggleSubtask(task.id, subtask.id)
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className={`text-xs ${
                    subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
