"use client"

import { useState } from "react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Plus, Check, Clock, Sun, Moon, Monitor, Camera, Upload } from "lucide-react"
import { AddFriendModal } from "@/components/add-friend-modal"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "next-themes"

export default function ProfilePage() {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [personalGoal, setPersonalGoal] = useState(
    "Complete 5 tasks every day and maintain a healthy work-life balance.",
  )
  const { theme } = useTheme()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Sample friends data
  const friends = [
    { id: 1, name: "Sarah Johnson", avatar: "/placeholder.svg?height=40&width=40", status: "accepted" },
    { id: 2, name: "Michael Chen", avatar: "/placeholder.svg?height=40&width=40", status: "accepted" },
    { id: 3, name: "Priya Sharma", avatar: "/placeholder.svg?height=40&width=40", status: "pending" },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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
                {profileImage ? (
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
                className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full cursor-pointer transition-colors duration-300"
              >
                <Upload className="h-5 w-5" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Imran</h2>
              <p className="text-gray-500 dark:text-gray-400">imran@example.com</p>
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
