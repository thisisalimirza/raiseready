import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signInWithEmail } from '@/lib/auth'
import { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function Home({ user, loading }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [message, setMessage] = useState('')

  // Use useEffect for redirects to avoid hooks order issues
  useEffect(() => {
    if (!loading) {
      if (user && user.payment_status === 'paid') {
        // User is authenticated and paid, redirect to dashboard
        router.push('/dashboard')
      } else {
        // User is not authenticated or not paid, redirect to landing
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

  // This page should only show loading, then redirect
  // The magic link page is now separate
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}