"use client"

import { useState } from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { BottomNavbar } from "@/components/bottom-navbar"
import { CategorySection } from "@/components/category-section"
import { TaskList } from "@/components/task-list"
import { AddTaskModal } from "@/components/add-task-modal"
import { format } from "date-fns"
import { useTheme } from "next-themes"

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



export default function Dashboard() {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const { theme } = useTheme()
  
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task])
    setShowAddTaskModal(false)
  }

  // Mock function to simulate fetching tasks
  const fetchTasks = async (): Promise<Task[]> => {
    // In a real app, this would be an API call
    return [
      {
        id: 1,
        title: "Team Meeting",
        completed: false,
        category: "Work",
        categoryColor: "from-blue-500 to-blue-600",
        subtasks: [
          { id: 1, title: "Prepare agenda", completed: false },
          { id: 2, title: "Send invites", completed: true }
        ],
      },
      {
        id: 2,
        title: "Gym Session",
        completed: false,
        category: "Fitness",
        categoryColor: "from-green-500 to-green-600",
        subtasks: [
          { id: 3, title: "Warm up", completed: false },
          { id: 4, title: "Core workout", completed: false }
        ],
      },
    ]
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to))",
        paddingBottom: "5rem"
      }}
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: theme === "dark" ? "rgba(41, 39, 39, 0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          padding: "1.5rem",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          position: "sticky", 
          top: 0,
          zIndex: 10
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </motion.header>

      <main className="p-6 max-w-4xl mx-auto relative">
        <AddTaskModal 
          open={showAddTaskModal} 
          onOpenChange={setShowAddTaskModal}
          onAddTask={handleAddTask}
        />
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CategorySection />
        </motion.div>

        {/* Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginTop: "3rem" }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Today's Tasks</h2>
          <TaskList tasks={tasks} />
        </motion.div>
      </main>
      {/* Bottom Navigation */}
      <BottomNavbar activePage="home" />
    </motion.div>
  )
}
