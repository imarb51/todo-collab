"use client"

import { useState, useEffect } from "react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, UserPlus, Check, X, Mail, User, Users } from "lucide-react"
import { motion } from "framer-motion"

interface Friend {
  id: string;
  name: string | null;
  email: string;
  friendshipId: string;
}

export default function FriendsPage() {
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      
      if (response.ok) {
        setFriends(data.friends || []);
        setPendingSent(data.pendingSent || []);
        setPendingReceived(data.pendingReceived || []);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: friendEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPendingSent([...pendingSent, data]);
        setFriendEmail("");
        setShowAddFriendDialog(false);
        toast({
          title: "Success",
          description: "Friend request sent successfully",
        });
      } else {
        throw new Error(data.error || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const acceptedFriend = pendingReceived.find(f => f.friendshipId === friendshipId);
        if (acceptedFriend) {
          setFriends([...friends, acceptedFriend]);
          setPendingReceived(pendingReceived.filter(f => f.friendshipId !== friendshipId));
        }
        
        toast({
          title: "Success",
          description: "Friend request accepted",
        });
      } else {
        throw new Error(data.error || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectFriendRequest = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
        }),
      });

      if (response.ok) {
        // Update local state
        setPendingReceived(pendingReceived.filter(f => f.friendshipId !== friendshipId));
        
        toast({
          title: "Success",
          description: "Friend request rejected",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject friend request");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        setFriends(friends.filter(f => f.friendshipId !== friendshipId));
        
        toast({
          title: "Success",
          description: "Friend removed successfully",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove friend. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelFriendRequest = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        setPendingSent(pendingSent.filter(f => f.friendshipId !== friendshipId));
        
        toast({
          title: "Success",
          description: "Friend request cancelled",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel friend request");
      }
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 pb-20">
      {/* Header */}
      <header className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-violet-900">Friends</h1>
          <Button 
            onClick={() => setShowAddFriendDialog(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        </div>
      </header>

      <main className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-white rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900 rounded-md transition-all duration-200"
            >
              <Users className="mr-2 h-4 w-4" />
              Friends {friends.length > 0 && `(${friends.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="received" 
              className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900 rounded-md transition-all duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Requests {pendingReceived.length > 0 && `(${pendingReceived.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900 rounded-md transition-all duration-200"
            >
              <Mail className="mr-2 h-4 w-4" />
              Sent {pendingSent.length > 0 && `(${pendingSent.length})`}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* Friends Tab */}
              {activeTab === "friends" && (
                <div className="space-y-4">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <motion.div 
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-violet-200 text-violet-700">
                                {(friend.name?.[0] || friend.email[0]).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium text-violet-900">{friend.name || "User"}</p>
                              <p className="text-sm text-violet-600">{friend.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFriend(friend.friendshipId)}
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                      <User className="h-12 w-12 mx-auto text-violet-300 mb-2" />
                      <p className="text-gray-500 mb-4">You don't have any friends yet.</p>
                      <Button 
                        onClick={() => setShowAddFriendDialog(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Your First Friend
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Received Requests Tab */}
              {activeTab === "received" && (
                <div className="space-y-4">
                  {pendingReceived.length > 0 ? (
                    pendingReceived.map((friend) => (
                      <motion.div 
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-violet-200 text-violet-700">
                                {(friend.name?.[0] || friend.email[0]).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium text-violet-900">{friend.name || "User"}</p>
                              <p className="text-sm text-violet-600">{friend.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectFriendRequest(friend.friendshipId)}
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptFriendRequest(friend.friendshipId)}
                              className="bg-violet-600 hover:bg-violet-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                      <p className="text-gray-500">You don't have any pending friend requests.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sent Requests Tab */}
              {activeTab === "sent" && (
                <div className="space-y-4">
                  {pendingSent.length > 0 ? (
                    pendingSent.map((friend) => (
                      <motion.div 
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-violet-200 text-violet-700">
                                {(friend.name?.[0] || friend.email[0]).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium text-violet-900">{friend.name || "User"}</p>
                              <p className="text-sm text-violet-600">{friend.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelFriendRequest(friend.friendshipId)}
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                      <p className="text-gray-500">You haven't sent any friend requests.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Tabs>
      </main>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mx-4 sm:mx-auto">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Add Friend
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                <Input
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="Enter friend's email"
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your friend's email address to send them a friend request.
              </p>
            </div>

            <Button
              onClick={handleAddFriend}
              disabled={!friendEmail.trim() || isSubmitting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              {isSubmitting ? "Sending..." : "Send Friend Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavbar activePage="home" />
    </div>
  )
}