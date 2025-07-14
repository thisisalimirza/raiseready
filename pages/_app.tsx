import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import { onAuthStateChange } from '@/lib/auth'

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current auth state immediately
    const checkAuthState = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth')
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)
      } catch (error) {
        console.error('Error checking auth state:', error)
        setLoading(false)
      }
    }

    // Check immediately
    checkAuthState()

    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth state check timed out, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    return () => {
      authListener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Component 
      {...pageProps} 
      user={user}
      loading={loading}
    />
  )
}