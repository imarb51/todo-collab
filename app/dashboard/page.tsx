"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BottomNavbar } from "@/components/bottom-navbar"
import { CategorySection } from "@/components/category-section"
import { TaskList } from "@/components/task-list"
import { AddTaskModal } from "@/components/add-task-modal"
import { format } from "date-fns"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Simple fetch with no caching
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Could not load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load tasks when component mounts
  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);
  
  // Refresh tasks whenever dashboard becomes visible
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchTasks();
      }
    }
    
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  if (!mounted) return null; //



  const deleteTask = async (taskId: string) => {
    // Update the UI immediately for better user experience
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
      } else {
        // If deletion fails on the server, refresh the task list
        fetchTasks();
        throw new Error("Failed to delete task on the server");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Refreshing task list.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = (task: Task) => {
    // Simple approach - just add the new task to the beginning of the tasks array
    if (task && task.id) {
      // Directly update state with the new task at the beginning
      setTasks(prevTasks => [task, ...prevTasks]);
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } else {
      // If there's an issue with the task, fetch all tasks
      fetchTasks();
    }
  };

  const handleToggleTaskCompletion = async (taskId: string, completed: boolean) => {
    // Update UI immediately
    setTasks(currentTasks =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      )
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      if (!response.ok) {
        // Revert UI change if server update fails
        fetchTasks();
        throw new Error("Failed to update task on server");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Refreshing task list.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSubtaskCompletion = async (taskId: string, subtaskId: number, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    // Ensure subtasks is actually an array before using array methods
    const subtasksArray = Array.isArray(task.subtasks) ? task.subtasks : [];
    const updatedSubtasks = subtasksArray.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !completed } : subtask
    );

    // Update UI immediately
    setTasks(currentTasks =>
      currentTasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
      )
    );

    try {
      // Ensure subtasks are properly formatted before sending to the API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Ensure we send an array that the API can properly handle
          subtasks: updatedSubtasks,
        }),
      });

      if (!response.ok) {
        // Revert UI change if server update fails
        fetchTasks();
        throw new Error("Failed to update subtask on server");
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      toast({
        title: "Error",
        description: "Failed to update subtask. Refreshing data.",
        variant: "destructive",
      });
    }
  };

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
          <CategorySection tasks={tasks} />
        </motion.div>

        {/* Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginTop: "2rem", marginBottom: "5rem" }} // Increased spacing, added bottom margin
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Today's Tasks</h2>
            <Button
              onClick={() => setShowAddTaskModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <TaskList 
              tasks={tasks} 
              onDeleteTask={deleteTask}
              onToggleTask={(taskId) => {
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                  handleToggleTaskCompletion(taskId, task.completed);
                }
              }}
              onToggleSubtask={(taskId, subtaskId) => {
                const task = tasks.find(t => t.id === taskId);
                if (task && task.subtasks) {
                  // Ensure subtasks is actually an array before using array methods
                  const subtasksArray = Array.isArray(task.subtasks) ? task.subtasks : [];
                  const subtask = subtasksArray.find(st => st.id === subtaskId);
                  if (subtask) {
                    handleToggleSubtaskCompletion(taskId, subtaskId, subtask.completed);
                  }
                }
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any tasks yet.</p>
              <Button 
                onClick={() => setShowAddTaskModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Create Your First Task
              </Button>
            </div>
          )}
        </motion.div>

        {/* Removed floating add button as it's now at the top */}
      </main>
      {/* Bottom Navigation */}
      <BottomNavbar activePage="home" />
    </motion.div>
  )
}
