import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signInWithEmail } from '@/lib/auth'
import { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function SignIn({ user, loading }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [message, setMessage] = useState('')

  // Use useEffect for redirects to avoid hooks order issues
  useEffect(() => {
    if (user && !loading) {
      if (user.payment_status === 'paid') {
        router.push('/dashboard')
      } else {
        // User is authenticated but hasn't paid, redirect to landing
        router.push('/landing')
      }
    }
  }, [user, loading, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)
    setMessage('')

    try {
      await signInWithEmail(email)
      setMessage('Check your email for the magic link!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          RaiseReady
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your personalized salary negotiation toolkit
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSigningIn ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 p-3 text-center text-sm bg-blue-50 text-blue-700 rounded-md">
              {message}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">How it works</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p>• Enter your job details and achievements</p>
              <p>• Get market salary data and negotiation scripts</p>
              <p>• Practice with AI role-play scenarios</p>
              <p>• Download your personalized raise kit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}