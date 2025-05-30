"use client"

import { motion, useAnimation } from "framer-motion"
import { Trash2, ChevronDown } from "lucide-react"
import { useRef, useState } from "react"

interface Subtask {
  id: number
  title: string
  completed: boolean
}

interface SwipeableTaskProps {
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

export function SwipeableTask({ 
  task, 
  onDelete, 
  onToggle, 
  onToggleSubtask,
  onExpandTask,
  isExpanded = false
}: SwipeableTaskProps) {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const deleteThreshold = -100 // Distance to trigger deletion
  const dragRef = useRef<HTMLDivElement>(null)
  
  
  // Handler for when swipe action ends
  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.x < deleteThreshold) {
      // Reset position but with a slower animation to give visual feedback
      controls.start({
        x: 0,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 40 
        }
      })
      
      // Show confirmation dialog instead of immediate deletion
      onDelete(task.id)
    } else {
      // Reset position with spring animation
      controls.start({
        x: 0,
        transition: { 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }
      })
    }
    setIsDragging(false)
  }
  
  // Handler for during drag
  const handleDrag = (event: any, info: any) => {
    setIsDragging(true)
    if (info.offset.x > 0) {
      // Prevent dragging right
      controls.set({ x: 0 })
    }
    
    // If dragging far left, show visual feedback
    if (info.offset.x < deleteThreshold) {
      controls.set({ 
        x: info.offset.x,
        backgroundColor: "rgba(239, 68, 68, 0.1)" // Light red background
      })
    } else {
      controls.set({ x: info.offset.x })
    }
  }
  
  // Handle click event without triggering after drag
  const handleTaskClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      return
    }
    
    // Normal click behavior can go here if needed
  }
  
  // Parse subtasks if it's a string (JSON format) and ensure each has a valid ID
  const subtasksArray = (() => {
    if (!task.subtasks) return [];
    if (typeof task.subtasks === 'string') {
      try {
        const parsed = JSON.parse(task.subtasks) as Subtask[];
        return parsed.map((subtask, index) => ({
          ...subtask,
          id: subtask.id || index + 1
        }));
      } catch (error: unknown) {
        console.error('Error parsing subtasks:', error);
        return [];
      }
    }
    return Array.isArray(task.subtasks) ? task.subtasks.map((subtask, index) => ({
      ...subtask,
      id: subtask.id || index + 1
    })) : [];
  })();
  
  const subtasksCompleted = subtasksArray.filter((st: Subtask) => st.completed).length;
  const subtasksTotal = subtasksArray.length;

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg">
      {/* Delete indicator zone (shows when swiping) */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-lg">
        <Trash2 className="h-5 w-5 text-white" />
      </div>
      
      {/* Task Card - swipeable */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg relative z-10"
        ref={dragRef}
        style={{ x: 0 }} // Initial style instead of motion's initial
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          onClick={handleTaskClick}
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
                  e.stopPropagation();
                  onExpandTask && onExpandTask(task.id);
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
                      e.stopPropagation();
                      onToggleSubtask && onToggleSubtask(task.id, subtask.id);
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
    </div>
  )
}