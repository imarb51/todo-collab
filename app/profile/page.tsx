"use client"

import { useState, useEffect } from "react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Plus, Check, Clock, Sun, Moon, Monitor, Camera, Upload, Loader2 } from "lucide-react"
import { AddFriendModal } from "@/components/add-friend-modal"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

// This will help suppress hydration warnings from browser extensions
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient ? <>{children}</> : null
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [personalGoal, setPersonalGoal] = useState(
    "Complete 5 tasks every day and maintain a healthy work-life balance."
  );
  const { theme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sample friends data
  const friends = [
    { id: 1, name: "Sarah Johnson", avatar: "/placeholder.svg?height=40&width=40", status: "accepted" },
    { id: 2, name: "Michael Chen", avatar: "/placeholder.svg?height=40&width=40", status: "accepted" },
    { id: 3, name: "Priya Sharma", avatar: "/placeholder.svg?height=40&width=40", status: "pending" },
  ];

  // Load user data when the component mounts
  useEffect(() => {
    if (session?.user) {
      // Set the profile image from the session if available
      if (session.user.image) {
        setProfileImage(session.user.image);
      }
      setIsLoading(false);
    }
  }, [session]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set loading state
    setIsSaving(true);
    
    try {
      // Convert file to base64
      const base64Image = await convertFileToBase64(file);
      
      // Set image in local state for immediate UI update
      setProfileImage(base64Image);
      
      // Send image to API
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile image');
      }

      // Get updated user data
      const updatedUser = await response.json();
      
      // Update the session with the new image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: base64Image,
        },
      });

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile</h1>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            {/* Profile Image */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
                  </div>
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className={`absolute bottom-0 right-0 ${isSaving ? 'bg-gray-500' : 'bg-violet-600 hover:bg-violet-700'} text-white p-2 rounded-full cursor-pointer transition-colors duration-300 ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSaving}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {isLoading ? (
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                ) : (
                  session?.user?.name || "User"
                )}
              </h2>
              {isLoading ? (
                <span className="block text-gray-500 dark:text-gray-400">
                  <span className="inline-block h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mt-2"></span>
                </span>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {session?.user?.email || "No email"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Personal Goal</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          {isEditingGoal ? (
            <div className="space-y-4">
              <Textarea
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={() => setIsEditingGoal(false)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">{personalGoal}</p>
          )}
        </div>

        {/* Friends Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Friends</h3>
            <Button
              variant="outline"
              onClick={() => setShowAddFriendModal(true)}
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </div>

          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-800 dark:text-gray-100">{friend.name}</span>
                </div>
                {friend.status === "accepted" ? (
                  <div className="flex items-center text-green-500">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Friend Modal */}
      <AddFriendModal open={showAddFriendModal} onOpenChange={setShowAddFriendModal} />

      {/* Bottom Navigation */}
      <BottomNavbar activePage="profile" />
    </div>
  )
}
