"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarCarousel } from "@/components/calendar-carousel"
import { TaskList } from "@/components/task-list"
import { BottomNavbar } from "@/components/bottom-navbar"

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

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    // Here you would typically fetch tasks for the selected date
    // For now, we'll use a mock function
    const mockTasks = await fetchTasksForDate(date)
    setTasks(mockTasks)
  }

  // Mock function to simulate fetching tasks
  const fetchTasksForDate = async (date: Date): Promise<Task[]> => {
    // In a real app, this would be an API call
    return [
      {
        id: 1,
        title: "Team Meeting",
        completed: false,
        category: "Work",
        categoryColor: "from-blue-500 to-blue-600",
        subtasks: [],
      },
      {
        id: 2,
        title: "Gym Session",
        completed: false,
        category: "Fitness",
        categoryColor: "from-green-500 to-green-600",
        subtasks: [],
      },
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Calendar Carousel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <CalendarCarousel
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Tasks for Selected Date */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Tasks for {format(selectedDate, "MMMM d")}
          </h2>
          <TaskList tasks={tasks} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavbar activePage="calendar" />
    </div>
  )
}
