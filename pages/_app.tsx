import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import { onAuthStateChange } from '@/lib/auth'

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
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