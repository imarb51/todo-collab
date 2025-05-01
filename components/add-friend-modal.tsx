"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus } from "lucide-react"

interface AddFriendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Sample search results
const searchResults = [
  { id: 1, name: "Alex Thompson", email: "alex@example.com", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Jessica Lee", email: "jessica@example.com", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "David Wilson", email: "david@example.com", avatar: "/placeholder.svg?height=40&width=40" },
]

export function AddFriendModal({ open, onOpenChange }: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteSent, setInviteSent] = useState<number[]>([])

  const handleSendInvite = (userId: number) => {
    setInviteSent([...inviteSent, userId])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Add Friends</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="pl-10 h-12"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-violet-900">{user.name}</p>
                    <p className="text-sm text-violet-600">{user.email}</p>
                  </div>
                </div>

                <Button
                  variant={inviteSent.includes(user.id) ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleSendInvite(user.id)}
                  disabled={inviteSent.includes(user.id)}
                  className={
                    inviteSent.includes(user.id)
                      ? "text-green-600 border-green-200"
                      : "bg-violet-600 hover:bg-violet-700"
                  }
                >
                  {inviteSent.includes(user.id) ? (
                    "Invited"
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Email Invite */}
          <div className="pt-4 border-t border-violet-100">
            <p className="text-sm text-violet-600 mb-3">
              Can't find who you're looking for? Send them an invite via email.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Enter email address" className="h-10" />
              <Button className="bg-violet-600 hover:bg-violet-700">Send</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
