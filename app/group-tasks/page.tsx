"use client"

import { useState, useEffect } from "react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Clock, Check, Plus, MessageCircle, Trash2, Send } from "lucide-react"
import { AvatarGroup } from "@/components/avatar-group"
import { AddTaskModal } from "@/components/add-task-modal"
import { format, formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface GroupTaskAssignee {
  id: string;
  userId: string;
  status: string;
  user: User;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: User;
}

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface GroupTask {
  id: string;
  title: string;
  completed: boolean;
  category: string | null;
  categoryColor: string | null;
  subtasks: Subtask[] | null;
  dueDate: string | null;
  ownerId: string;
  assignees: GroupTaskAssignee[];
  comments: Comment[];
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export default function GroupTasksPage() {
  const { toast } = useToast();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [ownedTasks, setOwnedTasks] = useState<GroupTask[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<GroupTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GroupTask | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  useEffect(() => {
    fetchGroupTasks();
  }, []);

  const fetchGroupTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/group-tasks");
      const data = await response.json();
      
      if (response.ok) {
        setOwnedTasks(data.ownedTasks || []);
        setAssignedTasks(data.assignedTasks || []);
      } else {
        console.error("Failed to fetch group tasks:", data.error);
        toast({
          title: "Error",
          description: "Failed to fetch group tasks. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching group tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch group tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleAddTask = (task: GroupTask) => {
    setOwnedTasks([task, ...ownedTasks]);
  };

  const handleToggleTaskCompletion = async (task: GroupTask) => {
    if (isCompletingTask) return;
    
    setIsCompletingTask(true);
    try {
      const response = await fetch(`/api/group-tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        // Update local state
        if (task.ownerId === "currentUser") { // Replace with actual user ID check
          setOwnedTasks(
            ownedTasks.map((t) =>
              t.id === task.id ? { ...t, completed: !t.completed } : t
            )
          );
        } else {
          setAssignedTasks(
            assignedTasks.map((t) =>
              t.id === task.id ? { ...t, completed: !t.completed } : t
            )
          );
        }

        toast({
          title: "Success",
          description: task.completed ? "Task marked as incomplete" : "Task marked as complete",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleToggleSubtaskCompletion = async (task: GroupTask, subtaskId: number) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );

    try {
      const response = await fetch(`/api/group-tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subtasks: updatedSubtasks,
        }),
      });

      if (response.ok) {
        // Update local state
        const updateTask = (tasks: GroupTask[]) =>
          tasks.map((t) =>
            t.id === task.id ? { ...t, subtasks: updatedSubtasks } : t
          );

        setOwnedTasks(updateTask(ownedTasks));
        setAssignedTasks(updateTask(assignedTasks));
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update subtask");
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subtask. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/group-tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOwnedTasks(ownedTasks.filter((task) => task.id !== taskId));
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openCommentDialog = (task: GroupTask) => {
    setSelectedTask(task);
    setShowCommentDialog(true);
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/group-tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const updatedTask = {
          ...selectedTask,
          comments: [data, ...selectedTask.comments],
        };

        // Update in the appropriate list
        if (ownedTasks.some((task) => task.id === selectedTask.id)) {
          setOwnedTasks(
            ownedTasks.map((task) => (task.id === selectedTask.id ? updatedTask : task))
          );
        } else {
          setAssignedTasks(
            assignedTasks.map((task) => (task.id === selectedTask.id ? updatedTask : task))
          );
        }

        setSelectedTask(updatedTask);
        setCommentText("");
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      } else {
        throw new Error(data.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    const now = new Date();
    
    // If the date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    }
    
    // If the date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    }
    
    // If the date is within the next 7 days
    if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${format(date, "EEEE")}, ${format(date, "h:mm a")}`;
    }
    
    // Otherwise, show the full date
    return format(date, "MMM d, yyyy, h:mm a");
  };

  const renderTasks = (tasks: GroupTask[], isOwned: boolean) => {
    if (tasks.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500">
            {isOwned ? "You haven't created any group tasks yet." : "You don't have any assigned tasks."}
          </p>
        </div>
      );
    }

    return tasks.map((task) => (
      <div key={task.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center p-4">
          <div className={`${task.categoryColor?.split(" ")[0] || "bg-violet-500"} w-1.5 h-16 rounded-full mr-4`} />

          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => handleToggleTaskCompletion(task)}
            className="mr-3 h-5 w-5 border-2 border-violet-300" 
          />

          <div className="flex-1">
            <p className={`text-base ${task.completed ? "line-through text-gray-400" : "text-violet-900"}`}>
              {task.title}
            </p>
            <div className="flex items-center mt-1">
              <p className="text-xs text-violet-500 mr-3">{task.category}</p>
              <p className="text-xs text-violet-500">
                {task.completed ? "Completed" : (task.dueDate ? formatDueDate(task.dueDate) : "No due date")}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openCommentDialog(task)}
              className="p-1 h-8 w-8 text-violet-500 hover:text-violet-700"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            {isOwned && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleExpand(task.id)} 
              className="p-1 h-8 w-8 text-violet-500 hover:text-violet-700"
            >
              {expandedTaskId === task.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Task Members */}
        <div className="px-4 pb-3 flex items-center">
          <AvatarGroup>
            {task.assignees.map((assignee) => (
              <div key={assignee.id} className="relative">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-violet-200 text-violet-700">
                    {(assignee.user.name?.[0] || assignee.user.email[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {assignee.status === "completed" ? (
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
          
          {task.comments && task.comments.length > 0 && (
            <Badge variant="outline" className="ml-3 text-violet-600 border-violet-300">
              {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Subtasks */}
        {expandedTaskId === task.id && task.subtasks && task.subtasks.length > 0 && (
          <div className="bg-violet-50 px-4 py-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center py-2 pl-8">
                <Checkbox 
                  checked={subtask.completed} 
                  onCheckedChange={() => handleToggleSubtaskCompletion(task, subtask.id)}
                  className="mr-3 h-4 w-4 border-2 border-violet-300" 
                />
                <p className={`text-sm ${subtask.completed ? "line-through text-gray-400" : "text-violet-800"}`}>
                  {subtask.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-violet-50 pb-20">
      {/* Header */}
      <header className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-violet-900">Group Tasks</h1>
      </header>

      <main className="p-4 space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : (
          <>
            {ownedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-violet-800 px-1">Tasks You Created</h2>
                {renderTasks(ownedTasks, true)}
              </div>
            )}

            {assignedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-violet-800 px-1">Tasks Assigned to You</h2>
                {renderTasks(assignedTasks, false)}
              </div>
            )}

            {ownedTasks.length === 0 && assignedTasks.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-500 mb-4">You don't have any group tasks yet.</p>
                <Button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Create Your First Group Task
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Task Button */}
      <Button
        onClick={() => setShowAddTaskModal(true)}
        className="fixed bottom-24 right-6 bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onAddTask={handleAddTask}
      />

      {/* Comments Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mx-4 sm:mx-auto">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Task Comments
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 space-y-4">
            {/* Task Title */}
            <div className="bg-violet-50 dark:bg-gray-700/30 p-3 rounded-lg">
              <h3 className="font-medium text-violet-900 dark:text-violet-300">{selectedTask?.title}</h3>
              {selectedTask?.dueDate && (
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                  Due: {formatDueDate(selectedTask.dueDate)}
                </p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800"
              >
                {isSubmittingComment ? "Sending..." : "Add Comment"}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments</h4>
              <ScrollArea className="h-[200px] rounded-md border border-gray-200 dark:border-gray-700 p-2">
                {selectedTask?.comments && selectedTask.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-violet-200 text-violet-700 text-xs">
                              {(comment.user.name?.[0] || comment.user.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                              {comment.user.name || comment.user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavbar activePage="home" />
    </div>
  )
}
