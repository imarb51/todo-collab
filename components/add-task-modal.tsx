"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Users, X, Check, UserPlus, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  name: string | null;
  email: string;
}

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask?: (task: any) => void;
}

// Sample categories
const categories = [
  { id: 1, name: "Work", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
  { id: 2, name: "Study", color: "bg-purple-500", gradient: "from-purple-500 to-purple-600" },
  { id: 3, name: "Fitness", color: "bg-green-500", gradient: "from-green-500 to-green-600" },
  { id: 4, name: "Shopping", color: "bg-yellow-500", gradient: "from-yellow-500 to-yellow-600" },
  { id: 5, name: "Home", color: "bg-red-500", gradient: "from-red-500 to-red-600" },
  { id: 6, name: "Travel", color: "bg-teal-500", gradient: "from-teal-500 to-teal-600" },
]

export function AddTaskModal({ open, onOpenChange, onAddTask }: AddTaskModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [taskType, setTaskType] = useState("personal");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setTitle("");
      setDate(new Date());
      setTime("12:00");
      setSubtasks([""]);
      setSelectedCategory(categories[0]);
      setTaskType("personal");
      setSelectedFriends([]);
      setShowFriendSelector(false);
    }
  }, [open]);

  // Fetch friends when modal opens
  useEffect(() => {
    if (open && taskType === "group") {
      fetchFriends();
    }
  }, [open, taskType]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      
      if (response.ok) {
        setFriends(data.friends || []);
      } else {
        console.error("Failed to fetch friends:", data.error);
        toast({
          title: "Error",
          description: "Failed to fetch friends. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast({
        title: "Error",
        description: "Failed to fetch friends. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };

  const updateSubtask = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index: number) => {
    if (subtasks.length === 1) return;
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  const toggleFriend = (friend: Friend) => {
    if (selectedFriends.some(f => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleSaveTask = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Filter out empty subtasks
      const filteredSubtasks = subtasks
        .filter((st) => st.trim() !== "")
        .map((st) => ({
          title: st,
          completed: false,
        }));

      // Combine date and time
      let dueDateTime = date;
      if (date && time) {
        const [hours, minutes] = time.split(':').map(Number);
        dueDateTime = new Date(date);
        dueDateTime.setHours(hours, minutes);
      }

      // Prepare the task data structure with proper subtasks format
      const createdTask = {
        title,
        category: selectedCategory.name,
        categoryColor: selectedCategory.gradient,
        // Convert subtasks to proper format with id, title, and completed status
        subtasks: JSON.stringify(filteredSubtasks.map((st, index) => ({
          id: Date.now() + index, // Ensure each subtask has a unique ID
          title: st.title,
          completed: st.completed
        }))),
        dueDate: dueDateTime ? dueDateTime.toISOString() : null,
      };

      if (taskType === "personal") {
        // Create personal task
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createdTask),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Success",
            description: "Task created successfully",
          });
          onOpenChange(false);
          if (onAddTask) onAddTask(data);
        } else {
          throw new Error(data.message || "Failed to create task");
        }
      } else {
        // Create group task
        const assigneeIds = selectedFriends.map(friend => friend.id);
        
        // Use the same proper format for group tasks
        const groupTask = {
          title,
          category: selectedCategory.name,
          categoryColor: selectedCategory.gradient,
          subtasks: JSON.stringify(filteredSubtasks.map((st, index) => ({
            id: Date.now() + index, // Ensure each subtask has a unique ID
            title: st.title,
            completed: st.completed
          }))),
          dueDate: dueDateTime ? dueDateTime.toISOString() : null,
          assigneeIds,
        };
        
        const response = await fetch("/api/group-tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(groupTask),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Success",
            description: "Group task created successfully",
          });
          onOpenChange(false);
          if (onAddTask) onAddTask(data);
        } else {
          throw new Error(data.message || "Failed to create group task");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="relative w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl p-0 overflow-visible bg-white dark:bg-gray-900 shadow-2xl rounded-xl mx-auto border border-gray-100 dark:border-gray-800 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          aria-label="Close"
          type="button"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header with DialogTitle for accessibility */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            {taskType === "personal" ? "Create New Task" : "Create Group Task"}
          </DialogTitle>
          
          <Tabs defaultValue={taskType} onValueChange={setTaskType} className="mt-4">
            <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TabsTrigger 
                value="personal"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                Personal Task
              </TabsTrigger>
              <TabsTrigger 
                value="group"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all flex items-center justify-center gap-1.5"
                onClick={fetchFriends}
              >
                <Users className="h-4 w-4" /> Group Task
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <form className="space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Title
              </Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?" 
                className="h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              />
            </div>

            {/* Date and Time Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date & Time
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      {date ? format(date, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="relative">
                  <Input
                    type="time"
                    className="h-10 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <Clock className="h-4 w-4 absolute left-3 top-3 opacity-70" />
                </div>
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border transition-all",
                      selectedCategory.id === cat.id
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 ring-1 ring-violet-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700"
                    )}
                  >
                    <div className={`w-full h-10 rounded-md ${cat.color} mb-2`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subtasks
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addSubtask}
                  className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 h-8"
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={subtask}
                      onChange={(e) => updateSubtask(index, e.target.value)}
                      placeholder={`Subtask ${index + 1}`}
                      className="flex-1 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubtask(index)}
                      className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Remove subtask"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {subtasks.length === 0 && (
                  <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                    <span className="text-sm text-gray-500 dark:text-gray-400">No subtasks added yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Members Section - Only show for group tasks */}
            {taskType === "group" && (
              <>
                {/* Selected Friends */}
                {selectedFriends.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFriends.map((friend) => (
                      <Badge 
                        key={friend.id} 
                        className="bg-violet-100 text-violet-800 hover:bg-violet-200 flex items-center gap-1 px-2 py-1.5"
                      >
                        <span>{friend.name || friend.email}</span>
                        <button 
                          onClick={() => toggleFriend(friend)} 
                          className="text-violet-600 hover:text-violet-800 ml-1"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {showFriendSelector ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Team Members
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFriendSelector(false)}
                        className="h-8 text-violet-600 dark:text-violet-400"
                        type="button"
                      >
                        Done
                      </Button>
                    </div>
                    
                    {friends.length === 0 ? (
                      <div className="text-center py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No team members found. Add friends first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {friends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={undefined} alt={friend.name || friend.email} />
                                <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400">
                                  {(friend.name?.[0] || friend.email[0]).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {friend.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {friend.email}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleFriend(friend)}
                              className="flex-shrink-0"
                            >
                              {selectedFriends.some(f => f.id === friend.id) ? (
                                <div className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowFriendSelector(true)}
                    className="w-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-400 h-10"
                    type="button"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {selectedFriends.length > 0 ? "Manage Team Members" : "Add Team Members"}
                  </Button>
                )}
              </>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTask}
            disabled={isLoading}
            className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-600 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </div>
            ) : (
              'Create Task'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}