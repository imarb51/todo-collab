"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Users, Calendar, ListChecks, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, HTMLMotionProps } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { signIn } from "next-auth/react"

type MotionDivProps = HTMLMotionProps<"div"> & { className?: string }
type MotionH1Props = HTMLMotionProps<"h1"> & { className?: string }
type MotionPProps = HTMLMotionProps<"p"> & { className?: string }

const MotionDiv = motion.div as React.FC<MotionDivProps>
const MotionH1 = motion.h1 as React.FC<MotionH1Props>
const MotionP = motion.p as React.FC<MotionPProps>

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  // Handle client-side only code to prevent hydration issues
  useEffect(() => {
    setMounted(true)
    
    // Check for error in URL
    const searchParams = new URLSearchParams(window.location.search)
    const error = searchParams.get('error')
    if (error) {
      console.error("Auth error from URL:", error)
      setAuthError(error)
      setIsAuthOpen(true)
      
      // Clear the error from the URL to prevent it from showing again on refresh
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)
    
    try {
      // For login
      if (isLogin) {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })
        
        if (result?.error) {
          setAuthError(result.error)
        } else if (result?.ok) {
          setIsAuthOpen(false)
          router.push('/dashboard')
        }
      } 
      // For signup
      else {
        // Make API call to your signup endpoint
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          setAuthError(data.error || 'Failed to create account')
        } else {
          // Auto login after successful signup
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          })
          
          if (result?.error) {
            setAuthError(result.error)
          } else if (result?.ok) {
            setIsAuthOpen(false)
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Use redirect: true to ensure the user is redirected to the Google auth page
      // and then to the dashboard after successful authentication
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true
      })
      // Note: Code after this point won't execute due to the redirect
    } catch (error) {
      console.error("Google sign-in error:", error)
      setAuthError("Failed to sign in with Google. Please try again.")
      setIsLoading(false)
    }
  }

  // Return null during initial render to prevent hydration mismatches
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <MotionDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg mb-6"
            >
              <div className="text-violet-600 dark:text-violet-400">
                <CheckCircle className="h-16 w-16" />
              </div>
            </MotionDiv>
            <MotionH1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            >
              Todo Collab
            </MotionH1>
            <MotionP
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Collaborate and achieve more together
            </MotionP>
            <MotionDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </MotionDiv>
          </div>

          {/* Features Grid */}
          <MotionDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-violet-100 dark:bg-violet-900 p-3 rounded-lg mr-4">
                  <Users className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Team Collaboration</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Work together with your team members to achieve common goals and track progress in real-time.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Smart Calendar</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Plan and organize your tasks with our intuitive calendar interface and never miss a deadline.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg mr-4">
                  <ListChecks className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Task Management</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Create, organize, and track tasks with subtasks, due dates, and priority levels.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Progress Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your progress with visual indicators and stay motivated to complete your tasks.
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {authError === "OAuthSignin" 
                  ? "There was a problem with Google sign-in. Please try again." 
                  : authError === "OAuthCallback"
                  ? "There was a problem with the Google callback. Please try again."
                  : authError === "OAuthCreateAccount"
                  ? "There was a problem creating your account. Please try again."
                  : authError === "EmailCreateAccount"
                  ? "There was a problem creating your account. Please try again."
                  : authError === "Callback"
                  ? "There was a problem with the authentication callback. Please try again."
                  : authError === "OAuthAccountNotLinked"
                  ? "This email is already associated with another account. Please sign in using the original provider."
                  : authError === "EmailSignin"
                  ? "There was a problem sending the email. Please try again."
                  : authError === "CredentialsSignin"
                  ? "The credentials you provided are invalid. Please try again."
                  : authError === "SessionRequired"
                  ? "You must be signed in to access this page."
                  : "An error occurred during authentication. Please try again."}
              </div>
            )}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center relative"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isLogin ? "Logging in..." : "Signing up..."}
                  </div>
                ) : (
                  isLogin ? "Login" : "Sign Up"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
