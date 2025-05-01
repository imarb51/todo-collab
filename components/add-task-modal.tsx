"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Users } from "lucide-react"

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask?: (task: {
    id: number
    title: string
    completed: boolean
    category: string
    categoryColor: string
    subtasks: { id: number; title: string; completed: boolean }[]
  }) => void
}

// Sample categories
const categories = [
  { id: 1, name: "Work", color: "bg-blue-500" },
  { id: 2, name: "Study", color: "bg-purple-500" },
  { id: 3, name: "Fitness", color: "bg-green-500" },
  { id: 4, name: "Shopping", color: "bg-yellow-500" },
  { id: 5, name: "Home", color: "bg-red-500" },
  { id: 6, name: "Travel", color: "bg-teal-500" },
]

export function AddTaskModal({ open, onOpenChange, onAddTask }: AddTaskModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [subtasks, setSubtasks] = useState<string[]>([""])
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [taskType, setTaskType] = useState("personal")

  const addSubtask = () => {
    setSubtasks([...subtasks, ""])
  }

  const updateSubtask = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks]
    updatedSubtasks[index] = value
    setSubtasks(updatedSubtasks)
  }

  const removeSubtask = (index: number) => {
    if (subtasks.length === 1) return
    const updatedSubtasks = subtasks.filter((_, i) => i !== index)
    setSubtasks(updatedSubtasks)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mx-4 sm:mx-auto">
        <DialogHeader className="p-6 pb-2">
          <Tabs defaultValue={taskType} onValueChange={setTaskType} className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-1">
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all duration-200 text-sm sm:text-base"
              >
                Add Task
              </TabsTrigger>
              <TabsTrigger 
                value="group" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all duration-200 text-sm sm:text-base flex items-center"
              >
                <Users className="mr-2 h-4 w-4" />
                Group Task
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DialogTitle className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-100">
            {taskType === "personal" ? "Add New Task" : "Add Group Task"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 pt-2 space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Task Title</Label>
              <Input 
                id="title" 
                placeholder="Enter task title" 
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400" 
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Subtasks</Label>
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={subtask}
                    onChange={(e) => updateSubtask(index, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                    className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubtask(index)}
                    className="h-10 w-10 text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addSubtask}
                className="w-full border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subtask
              </Button>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Category</Label>
              <ScrollArea className="w-full">
                <div className="flex space-x-3 pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all",
                        selectedCategory.id === category.id
                          ? "bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-300 dark:ring-violet-700"
                          : "hover:bg-violet-50 dark:hover:bg-violet-900/20",
                      )}
                    >
                      <div className={`${category.color} w-10 h-10 rounded-full`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                    </button>
                  ))}
                  <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-violet-300 dark:border-violet-700 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New</span>
                  </button>
                </div>
              </ScrollArea>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Group Task Options */}
            {taskType === "group" && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Share with</Label>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add People
                </Button>
              </div>
            )}

            {/* Save Button */}
            <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800">
              Save Task
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
