"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChromeIcon as Google } from "lucide-react"
import { signIn } from "next-auth/react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log("Starting Google sign-in process...")
      await signIn("google", { 
        callbackUrl: "/dashboard"
      })
    } catch (error) {
      console.error("Google sign-in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/90 border border-violet-100 dark:border-violet-800 shadow-xl rounded-2xl" aria-describedby="auth-description">
        <DialogTitle className="text-xl font-bold text-center mb-2">Welcome to Todo Collab</DialogTitle>
        <DialogDescription id="auth-description" className="text-center mb-6">
          Sign in with your Google account to continue
        </DialogDescription>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center mb-2">
            <Google className="h-8 w-8 text-violet-600 dark:text-violet-300" />
          </div>
          
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
            We use Google for authentication to provide a secure and seamless experience.
            Your account will be created automatically if you don't already have one.
          </p>
          
          <Button
            type="button"
            className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Google className="h-5 w-5" />
            )}
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
