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
import convertFileToBase64 from "../../lib/convertFileToBase64";

export default function ProfileClient() {
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

  // More robust session handling with better loading states
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // If we have a session and it has a user
        if (session?.user) {
          // Always prioritize the session image if it exists
          if (session.user.image) {
            setProfileImage(session.user.image);
            console.log("Loaded profile image from session:", session.user.image.substring(0, 50) + "...");
          }
          
          // Ensure we're not in a loading state anymore
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [session]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const base64Image = await convertFileToBase64(file);
      setProfileImage(base64Image);
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      if (!response.ok) throw new Error('Failed to update profile image');
      const updatedUser = await response.json();
      await updateSession({ user: updatedUser });
      toast({ title: 'Profile updated' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not update profile' });
    } finally {
      setIsSaving(false);
    }
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
            <div className="relative mb-6">
              <Avatar className="w-32 h-32">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile image" />
                ) : (
                  <AvatarFallback className="text-3xl">
  {isLoading ? (
    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
  ) : (
    session?.user?.name?.[0]
  )}
</AvatarFallback>
                )}
              </Avatar>
              <label htmlFor="profile-image" className={`absolute bottom-0 right-0 ${isSaving ? 'bg-gray-500' : 'bg-violet-600 hover:bg-violet-700'} text-white p-2 rounded-full cursor-pointer transition-colors duration-300 ${isSaving ? 'cursor-not-allowed' : ''}`}>
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSaving} />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{isLoading ? <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div> : session?.user?.name || 'User'}</h2>
              {isLoading ? (
                <span className="block text-gray-500 dark:text-gray-400"><span className="inline-block h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mt-2"></span></span>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{session?.user?.email || 'No email'}</p>
              )}
            </div>
          </div>
        </div>
        {/* Other sections... */}
      </main>
      <AddFriendModal open={showAddFriendModal} onOpenChange={setShowAddFriendModal} />
      <BottomNavbar activePage="profile" />
    </div>
  );
}
