"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SwipeableTask } from "./swipeable-task"

interface Task {
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

interface TaskListProps {
  tasks: Task[]
  onDeleteTask?: (id: number) => void
  onToggleTask?: (id: number) => void
}

// Sample task data
const defaultTasks = [
  {
    id: 1,
    title: "Finalize project proposal",
    completed: false,
    category: "Work",
    categoryColor: "from-blue-500 to-blue-600",
    subtasks: [
      { id: 101, title: "Research competitors", completed: true },
      { id: 102, title: "Create outline", completed: false },
      { id: 103, title: "Draft executive summary", completed: false },
    ],
  },
  {
    id: 2,
    title: "Study for exam",
    completed: false,
    category: "Study",
    categoryColor: "from-purple-500 to-purple-600",
    subtasks: [
      { id: 201, title: "Review chapter 1-3", completed: true },
      { id: 202, title: "Practice problems", completed: false },
    ],
  },
]

export function TaskList({ tasks = defaultTasks, onDeleteTask, onToggleTask }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [newTaskText, setNewTaskText] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [swipedTaskId, setSwipedTaskId] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  // Update local tasks when the prop changes
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const toggleTaskCompletion = (taskId: number) => {
    setLocalTasks(localTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const toggleSubtaskCompletion = (taskId: number, subtaskId: number) => {
    setLocalTasks(
      localTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
              ),
            }
          : task,
      ),
    )
  }

  const toggleExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const deleteTask = (taskId: number) => {
    setLocalTasks(localTasks.filter((task) => task.id !== taskId))
    setSwipedTaskId(null)
  }

  const handleTouchStart = (e: React.TouchEvent, taskId: number) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent, taskId: number) => {
    if (!touchStartX.current) return

    const touchEndX = e.touches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (diff > 50) {
      setSwipedTaskId(taskId)
    } else if (diff < -50) {
      setSwipedTaskId(null)
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = null
  }

  const addNewTask = () => {
    if (newTaskText.trim() === "") return

    const newTask = {
      id: Date.now(),
      title: newTaskText,
      completed: false,
      category: "Group",
      categoryColor: "from-violet-500 to-violet-600",
      subtasks: [],
    }

    setLocalTasks([...localTasks, newTask])
    setNewTaskText("")
    setIsAddTaskOpen(false)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {localTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'relative', overflow: 'hidden' }}
            onTouchStartCapture={(e: React.TouchEvent) => handleTouchStart(e, task.id)}
            onTouchMoveCapture={(e: React.TouchEvent) => handleTouchMove(e, task.id)}
            onTouchEndCapture={handleTouchEnd}
          >
            <motion.div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                swipedTaskId === task.id ? "translate-x-[-80px]" : ""
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center p-6">
                <div className={`bg-gradient-to-br ${task.categoryColor} w-2 h-14 rounded-full mr-6`} />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="h-6 w-6 rounded-full border-2"
                      />
                      <span
                        className={`text-lg font-medium ${
                          task.completed
                            ? "text-gray-400 dark:text-gray-500 line-through"
                            : "text-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(task.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {expandedTaskId === task.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedTaskId === task.id && task.subtasks.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginTop: "1rem", paddingLeft: "2.5rem" }}
                        className="space-y-3"
                      >
                        {task.subtasks.map((subtask) => (
                          <motion.div
                            key={subtask.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                          >
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                              className="h-5 w-5 rounded-full border-2"
                            />
                            <span
                              className={`text-sm ${
                                subtask.completed
                                  ? "text-gray-400 dark:text-gray-500 line-through"
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {subtask.title}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Delete Button */}
            <motion.div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ef4444',
                transition: 'opacity 300ms',
                opacity: swipedTaskId === task.id ? 1 : 0
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: swipedTaskId === task.id ? 1 : 0 }}
            >
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white p-4"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Group Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-24 right-6 bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100">Add Group Task</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="Enter task title..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
            />
            <Button
              onClick={addNewTask}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
