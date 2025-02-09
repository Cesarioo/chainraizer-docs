'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Dialog, DialogContent } from "./ui/dialog"
import { AuthError } from '@supabase/supabase-js'
import { Wallet } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error

      // Just close the modal - the auth state change will trigger the callback
      onClose()
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpRedirect = () => {
    window.open("https://app.raizer.fi/connect?mode=sign-up&ref=Cesarioo", "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 shadow-xl">
        <CardHeader className="space-y-1 px-0 pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome back!
          </CardTitle>
          <CardDescription>
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4 px-0">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="satoshi@nakamoto.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full !mt-9 !mb-4 relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] button-shine
                ${loading ? 'opacity-70' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'}
              `}
              disabled={loading}
            >
              <span className="relative z-10 font-semibold text-white">
                {loading ? "Processing..." : "Sign in"}
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="w-full">
              <Button
                variant="outline"
                type="button"
                className="w-full border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                Connect to my account with wallet
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-0 pt-6">
            <div className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleSignUpRedirect}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 