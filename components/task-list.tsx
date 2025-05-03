"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskItem } from "./task-item"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string | null;
  categoryColor: string | null;
  subtasks: Subtask[] | null;
  dueDate?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskListProps {
  tasks: Task[];
  onDeleteTask?: (id: string) => void;
  onToggleTask?: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: number) => void;
}

// Sample task data
const defaultTasks: Task[] = [
  {
    id: "1",
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
    id: "2",
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

export function TaskList({ tasks = defaultTasks, onDeleteTask, onToggleTask, onToggleSubtask }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null)

  // Update local tasks when the prop changes
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const toggleTaskCompletion = (taskId: string | number) => {
    const id = String(taskId);
    if (onToggleTask) {
      onToggleTask(id);
    } else {
      setLocalTasks(localTasks.map((task) => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ))
    }
  }

  const toggleSubtaskCompletion = (taskId: string | number, subtaskId: number) => {
    const id = String(taskId);
    if (onToggleSubtask) {
      onToggleSubtask(id, subtaskId);
    } else {
      setLocalTasks(
        localTasks.map((task) =>
          task.id === id && task.subtasks
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
  }

  const toggleExpand = (taskId: string | number) => {
    const id = String(taskId);
    setExpandedTaskId(expandedTaskId === id ? null : id)
  }

  // Prepare task for deletion (show confirmation dialog)
  const prepareDeleteTask = (taskId: string | number) => {
    const id = String(taskId);
    const task = localTasks.find(task => task.id === id);
    if (task) {
      setTaskToDelete({ id, title: task.title });
      setIsDeleteDialogOpen(true);
    }
  }
  
  // Actually delete the task after confirmation
  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    
    const id = taskToDelete.id;
    if (onDeleteTask) {
      onDeleteTask(id);
    } else {
      setLocalTasks(localTasks.filter((task) => task.id !== id))
    }
    
    // Reset the task to delete
    setTaskToDelete(null);
  }

  const addNewTask = () => {
    if (newTaskText.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskText,
      completed: false,
      category: "Personal",
      categoryColor: "from-violet-500 to-violet-600",
      subtasks: [],
    }

    setLocalTasks([...localTasks, newTask])
    setNewTaskText("")
    setIsAddTaskOpen(false)
  }

  return (
    <div className="space-y-2">
      {/* Delete Confirmation Dialog */}
      {taskToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteTask}
          taskTitle={taskToDelete.title}
        />
      )}
      
      {localTasks.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic text-center">
          Swipe left on a task to delete
        </p>
      )}
      <AnimatePresence>
        {localTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TaskItem
              task={task}
              onDelete={prepareDeleteTask}
              onToggle={toggleTaskCompletion}
              onToggleSubtask={toggleSubtaskCompletion}
              onExpandTask={toggleExpand}
              isExpanded={expandedTaskId === task.id}
            />
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
