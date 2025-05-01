"use client"

import { useState } from "react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Clock, Check } from "lucide-react"
import { AvatarGroup } from "@/components/avatar-group"

export default function GroupTasksPage() {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)

  // Sample group tasks data
  const groupTasks = [
    {
      id: 1,
      title: "Prepare project presentation",
      completed: false,
      category: "Work",
      categoryColor: "bg-blue-500",
      dueDate: "Tomorrow, 5:00 PM",
      members: [
        { id: 1, name: "You", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
        { id: 2, name: "Sarah", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
        { id: 3, name: "Michael", avatar: "/placeholder.svg?height=32&width=32", status: "pending" },
      ],
      subtasks: [
        { id: 101, title: "Create slides", completed: true },
        { id: 102, title: "Prepare talking points", completed: true },
        { id: 103, title: "Practice presentation", completed: false },
      ],
    },
    {
      id: 2,
      title: "Weekly grocery shopping",
      completed: false,
      category: "Shopping",
      categoryColor: "bg-yellow-500",
      dueDate: "Today, 8:00 PM",
      members: [
        { id: 1, name: "You", avatar: "/placeholder.svg?height=32&width=32", status: "pending" },
        { id: 4, name: "Jessica", avatar: "/placeholder.svg?height=32&width=32", status: "pending" },
      ],
      subtasks: [
        { id: 201, title: "Fruits and vegetables", completed: false },
        { id: 202, title: "Dairy products", completed: false },
        { id: 203, title: "Snacks", completed: false },
      ],
    },
    {
      id: 3,
      title: "Plan weekend trip",
      completed: true,
      category: "Travel",
      categoryColor: "bg-teal-500",
      dueDate: "Completed",
      members: [
        { id: 1, name: "You", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
        { id: 2, name: "Sarah", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
        { id: 3, name: "Michael", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
        { id: 4, name: "Jessica", avatar: "/placeholder.svg?height=32&width=32", status: "completed" },
      ],
      subtasks: [
        { id: 301, title: "Book accommodation", completed: true },
        { id: 302, title: "Plan activities", completed: true },
        { id: 303, title: "Pack essentials", completed: true },
      ],
    },
  ]

  const toggleExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  return (
    <div className="min-h-screen bg-violet-50 pb-20">
      {/* Header */}
      <header className="bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-violet-900">Group Tasks</h1>
      </header>

      <main className="p-4 space-y-4">
        {groupTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center p-4">
              <div className={`${task.categoryColor} w-1.5 h-16 rounded-full mr-4`} />

              <Checkbox checked={task.completed} className="mr-3 h-5 w-5 border-2 border-violet-300" />

              <div className="flex-1">
                <p className={`text-base ${task.completed ? "line-through text-gray-400" : "text-violet-900"}`}>
                  {task.title}
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-violet-500 mr-3">{task.category}</p>
                  <p className="text-xs text-violet-500">{task.dueDate}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => toggleExpand(task.id)} className="ml-2 p-1 h-8 w-8">
                {expandedTaskId === task.id ? (
                  <ChevronUp className="h-5 w-5 text-violet-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-violet-500" />
                )}
              </Button>
            </div>

            {/* Task Members */}
            <div className="px-4 pb-3 flex items-center">
              <AvatarGroup>
                {task.members.map((member) => (
                  <div key={member.id} className="relative">
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.status === "completed" ? (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
                        <Clock className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </AvatarGroup>
            </div>

            {/* Subtasks */}
            {expandedTaskId === task.id && task.subtasks.length > 0 && (
              <div className="bg-violet-50 px-4 py-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center py-2 pl-8">
                    <Checkbox checked={subtask.completed} className="mr-3 h-4 w-4 border-2 border-violet-300" />
                    <p className={`text-sm ${subtask.completed ? "line-through text-gray-400" : "text-violet-800"}`}>
                      {subtask.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Bottom Navigation */}
      <BottomNavbar activePage="home" />
    </div>
  )
}
