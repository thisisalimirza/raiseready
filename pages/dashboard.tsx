import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { User, Pack } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function Dashboard({ user, loading }: Props) {
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [loadingPacks, setLoadingPacks] = useState(true)
  const [error, setError] = useState('')

  // Use useEffect for redirects to avoid hooks order issues
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to signin
        router.push('/signin')
      } else if (user.payment_status !== 'paid') {
        // Authenticated but not paid, redirect to landing
        router.push('/landing')
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchPacks()
    } else if (!loading) {
      // If no user and not loading, stop the loading state
      setLoadingPacks(false)
    }
  }, [user, loading])

  const fetchPacks = async () => {
    try {
      console.log('Fetching packs for user:', user?.id)
      
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      console.log('Packs query result:', { data, error })

      if (error) {
        throw error
      }

      setPacks(data || [])
    } catch (error) {
      setError('Failed to load packs')
      console.error('Error fetching packs:', error)
    } finally {
      setLoadingPacks(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const downloadPDF = async (pack: Pack) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to download PDF')
      }

      const response = await fetch(`/api/pdf/${pack.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${pack.job_title}-negotiation-script.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const deletePack = async (pack: Pack) => {
    if (!confirm(`Are you sure you want to delete the "${pack.job_title}" raise pack? This action cannot be undone.`)) {
      return
    }

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to delete pack')
      }

      const response = await fetch(`/api/pack/${pack.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete pack')
      }
      
      // Remove the pack from the local state
      setPacks(prevPacks => prevPacks.filter(p => p.id !== pack.id))
      
      alert('Pack deleted successfully!')
    } catch (error) {
      console.error('Error deleting pack:', error)
      alert('Failed to delete pack. Please try again.')
    }
  }

  if (loading || loadingPacks) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RaiseReady</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                New Raise Pack
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {packs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No raise packs yet</h3>
              <p className="text-gray-600 mb-4">Create your first raise pack to get started with salary negotiations</p>
              <button
                onClick={() => router.push('/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Your First Pack
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Raise Packs</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packs.map((pack) => (
                  <div key={pack.id} className="bg-white rounded-lg shadow p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{pack.job_title}</h3>
                      <p className="text-gray-600">{pack.city_or_remote}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Created {new Date(pack.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">${pack.current_salary.toLocaleString()}</span>
                      </div>
                      {pack.target_salary && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium">${pack.target_salary.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Market Avg:</span>
                        <span className="font-medium">${pack.market_data.average.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => downloadPDF(pack)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        Download Negotiation Script
                      </button>
                      <button
                        onClick={() => router.push(`/pack/${pack.id}/roleplay`)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        Open Role-Play
                      </button>
                      <button
                        onClick={() => deletePack(pack)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      >
                        Delete Pack
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}