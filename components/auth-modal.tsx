"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
  const [activeTab, setActiveTab] = useState("login")

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden backdrop-blur-xl bg-white/80 border border-violet-100 shadow-xl rounded-2xl">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full rounded-none">
            <TabsTrigger value="login" className="data-[state=active]:bg-violet-50 py-4">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-violet-50 py-4">
              Signup
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="login" className="mt-0">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  onOpenChange(false)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-700">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  onOpenChange(false)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-700">
                  Create Account
                </Button>
              </form>
            </TabsContent>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-violet-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-violet-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 h-12 border-violet-200 hover:bg-violet-50"
              onClick={handleGoogleSignIn}
            >
              <Google className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
